const db = require("../config/firebase");
const nodemailer = require("nodemailer");
const { calcularHorasTrabalhadas, extrairMinutosDeString, formatarMinutosParaHoras } = require("../utils/timeUtils");

/**
 * Esse endpoint espera um body com:
 * - usuario: (string) para identificar o registro (ex.: "usuario")
 * - data: (string) data do registro (ex.: "2025-03-20")
 * - text: (string) o texto da justificativa
 * - newEntry: (string) data/hora da entrada manual (opcional)
 * - newExit: (string) data/hora da saída manual (opcional)
 * - status: (string) opcional, somente considerado se o usuário for admin
 * 
 * Observação: Para saber a role do usuário, é ideal ter um middleware de autenticação
 * que verifique o token do Firebase e disponibilize essa informação em req.user.
 * Aqui, usamos req.user.role como exemplo. Se não houver, assume "leitor".
 */

async function getUserRole(email) {
  const snapshot = await db.collection("users").where("email", "==", email).get();
  if (snapshot.empty) return "leitor";
  return snapshot.docs[0].data().role || "leitor";
}

exports.deleteJustificativa = async (req, res) => {
  try {
    const { usuario, data } = req.body;
    const email = req.user.email;

    const registroId = `${usuario}_${data}`;
    const registroRef = db.collection("registros").doc(registroId);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Registro não encontrado." });
    }

    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) return res.status(403).json({ error: "Usuário não encontrado." });

    const userData = snapshot.docs[0].data();
    const userDiscordId = userData.discordId;

    if (!userDiscordId || doc.data().discordId !== userDiscordId) {
      return res.status(403).json({ error: "Você não tem permissão para deletar esta justificativa." });
    }

    await registroRef.set({ justificativa: null }, { merge: true });

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data });

    return res.json({ success: true, message: "Justificativa deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar justificativa:", error);
    return res.status(500).json({ error: "Erro ao deletar justificativa." });
  }
}

exports.upsertJustificativa = async (req, res) => {
  try {
    const { usuario, data, text, newEntry, newExit, abonoHoras, status, file, fileName, manualBreak } = req.body;

    const email = req.user.email;
    const userRole = await getUserRole(email);
    const justificativaStatus = userRole === "admin" && status ? status : "pendente";

    const registroId = `${usuario}_${data}`;
    const registroRef = db.collection("registros").doc(registroId);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Registro não encontrado para esse usuário e data." });
    }

    const registroAtual = doc.data();

    const justificativa = {
      text,
      status: justificativaStatus,
      newEntry: newEntry || null,
      newExit: newExit || null,
      abonoHoras: abonoHoras?.trim() || null,
      manualBreak: manualBreak?.trim() || null,
      updatedAt: new Date().toISOString(),
      file: file || null,
      fileName: fileName || null,
    };

    const atualizacao = { justificativa };

    if (justificativaStatus === "aprovado" && (newEntry || newExit)) {
      const entrada = newEntry
        ? new Date(newEntry).toTimeString().slice(0, 5)
        : registroAtual.entrada;

      const saida = newExit
        ? new Date(newExit).toTimeString().slice(0, 5)
        : registroAtual.saida;

      const dataFormatada = data;
      const pausas = registroAtual.pausas || [];

      const pausasCalculadas = manualBreak
        ? extrairMinutosDeString(manualBreak)
        : (() => {
          const { totalPausas } = calcularHorasTrabalhadas(
            `${dataFormatada}T${entrada}:00`,
            `${dataFormatada}T${saida}:00`,
            pausas
          );
          return extrairMinutosDeString(totalPausas);
        })();

      const minutosTotais = extrairMinutosDeString(
        calcularHorasTrabalhadas(
          `${dataFormatada}T${entrada}:00`,
          `${dataFormatada}T${saida}:00`,
          []
        ).totalHoras
      );

      const horasTrabalhadas = minutosTotais - pausasCalculadas;

      atualizacao.entrada = entrada;
      atualizacao.saida = saida;
      atualizacao.total_horas = formatarMinutosParaHoras(horasTrabalhadas);
      atualizacao.total_pausas = formatarMinutosParaHoras(pausasCalculadas);
    }

    if (justificativaStatus === "pendente") await enviarEmailNotificacao(justificativa, usuario, data);
    if (["aprovado", "reprovado"].includes(justificativaStatus)) await enviarEmailConfirmacaoLeitor(justificativa, usuario, data, justificativaStatus);

    await registroRef.set(atualizacao, { merge: true });

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data });

    return res.json({ success: true, message: "Justificativa registrada/atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar justificativa:", error);
    return res.status(500).json({ error: "Erro ao registrar justificativa." });
  }
};

async function enviarEmailNotificacao(justificativa, usuario, data) {
  const adminsSnapshot = await db.collection("users")
    .where("role", "==", "admin")
    .where("receberNotificacoes", "==", true)
    .get();

  if (adminsSnapshot.empty) return;

  const emails = adminsSnapshot.docs.map(doc => doc.data().email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SISTEMA,
      pass: process.env.EMAIL_SENHA
    }
  });

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #5a40b6;">📥 Nova Justificativa Recebida</h2>
      <p><strong>Usuário:</strong> ${usuario}</p>
      <p><strong>Data:</strong> ${data}</p>
      ${justificativa.newEntry ? `<p><strong>Entrada Manual:</strong> ${justificativa.newEntry}</p>` : ''}
      ${justificativa.newExit ? `<p><strong>Saída Manual:</strong> ${justificativa.newExit}</p>` : ''}
      ${justificativa.abonoHoras ? `<p><strong>Abono de Horas:</strong> ${justificativa.abonoHoras}</p>` : ''}
      ${justificativa.manualBreak ? `<p><strong>Intervalo Manual:</strong> ${justificativa.manualBreak}</p>` : ''}
      <p><strong>Descrição:</strong></p>
      <blockquote style="background: #eee; padding: 10px; border-left: 4px solid #5a40b6;">${justificativa.text}</blockquote>
      ${justificativa.fileName ? `
        <p><strong>Anexo:</strong> ${justificativa.fileName}</p>
        <p><em>Para visualizar o anexo, acesse o sistema.</em></p>
      ` : ''}
        <p style="margin-top: 20px;">
          <a href="https://frontend-virid-alpha-62.vercel.app/" target="_blank"
            style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #5a40b6;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-family: Arial, sans-serif;
              transition: background-color 0.3s;
            "
            onmouseover="this.style.backgroundColor='#7457c8'"
            onmouseout="this.style.backgroundColor='#5a40b6'"
          >
            ➡️ Acessar Painel de Justificativas
          </a>
        </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Pontobot" <${process.env.EMAIL_SISTEMA}>`,
    to: emails.join(","),
    subject: `Justificativa pendente - ${usuario} (${data})`,
    html
  });

  console.log("📧 E-mail enviado:", info.messageId);
}

async function enviarEmailConfirmacaoLeitor(justificativa, usuario, data, status) {
  const snapshot = await db.collection("users")
    .where("usuario", "==", usuario)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const userData = snapshot.docs[0].data();

  if (
    userData.role !== "leitor" ||
    !userData.receberNotificacoesLeitor ||
    !userData.email
  ) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SISTEMA,
      pass: process.env.EMAIL_SENHA
    }
  });

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${status === "aprovado" ? "#28a745" : "#dc3545"};">📢 Sua justificativa foi <strong style="text-transform: uppercase;">${status}</strong></h2>
      <p><strong>Data:</strong> ${data}</p>
      <p><strong>Status:</strong> ${status === "aprovado" ? "✅ Aprovada" : "❌ Reprovada"}</p>
      <p><strong>Justificativa enviada:</strong></p>
      <blockquote style="background: #eee; padding: 10px; border-left: 4px solid #5a40b6;">${justificativa.text}</blockquote>
      <p style="margin-top: 20px;">
        <a href="https://frontend-virid-alpha-62.vercel.app/" target="_blank"
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #5a40b6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            transition: background-color 0.3s;
          "
        >
          Ver no Painel de Justificativas
        </a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Pontobot" <${process.env.EMAIL_SISTEMA}>`,
    to: userData.email,
    subject: `Justificativa do dia ${data} foi ${status.toUpperCase()}`,
    html
  });

  console.log(`📨 E-mail enviado para leitor (${userData.email}) sobre justificativa ${status}`);
}

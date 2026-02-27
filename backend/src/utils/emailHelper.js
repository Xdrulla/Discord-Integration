// utils/emailHelper.js
const db = require("../config/firebase");
const nodemailer = require("nodemailer");

async function enviarEmailNotificacao(justificativa, usuario, data) {
  const [adminsSnapshot, rhSnapshot] = await Promise.all([
    db.collection("users").where("role", "==", "admin").where("receberNotificacoes", "==", true).get(),
    db.collection("users").where("role", "==", "rh").where("receberNotificacoes", "==", true).get(),
  ]);

  const emails = [
    ...adminsSnapshot.docs.map(doc => doc.data().email),
    ...rhSnapshot.docs.map(doc => doc.data().email),
  ].filter(Boolean);

  if (emails.length === 0) return;

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
          <a href="https://goepik-ponto.vercel.app/" target="_blank"
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
}

async function enviarEmailConfirmacaoLeitor(justificativa, usuario, data, status) {
  const registroDoc = await db.collection("registros").doc(`${usuario}_${data}`).get();
  if (!registroDoc.exists) return;

  const discordId = registroDoc.data().discordId;
  if (!discordId) return;

  const snapshot = await db.collection("users")
    .where("discordId", "==", discordId)
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
      ${justificativa.observacaoAdmin ? `
        <p><strong>Observação do Administrador:</strong></p>
        <blockquote style="background: #f1f1f1; padding: 10px; border-left: 4px solid #5a40b6;">${justificativa.observacaoAdmin}</blockquote>
      ` : ''}      
      <p style="margin-top: 20px;">
        <a href="https://goepik-ponto.vercel.app/" target="_blank"
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
}

module.exports = {
  enviarEmailNotificacao,
  enviarEmailConfirmacaoLeitor,
};

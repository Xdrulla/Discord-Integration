const db = require("../config/firebase");
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
    const entradaDate = new Date(newEntry);
    const saidaDate = new Date(newExit);

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

    await registroRef.set(atualizacao, { merge: true });

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data });

    return res.json({ success: true, message: "Justificativa registrada/atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar justificativa:", error);
    return res.status(500).json({ error: "Erro ao registrar justificativa." });
  }
};

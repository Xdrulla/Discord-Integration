const db = require("../config/firebase");
const { removerAcentos, classificarMensagem } = require("../utils/nlpUtils");
const { calcularHorasTrabalhadas } = require("../utils/timeUtils");

const dayjs = require("dayjs")
const utc = require("dayjs/plugin/utc")
const timezone = require("dayjs/plugin/timezone");
const { enviarEmailNotificacao } = require("../utils/emailHelper");

dayjs.extend(utc)
dayjs.extend(timezone)

async function getUsuarioByDiscordId(discordId) {
  const snapshot = await db.collection("users").where("discordId", "==", discordId).limit(1).get();
  if (snapshot.empty) return null;
  const userData = snapshot.docs[0].data();
  return userData.email.split("@")[0];
}

exports.register = async (req, res) => {
  try {
    let { usuario, mensagem, discordId } = req.body;

    if (discordId && !usuario) {
      const nomeUsuario = await getUsuarioByDiscordId(discordId);
      if (!nomeUsuario) return res.status(404).json({ error: "Usuário não encontrado pelo Discord ID." });
      usuario = nomeUsuario;
    }

    const agora = dayjs().tz("America/Sao_Paulo")
    const dataFormatada = agora.format("YYYY-MM-DD")
    const horaAtual = agora.format("HH:mm")

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    let dadosRegistro = { usuario, data: dataFormatada, discordId };
    const mensagemProcessada = removerAcentos(mensagem)
    const classificacao = await classificarMensagem(mensagemProcessada)

    if (!doc.exists) {
      dadosRegistro.entrada = horaAtual;
    } else {
      const registroAtual = doc.data();
      Object.assign(dadosRegistro, registroAtual);

      if (registroAtual.pausas) {
        registroAtual.pausas.forEach((pausa) => {
          if (!pausa.fim) {
            pausa.fim = `${dataFormatada}T${horaAtual}`;
          }
        });
      }

      if (classificacao === 'saida') {
        dadosRegistro.saida = horaAtual;

        if (registroAtual.entrada) {
          const dataCompletaEntrada = `${dataFormatada}T${registroAtual.entrada}:00`
          const dataCompletaSaida = `${dataFormatada}T${dadosRegistro.saida}:00`

          const { totalHoras, totalPausas } = calcularHorasTrabalhadas(
            dataCompletaEntrada,
            dataCompletaSaida,
            registroAtual.pausas || []
          );

          if (totalHoras !== "0h 0m") {
            dadosRegistro.total_horas = totalHoras;
          } else if (registroAtual.total_horas) {
            dadosRegistro.total_horas = registroAtual.total_horas;
          }
          if (totalPausas !== "0h 0m") {
            dadosRegistro.total_pausas = totalPausas;
          } else if (registroAtual.total_pausas) {
            dadosRegistro.total_pausas = registroAtual.total_pausas;
          }

        }
      }
    }
    await registroRef.set(dadosRegistro, { merge: true });
    res.json({ success: true, message: "Registro atualizado!" });

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data: dadosRegistro });

  } catch (error) {
    console.error("❌ Erro ao salvar no banco:", error);
    res.status(500).json({ error: "Erro ao salvar no banco de dados" });
  }
};

exports.pause = async (req, res) => {
  try {
    const { usuario: bodyUsuario, discordId } = req.body;
    let usuario = bodyUsuario;

    if (discordId && !usuario) {
      const nomeUsuario = await getUsuarioByDiscordId(discordId);
      if (!nomeUsuario) return res.status(404).json({ error: "Usuário não encontrado pelo Discord ID." });
      usuario = nomeUsuario;
    }

    const agora = dayjs().tz("America/Sao_Paulo").format();
    const dataFormatada = agora.split("T")[0];

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(400).json({ error: "Nenhum registro de entrada encontrado para este usuário." });
    }

    let dadosRegistro = doc.data();
    dadosRegistro.discordId = discordId;

    if (dadosRegistro.saida) {
      return res.status(400).json({ error: "O usuário já encerrou o expediente. Pausas não podem ser registradas após a saída." });
    }

    if (!dadosRegistro.pausas) dadosRegistro.pausas = [];

    const ultimaPausa = dadosRegistro.pausas[dadosRegistro.pausas.length - 1];

    if (!ultimaPausa || ultimaPausa.fim) {
      dadosRegistro.pausas.push({ inicio: agora });
      await registroRef.set(dadosRegistro, { merge: true });

      res.json({ success: true, message: "Pausa registrada!" });
    } else {
      res.status(400).json({ error: "Já existe uma pausa em andamento." });
    }

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data: dadosRegistro });

  } catch (error) {
    console.error("Erro ao registrar pausa:", error);
    res.status(500).json({ error: "Erro ao registrar pausa no banco" });
  }
};

exports.resume = async (req, res) => {
  try {
    const { usuario, discordId } = req.body;

    if (discordId && !usuario) {
      const nomeUsuario = await getUsuarioByDiscordId(discordId);
      if (!nomeUsuario) return res.status(404).json({ error: "Usuário não encontrado pelo Discord ID." });
      usuario = nomeUsuario;
    }

    const agora = dayjs().tz("America/Sao_Paulo").format();
    const dataFormatada = agora.split("T")[0];

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Nenhum registro encontrado para esse usuário." });
    }

    let dadosRegistro = doc.data();

    dadosRegistro.discordId = discordId;

    if (!dadosRegistro.pausas) dadosRegistro.pausas = [];

    const ultimaPausa = dadosRegistro.pausas.length > 0 ? dadosRegistro.pausas[dadosRegistro.pausas.length - 1] : null;

    if (!ultimaPausa || ultimaPausa.fim) {
      return res.status(400).json({ error: "Nenhuma pausa ativa para finalizar." });
    }

    ultimaPausa.fim = agora;

    const { totalPausas } = calcularHorasTrabalhadas(
      `${dataFormatada}T${dadosRegistro.entrada || "00:00"}`,
      agora,
      dadosRegistro.pausas
    );

    dadosRegistro.total_pausas = totalPausas;

    await registroRef.set(dadosRegistro, { merge: true });

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data: dadosRegistro });

    res.json({ success: true, message: "Pausa finalizada!", total_pausas: totalPausas });
  } catch (error) {
    console.error("Erro ao finalizar pausa:", error);
    res.status(500).json({ error: "Erro ao finalizar pausa no banco" });
  }
}

exports.getRegistro = async (req, res) => {
  try {
    const { usuario } = req.params;
    const agora = new Date();
    const dataFormatada = agora.toISOString().split("T")[0];

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Nenhum registro encontrado para este usuário hoje." });
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Erro ao buscar registro:", error);
    res.status(500).json({ error: "Erro ao buscar registro no banco" });
  }
};

exports.addManualRecord = async (req, res) => {
  try {
    const {
      data,
      entrada,
      saida,
      total_pausas,
      usuario,
      discordId
    } = req.body;

    const docId = `${usuario}_${data}`;
    const registroRef = db.collection("registros").doc(docId);

    const registro = {
      usuario,
      data,
      entrada: entrada.split(" ")[1],
      saida: saida.split(" ")[1],
      total_pausas,
      discordId,
      manual: true,
      createdAt: new Date().toISOString(),
      justificativa: {
        text: "Registro manual solicitado.",
        status: "pendente",
        newEntry: entrada,
        newExit: saida,
        manualBreak: total_pausas,
      },
    };

    await registroRef.set(registro, { merge: true });

    const io = req.app.get("io");
    io.emit("registro-atualizado", { usuario, data: registro });

    await enviarEmailNotificacao(registro.justificativa, usuario, data);

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro ao salvar registro manual:", err);
    res.status(500).json({ success: false, error: "Erro ao salvar registro manual." });
  }
};

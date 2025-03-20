const db = require("../config/firebase");
const PALAVRAS_SAIDA = require("../utils/enum");
const { calcularHorasTrabalhadas } = require("../utils/timeUtils");

exports.register = async (req, res) => {
  try {
    const { usuario, mensagem } = req.body;
    const agora = new Date();
    const dataFormatada = agora.toISOString().split("T")[0];
    const horaAtual = agora.toTimeString().split(" ")[0].substring(0, 5);

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    let dadosRegistro = { usuario, data: dataFormatada };

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

      if (PALAVRAS_SAIDA.some(palavra => mensagem.toLowerCase().includes(palavra))) {
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
  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
    res.status(500).json({ error: "Erro ao salvar no banco de dados" });
  }
};

exports.pause = async (req, res) => {
  try {
    const { usuario, inicio } = req.body;
    const dataFormatada = inicio.split("T")[0];

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(400).json({ error: "Nenhum registro de entrada encontrado para este usuário." });
    }

    let dadosRegistro = doc.data();

    if (dadosRegistro.saida) {
      console.log(`⛔ Tentativa de pausa após saída para ${usuario}`);
      return res.status(400).json({ error: "O usuário já encerrou o expediente. Pausas não podem ser registradas após a saída." });
    }

    if (!dadosRegistro.pausas) dadosRegistro.pausas = [];

    if (dadosRegistro.pausas.length === 0 || dadosRegistro.pausas[dadosRegistro.pausas.length - 1].fim) {
      dadosRegistro.pausas.push({ inicio });
      await registroRef.set(dadosRegistro, { merge: true });

      res.json({ success: true, message: "Pausa registrada!" });
    } else {
      res.status(400).json({ error: "Já existe uma pausa em andamento." });
    }
  } catch (error) {
    console.error("Erro ao registrar pausa:", error);
    res.status(500).json({ error: "Erro ao registrar pausa no banco" });
  }
};

exports.resume = async (req, res) => {
  try {
    const { usuario, fim } = req.body;
    const dataFormatada = fim.split("T")[0];

    const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Nenhum registro encontrado para esse usuário." });
    }

    let dadosRegistro = doc.data();
    if (!dadosRegistro.pausas) dadosRegistro.pausas = [];

    const ultimaPausa = dadosRegistro.pausas.length > 0 ? dadosRegistro.pausas[dadosRegistro.pausas.length - 1] : null;

    if (!ultimaPausa || ultimaPausa.fim) {
      return res.status(400).json({ error: "Nenhuma pausa ativa para finalizar." });
    }

    ultimaPausa.fim = fim;

    const { totalPausas } = calcularHorasTrabalhadas(ultimaPausa.inicio, fim, dadosRegistro.pausas)
    dadosRegistro.total_pausas = totalPausas;

    await registroRef.set(dadosRegistro, { merge: true });

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

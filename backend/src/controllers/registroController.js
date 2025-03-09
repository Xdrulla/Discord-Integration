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
    console.log("Dados que serão salvos:", dadosRegistro);


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
          const { totalHoras, totalPausas } = calcularHorasTrabalhadas(
            registroAtual.entrada,
            horaAtual,
            registroAtual.pausas || []
          );
          dadosRegistro.total_horas = totalHoras;
          dadosRegistro.total_pausas = totalPausas;
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

    let dadosRegistro = doc.exists ? doc.data() : { usuario, data: dataFormatada };
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

    const { totalPausas } = calcularHorasTrabalhadas(dadosRegistro.entrada, fim, dadosRegistro.pausas);
    dadosRegistro.total_pausas = totalPausas;

    await registroRef.set(dadosRegistro, { merge: true });

    res.json({ success: true, message: "Pausa finalizada!", total_pausas: totalPausas });
  } catch (error) {
    console.error("Erro ao finalizar pausa:", error);
    res.status(500).json({ error: "Erro ao finalizar pausa no banco" });
  }
};

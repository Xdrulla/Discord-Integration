require("dotenv").config();
const OpenAI = require("openai");
const db = require("../config/firebase");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Gera texto descritivo com base nos dados do registro
 */
function gerarTextoRegistro(dados) {
  const {
    usuario = "desconhecido",
    data = "sem data",
    entrada = "não registrada",
    saida = "não registrada",
    total_horas = "indisponível",
    total_pausas = "nenhuma",
    justificativa,
    manualBreak,
    newEntry,
    newExit,
    status,
    text,
  } = dados;

  const pausasTexto = Array.isArray(dados.pausas)
    ? dados.pausas.map((p, i) => `Pausa ${i + 1}: de ${p.inicio} até ${p.fim}`).join("; ")
    : "nenhuma";

  const partes = [
    `Registro de ponto para o usuário ${usuario} no dia ${data}.`,
    `Entrada: ${entrada}.`,
    `Saída: ${saida}.`,
    `Total de horas: ${total_horas}.`,
    `Pausas: ${pausasTexto}.`,
  ];

  if (justificativa || text || status || manualBreak) {
    partes.push(`Justificativa: ${(justificativa?.text || text) ?? "nenhuma"}`);
    if (newEntry || newExit) {
      partes.push(`Entrada manual: ${newEntry ?? "não informada"}, Saída manual: ${newExit ?? "não informada"}.`);
    }
    if (manualBreak) partes.push(`Intervalo manual informado: ${manualBreak}.`);
    if (status) partes.push(`Status da justificativa: ${status}.`);
  }

  return partes.join(" ");
}

/**
 * Gera embedding e salva na subcoleção "embeddings"
 */
async function vetorizarRegistro(docId, dadosRegistro) {
  try {
    const texto = gerarTextoRegistro(dadosRegistro);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: texto,
    });

    const embeddingData = {
      texto,
      embedding: embeddingResponse.data[0].embedding,
      timestamp: new Date().toISOString(),
    };

    const registroRef = db.collection("registros").doc(docId);
    await registroRef.collection("embeddings").add(embeddingData);

    console.log(`🧠 Embedding salvo para ${docId}`);
  } catch (err) {
    console.error(`❌ Erro ao vetorizar ${docId}:`, err.message);
  }
}

module.exports = { vetorizarRegistro };

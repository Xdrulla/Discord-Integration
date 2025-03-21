const db = require("../config/firebase");

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
exports.upsertJustificativa = async (req, res) => {
  try {
    const { usuario, data, text, newEntry, newExit, status } = req.body;    

    const userRole = req.user && req.user.role ? req.user.role : "leitor";

    const justificativaStatus = userRole === "admin" && status ? status : "pendente";

    const registroId = `${usuario}_${data}`;
    const registroRef = db.collection("registros").doc(registroId);    
    const doc = await registroRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Registro não encontrado para esse usuário e data." });
    }

    const justificativa = {
      text,
      status: justificativaStatus,
      newEntry: newEntry || null,
      newExit: newExit || null,
      updatedAt: new Date().toISOString()
    };

    await registroRef.set({ justificativa }, { merge: true });
    return res.json({ success: true, message: "Justificativa registrada/atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar justificativa:", error);
    return res.status(500).json({ error: "Erro ao registrar justificativa." });
  }
};

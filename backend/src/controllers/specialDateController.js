const db = require("../config/firebase");

exports.getDatasEspeciais = async (req, res) => {
  try {
    const snapshot = await db.collection("datas_especiais").orderBy("data").get();
    const datas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(datas);
  } catch (error) {
    console.error("Erro ao buscar datas especiais:", error);
    res.status(500).json({ error: "Erro ao buscar datas especiais" });
  }
};

exports.addDataEspecial = async (req, res) => {
  try {
    const { data, nome, usuarios = [] } = req.body;
    if (!data || !nome) {
      return res.status(400).json({ error: "Campos obrigatórios: data e nome" });
    }

    await db.collection("datas_especiais").doc(data).set({ data, nome, usuarios });
    res.json({ success: true, message: "Data especial adicionada com sucesso" });
  } catch (error) {
    console.error("Erro ao adicionar data especial:", error);
    res.status(500).json({ error: "Erro ao adicionar data especial" });
  }
};

exports.deleteDataEspecial = async (req, res) => {
  try {
    const { data } = req.params;
    if (!data) return res.status(400).json({ error: "Data é obrigatória" });

    await db.collection("datas_especiais").doc(data).delete();
    res.json({ success: true, message: "Data especial removida com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar data especial:", error);
    res.status(500).json({ error: "Erro ao deletar data especial" });
  }
};

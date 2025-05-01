const express = require("express");
const { register, pause, resume, getRegistro } = require("../controllers/registroController");
const { exportarResumoGeralExcel, exportarResumoGeralPDF } = require("../controllers/exportController");
const authMiddleware = require("../middlewares/authMiddleware");
const { calcularResumoMensal, calcularTodosResumosMensais } = require("../utils/resumeUtils");

const router = express.Router();

router.post("/register", register);
router.post("/pause", pause);
router.post("/resume", resume);
router.post("/disparar-relatorio", async (req, res) => {
  const { secretKey } = req.body;
  if (secretKey !== process.env.SEND_REPORT_SECRET) {
    return res.status(403).json({ error: "Chave inválida." });
  }

  try {
    await executarEnvio();
    res.json({ success: true, message: "Relatório enviado com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao enviar relatório:", err);
    res.status(500).json({ error: err.message || "Erro ao enviar relatório." });
  }
});

router.get("/registro/resumo-geral-exportar/:ano/:mes", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado. Apenas admins podem exportar." });
  }

  const { ano, mes } = req.params;
  const { format } = req.query;

  try {
    if (format === "excel") {
      return await exportarResumoGeralExcel(res, parseInt(ano), parseInt(mes));
    } else if (format === "pdf") {
      return await exportarResumoGeralPDF(res, parseInt(ano), parseInt(mes));
    } else {
      return res.status(400).json({ error: "Formato inválido. Use ?format=excel ou ?format=pdf" });
    }
  } catch (err) {
    console.error("Erro ao exportar resumo geral:", err);
    return res.status(500).json({ error: "Erro ao exportar resumo geral" });
  }
});

router.get("/registro/resumo-geral/:ano/:mes", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Apenas admins podem acessar esse recurso." });
    }

    const { ano, mes } = req.params;
    const resumos = await calcularTodosResumosMensais(parseInt(ano), parseInt(mes));

    res.json(resumos);
  } catch (error) {
    console.error("❌ Erro ao gerar resumo geral:", error);
    res.status(500).json({ error: "Erro ao gerar resumo geral." });
  }
});

router.get("/registro/:usuario/:ano/:mes", authMiddleware, async (req, res) => {
  const { usuario, ano, mes } = req.params;

  try {
    const resumo = await calcularResumoMensal(usuario, parseInt(ano), parseInt(mes));
    res.json(resumo)
  } catch (error) {
    console.error("❌ Erro ao calcular resumo mensal:", error);
    res.status(500).json({ error: "Erro ao calcular resumo mensal" });
  }
});

router.get("/registro/:usuario", getRegistro);

module.exports = router;

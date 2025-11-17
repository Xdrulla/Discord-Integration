const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const bancoHorasService = require("../services/bancoHoras.service");
const { calcularResumoMensal } = require("../utils/resumeUtils");
const db = require("../config/firebase");

const router = express.Router();

/**
 * GET /banco-horas/historico/:discordId
 * Busca histórico de banco de horas (últimos 6 meses)
 */
router.get("/historico/:discordId", authMiddleware, async (req, res) => {
  try {
    const { discordId } = req.params;
    
    // Verifica permissão: só admin ou o próprio usuário
    const userSnapshot = await db.collection("users").where("email", "==", req.user.email).limit(1).get();
    const userData = userSnapshot.docs[0]?.data();
    
    if (req.user.role !== "admin" && userData?.discordId !== discordId) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    const historico = await bancoHorasService.buscarHistoricoBanco(discordId, 6);
    res.json({ success: true, historico });
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de banco de horas." });
  }
});

/**
 * POST /banco-horas/fechar-mes
 * Fecha o mês atual e persiste o banco de horas
 * (Apenas admin)
 */
router.post("/fechar-mes", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Apenas admins podem fechar o mês." });
    }

    const { discordId, ano, mes } = req.body;

    if (!discordId || !ano || !mes) {
      return res.status(400).json({ error: "Parâmetros inválidos. Necessário: discordId, ano, mes" });
    }

    // Calcula resumo mensal
    const resumo = await calcularResumoMensal(discordId, ano, mes);
    
    // Fecha o mês e persiste
    const resultado = await bancoHorasService.fecharMes(discordId, resumo);

    res.json({
      success: true,
      message: "Mês fechado com sucesso!",
      resultado
    });
  } catch (error) {
    console.error("❌ Erro ao fechar mês:", error);
    res.status(500).json({ error: "Erro ao fechar mês." });
  }
});

/**
 * POST /banco-horas/fechar-mes-todos
 * Fecha o mês para todos os usuários
 * (Apenas admin - executar no fim do mês)
 */
router.post("/fechar-mes-todos", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Apenas admins podem executar esta ação." });
    }

    const { ano, mes } = req.body;

    if (!ano || !mes) {
      return res.status(400).json({ error: "Parâmetros inválidos. Necessário: ano, mes" });
    }

    // Busca todos os usuários
    const usuariosSnapshot = await db.collection("users").get();
    const resultados = [];

    for (const doc of usuariosSnapshot.docs) {
      const userData = doc.data();
      
      if (!userData.discordId) continue;

      try {
        const resumo = await calcularResumoMensal(userData.discordId, ano, mes);
        const resultado = await bancoHorasService.fecharMes(userData.discordId, resumo);
        
        resultados.push({
          usuario: userData.email.split("@")[0],
          discordId: userData.discordId,
          success: true,
          ...resultado
        });
      } catch (error) {
        console.error(`❌ Erro ao fechar mês para ${userData.email}:`, error.message);
        resultados.push({
          usuario: userData.email.split("@")[0],
          discordId: userData.discordId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Mês ${mes}/${ano} fechado para ${resultados.length} usuários.`,
      resultados
    });
  } catch (error) {
    console.error("❌ Erro ao fechar mês para todos:", error);
    res.status(500).json({ error: "Erro ao fechar mês para todos os usuários." });
  }
});

/**
 * GET /banco-horas/acumulado/:discordId/:ano/:mes
 * Retorna o banco acumulado até determinado mês
 */
router.get("/acumulado/:discordId/:ano/:mes", authMiddleware, async (req, res) => {
  try {
    const { discordId, ano, mes } = req.params;
    
    // Verifica permissão
    const userSnapshot = await db.collection("users").where("email", "==", req.user.email).limit(1).get();
    const userData = userSnapshot.docs[0]?.data();
    
    if (req.user.role !== "admin" && userData?.discordId !== discordId) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    const bancoAcumulado = await bancoHorasService.calcularBancoAcumulado(
      discordId,
      parseInt(ano),
      parseInt(mes)
    );

    res.json({
      success: true,
      discordId,
      ano: parseInt(ano),
      mes: parseInt(mes),
      bancoAcumuladoMinutos: bancoAcumulado,
      bancoAcumulado: require("../utils/timeUtils").formatarMinutosParaHoras(bancoAcumulado)
    });
  } catch (error) {
    console.error("❌ Erro ao buscar banco acumulado:", error);
    res.status(500).json({ error: "Erro ao buscar banco acumulado." });
  }
});

module.exports = router;


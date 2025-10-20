const db = require('../config/firebase');

/**
 * Configurações de sessão
 */
const SESSION_CONFIG = {
  MAX_MESSAGES: 10,        // Máximo de mensagens no histórico
  EXPIRATION_HOURS: 1,     // Sessão expira após 1 hora de inatividade
};

/**
 * Busca a sessão de chat do usuário
 * @param {string} userId - ID do usuário (discordId)
 * @returns {Promise<Array>} Histórico de mensagens
 */
exports.getSession = async (userId) => {
  if (!userId) return [];

  try {
    const sessionDoc = await db.collection('chat_sessions').doc(userId).get();
    
    if (!sessionDoc.exists) {
      return [];
    }

    const session = sessionDoc.data();
    
    const now = new Date();
    const lastActivity = session.lastActivity?.toDate();
    const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);

    if (hoursDiff > SESSION_CONFIG.EXPIRATION_HOURS) {
      await exports.clearSession(userId);
      return [];
    }

    return session.messages || [];
  } catch (error) {
    console.error('❌ Erro ao buscar sessão:', error.message);
    return [];
  }
};

/**
 * Adiciona uma mensagem ao histórico da sessão
 * @param {string} userId - ID do usuário
 * @param {string} role - 'user' ou 'assistant'
 * @param {string} content - Conteúdo da mensagem
 */
exports.addMessage = async (userId, role, content) => {
  if (!userId) return;

  try {
    const messages = await exports.getSession(userId);
    
    messages.push({ role, content });

    const recentMessages = messages.slice(-SESSION_CONFIG.MAX_MESSAGES);

    await db.collection('chat_sessions').doc(userId).set({
      messages: recentMessages,
      lastActivity: new Date(),
      userId
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar mensagem:', error.message);
  }
};

/**
 * Limpa a sessão do usuário
 * @param {string} userId - ID do usuário
 */
exports.clearSession = async (userId) => {
  if (!userId) return;

  try {
    await db.collection('chat_sessions').doc(userId).delete();
  } catch (error) {
    console.error('❌ Erro ao limpar sessão:', error.message);
  }
};

/**
 * Formata histórico para o formato OpenAI
 * @param {Array} messages - Array de mensagens
 * @returns {Array} Mensagens no formato OpenAI
 */
exports.formatMessagesForOpenAI = (messages) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};
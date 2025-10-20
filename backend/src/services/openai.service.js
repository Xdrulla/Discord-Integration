const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Configurações dos modelos
 */
const MODELS = {
  MAIN: 'gpt-4.1-mini',
  INTENT: 'gpt-4.1-mini',
};

/**
 * Envia mensagens para o chat completion
 * @param {Array} messages - Array de mensagens no formato OpenAI
 * @param {number} temperature - Temperatura (0-2), padrão 0.7
 * @returns {Promise<string>} Resposta da IA
 */
exports.chatCompletion = async (messages, temperature = 0.7) => {
  try {
    const completion = await openai.chat.completions.create({
      model: MODELS.MAIN,
      messages,
      temperature,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Erro no chatCompletion:', error.message);
    throw new Error('Erro ao processar mensagem com OpenAI');
  }
};

/**
 * Analisa a intenção do usuário (extração estruturada)
 * @param {string} userMessage - Mensagem do usuário
 * @returns {Promise<Object>} Objeto com intenção e parâmetros
 */
exports.analyzeIntent = async (userMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      model: MODELS.INTENT,
      messages: [
        {
          role: 'system',
          content: `Você é um extrator de intenção. Dado o input do usuário, retorne **somente** um JSON com a estrutura:
{ "intencao": "resumo_mensal" | "registro_hoje" | "registro_data" | "limpar_contexto" | "outra", "mes": "junho", "ano": 2025?, "data": "2025-01-15?" }.
- Use "resumo_mensal" se perguntar sobre horas de um mês
- Use "registro_hoje" se perguntar sobre registro de hoje
- Use "registro_data" se perguntar sobre registro de data específica
- Use "limpar_contexto" se pedir para esquecer/limpar conversa
- Use "outra" para outras perguntas
Inclua campos opcionais apenas se mencionados.`
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3, // Mais determinístico para extração
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.warn('⚠️ Não foi possível interpretar a intenção:', error.message);
    return { intencao: 'outra' };
  }
};

/**
 * Retorna o modelo atual sendo usado
 */
exports.getCurrentModel = () => MODELS.MAIN;
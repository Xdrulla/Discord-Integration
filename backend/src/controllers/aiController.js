const chatSessionService = require('../services/chatSession.service');
const openaiService = require('../services/openai.service');
const contextService = require('../services/context.service');
const { sanitizeInput, formatResponse, extractDateFromText } = require('../utils/chatHelpers');

/**
 * Handler principal do chat com IA
 */
exports.chat = async (req, res) => {
	try {
		const { question, usuario, discordId } = req.body;		
		if (!question) {
			return res.status(400).json({ error: 'Pergunta não fornecida.' });
		}

		const questionSanitized = sanitizeInput(question);
		const intent = await openaiService.analyzeIntent(questionSanitized);
		if (intent.intencao === 'limpar_contexto') {
			await chatSessionService.clearSession(discordId);
			return res.json({
				answer: '🗑️ Contexto limpo! Vamos começar uma nova conversa. Como posso ajudar?'
			});
		}

		const historico = await chatSessionService.getSession(discordId);
		const additionalContext = await contextService.buildContextFromIntent({
			intent,
			usuario,
			discordId
		});

		if (intent.intencao === 'outra' && usuario) {
			const dataExtraida = extractDateFromText(questionSanitized);
			if (dataExtraida && dataExtraida !== new Date().toISOString().split('T')[0]) {
				const registroData = await contextService.getRegistroData(usuario, dataExtraida);
				if (registroData) {
					intent.intencao = 'registro_data';
					intent.data = dataExtraida;
				}
			}
		}

		const messages = [
			{
				role: 'system',
				content: contextService.getSystemContext()
			}
		];

		if (additionalContext) {
			messages.push({
				role: 'system',
				content: `**Informações relevantes:**\n${additionalContext}`
			});
		}

		const historicoFormatado = chatSessionService.formatMessagesForOpenAI(historico);
		messages.push(...historicoFormatado);

		messages.push({ role: 'user', content: questionSanitized });

		const answer = await openaiService.chatCompletion(messages);
		const answerFormatted = formatResponse(answer);

		if (discordId) {
			await chatSessionService.addMessage(discordId, 'user', questionSanitized);
			await chatSessionService.addMessage(discordId, 'assistant', answerFormatted);
		}

		res.json({ answer: answerFormatted });

	} catch (error) {
		console.error('❌ Erro na integração com a IA:', error.message);
		res.status(500).json({
			error: 'Erro ao processar a pergunta. Tente novamente em instantes.'
		});
	}
};

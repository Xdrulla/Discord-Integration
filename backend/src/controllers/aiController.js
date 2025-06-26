const OpenAI = require('openai');
const db = require('../config/firebase');
const dayjs = require('dayjs');
const { calcularResumoMensal } = require('../utils/resumeUtils');

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

exports.chat = async (req, res) => {
	try {
		const { question, usuario, discordId } = req.body;
		if (!question) {
			return res.status(400).json({ error: 'Pergunta não fornecida.' });
		}

		let context = 'Você é o assistente do Pontobot e responde em português.';

		if (usuario) {
			const data = dayjs().format('YYYY-MM-DD');
			const doc = await db.collection('registros').doc(`${usuario}_${data}`).get();
			if (doc.exists) {
				const registro = doc.data();
				context += ` Registro de hoje para ${usuario}: entrada ${registro.entrada || 'não marcada'}, ` +
					`saída ${registro.saida || 'não marcada'}, ` +
					`total de horas ${registro.total_horas || 'n/a'}.`;
			}
		}

		const meses = {
			janeiro: 1,
			fevereiro: 2,
			marco: 3,
			'março': 3,
			abril: 4,
			maio: 5,
			junho: 6,
			julho: 7,
			agosto: 8,
			setembro: 9,
			outubro: 10,
			novembro: 11,
			dezembro: 12,
		};

		const texto = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
		const mesMatch = texto.match(/janeiro|fevereiro|marco|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/);

		if (texto.includes('horas trabalhadas') && mesMatch && discordId) {
			const mesNome = mesMatch[0];
			const mes = meses[mesNome];
			const anoMatch = texto.match(/\b(\d{4})\b/);
			const ano = anoMatch ? parseInt(anoMatch[1]) : new Date().getFullYear();

			try {
				const resumo = await calcularResumoMensal(discordId, ano, mes);
				context += ` Resumo de ${mesNome}/${ano} para ${usuario}: total de horas ${resumo.total_horas}, saldo ${resumo.saldo}.`;
			} catch (e) {
				console.error('Erro ao calcular resumo mensal:', e.message);
			}
		}

		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{ role: 'system', content: context },
				{ role: 'user', content: question },
			],
		});

		const answer = completion.choices[0].message.content.trim();
		res.json({ answer });
	} catch (error) {
		console.error('Erro na integração com a IA:', error.message);
		res.status(500).json({ error: 'Erro ao processar a pergunta.' });
	}
};

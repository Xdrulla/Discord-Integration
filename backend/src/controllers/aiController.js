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

		let extra = {};
		try {
			const analise = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: `Você é um extrator de intenção. Dado o input do usuário, retorne **somente** um JSON com a estrutura:
{ "intencao": "resumo_mensal" | "registro_hoje" | "outra", "mes": "junho", "ano": 2025? }.
Inclua o campo "ano" apenas se ele for mencionado pelo usuário.
Use "outra" se a pergunta não for sobre isso.`
					},
					{ role: 'user', content: question }
				],
			});

			extra = JSON.parse(analise.choices[0].message.content);
		} catch (e) {
			console.warn('⚠️ Não foi possível interpretar a intenção:', e.message);
		}

		if (extra.intencao === 'resumo_mensal' && extra.mes && discordId) {
			const meses = {
				janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4,
				maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9,
				outubro: 10, novembro: 11, dezembro: 12,
			};

			const mes = meses[extra.mes.toLowerCase()];
			let ano = new Date().getFullYear();

			const anoMatch = question.match(/\b(20\d{2})\b/);
			if (anoMatch) {
				ano = parseInt(anoMatch[1]);
			}

			if (mes) {
				try {
					const resumo = await calcularResumoMensal(discordId, ano, mes);
					if (resumo?.total_horas) {
						context += ` O usuário ${usuario} trabalhou ${resumo.total_horas} no mês de ${extra.mes}/${ano}. `;
						context += ` O saldo de horas foi ${resumo.saldo}, com meta de ${resumo.meta}. `;
					} else {
						context += ` Nenhum dado encontrado para ${usuario} no mês de ${extra.mes}/${ano}.`;
					}
				} catch (e) {
					console.error('Erro ao calcular resumo mensal:', e.message);
				}
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

const OpenAI = require('openai');
const db = require('../config/firebase');
const dayjs = require('dayjs');
const { calcularResumoMensal } = require('../utils/resumeUtils');
const { cosineSimilarity } = require('../utils/mathUtils');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chat = async (req, res) => {
	try {
		const { question, usuario, discordId } = req.body;
		if (!question) {
			return res.status(400).json({ error: 'Pergunta não fornecida.' });
		}

		let context = `Você é o assistente do Pontobot. 
    Você responde apenas a perguntas relacionadas ao controle de ponto dos usuários: registros de hoje, resumos mensais ou informações semelhantes. 
    Sempre responda em português.`;

		let extra = {};
		try {
			const analise = await openai.chat.completions.create({
				model: 'gpt-4o',
				response_format: 'json',
				messages: [
					{
						role: 'system',
						content: `
					Você é um extrator de intenção para um bot de controle de ponto.
					
					Dado o input do usuário, responda **apenas** com um JSON na estrutura:
					{
						"intencao": "resumo_mensal" | "registro_hoje" | "registro_data" | "outra",
						"mes": string | null,
						"ano": number | null,
						"data": string | null
					}
					
					Regras:
					- Se o usuário disser "registro de hoje", "bati o ponto hoje", ou algo semelhante, a intenção é "registro_hoje"
					- Se o usuário disser "registro do dia 26 de junho", converta para "registro_data" e extraia a data como "YYYY-MM-DD"
					- Se disser "total de junho", "meta do mês", etc., intencao é "resumo_mensal" e extraia o mês
					- Se não for nenhuma dessas, use "outra"
					
					NUNCA invente valores. Use null se não tiver certeza. Responda apenas o JSON.
					`
					}
					,
					{ role: 'user', content: question }
				]
			});
			extra = JSON.parse(analise.choices[0].message.content);
		} catch (e) {
			console.warn('⚠️ Não foi possível interpretar a intenção:', e.message);
		}

		console.log('🧠 Intenção interpretada:', extra);
		// Registro de hoje
		if (extra.intencao === 'registro_hoje' && usuario) {
			const data = dayjs().format('YYYY-MM-DD');
			const doc = await db.collection('registros').doc(`${usuario}_${data}`).get();
			if (doc.exists) {
				const r = doc.data();
				context += ` Registro de hoje: entrada ${r.entrada || 'não marcada'}, saída ${r.saida || 'não marcada'}, total ${r.total_horas || 'n/a'}.`;
			} else {
				context += ` Nenhum registro encontrado para hoje.`;
			}
		}

		// Registro de data específica
		if (extra.intencao === 'registro_data' && usuario && extra.data) {
			const doc = await db.collection('registros').doc(`${usuario}_${extra.data}`).get();
			if (doc.exists) {
				const r = doc.data();
				context += ` Registro para ${extra.data}: entrada ${r.entrada || 'não marcada'}, saída ${r.saida || 'não marcada'}, total ${r.total_horas || 'n/a'}.`;
			} else {
				context += ` Nenhum registro encontrado para ${extra.data}.`;
			}
		}

		// Resumo mensal
		if (extra.intencao === 'resumo_mensal' && extra.mes && discordId) {
			const meses = {
				janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4,
				maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9,
				outubro: 10, novembro: 11, dezembro: 12,
			};
			const mes = meses[extra.mes.toLowerCase()];
			let ano = extra.ano || new Date().getFullYear();

			if (mes) {
				try {
					const resumo = await calcularResumoMensal(discordId, ano, mes);
					if (resumo?.total_horas) {
						context += ` O usuário ${usuario} trabalhou ${resumo.total_horas} no mês de ${extra.mes}/${ano}. Saldo: ${resumo.saldo}. Meta: ${resumo.meta}.`;
					} else {
						context += ` Nenhum dado encontrado para o mês de ${extra.mes}/${ano}.`;
					}
				} catch (e) {
					console.error('Erro ao calcular resumo mensal:', e.message);
				}
			}
		}

		// SEMPRE usar embeddings para enriquecer contexto
		if (discordId) {
			try {
				const registrosSnapshot = await db
					.collection('registros')
					.where('discordId', '==', discordId)
					.get();

				const registrosEmbeddings = [];

				for (const doc of registrosSnapshot.docs) {
					const embeddingsSnapshot = await doc.ref
						.collection('embeddings')
						.orderBy('timestamp', 'desc')
						.limit(1)
						.get();

					if (!embeddingsSnapshot.empty) {
						const { embedding, texto } = embeddingsSnapshot.docs[0].data();
						registrosEmbeddings.push({ embedding, texto });
					}
				}

				if (registrosEmbeddings.length > 0) {
					const questionEmbedding = (
						await openai.embeddings.create({
							model: 'text-embedding-ada-002',
							input: question
						})
					).data[0].embedding;

					const similares = registrosEmbeddings
						.map(({ embedding, texto }) => ({
							texto,
							score: cosineSimilarity(questionEmbedding, embedding)
						}))
						.sort((a, b) => b.score - a.score)
						.slice(0, 3);

					if (similares.length) {
						context += `\nRegistros semelhantes encontrados:\n`;
						context += similares.map((r, i) => `Exemplo ${i + 1}: ${r.texto}`).join('\n');
					}
				}
			} catch (e) {
				console.warn('⚠️ Falha ao buscar embeddings:', e.message);
			}
		}

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: context },
				{ role: 'user', content: question }
			],
			max_tokens: 500,
			temperature: 0.3
		});

		const answer = completion.choices[0].message.content.trim();
		res.json({ answer });
	} catch (error) {
		console.error('Erro na integração com a IA:', error.message);
		res.status(500).json({ error: 'Erro ao processar a pergunta.' });
	}
};

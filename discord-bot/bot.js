require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const axios = require('axios')
const { NlpManager } = require('node-nlp')

const removerAcentos = (texto) => {
	return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

const manager = new NlpManager({ languages: ['pt', 'en', 'es'] })

manager.addDocument('pt', 'bom dia', 'entrada')
manager.addDocument('pt', 'bom dia pessoal', 'entrada')
manager.addDocument('pt', 'e aí, bom dia', 'entrada')
manager.addDocument('pt', 'cheguei, bom dia', 'entrada')

manager.addDocument('en', 'good morning', 'entrada')
manager.addDocument('en', 'hi, good morning', 'entrada')
manager.addDocument('en', 'i just arrived', 'entrada')
manager.addDocument('en', 'hello everyone', 'entrada')

manager.addDocument('es', 'buenos días', 'entrada')
manager.addDocument('es', 'hola, buenos días', 'entrada')
manager.addDocument('es', 'acabo de llegar', 'entrada')
manager.addDocument('es', 'hola a todos', 'entrada')

manager.addDocument('pt', 'até logo', 'saida')
manager.addDocument('pt', 'até breve', 'saida')
manager.addDocument('pt', 'até mais pessoal', 'saida')
manager.addDocument('pt', 'até amanhã', 'saida')
manager.addDocument('pt', 'até depois', 'saida')
manager.addDocument('pt', 'até semana que vem', 'saida')
manager.addDocument('pt', 'falou', 'saida')
manager.addDocument('pt', 'fui', 'saida')
manager.addDocument('pt', 'bom final de semana pessoal', 'saida');
manager.addDocument('pt', 'até mais pessoal bom final de semana', 'saida');
manager.addDocument('pt', 'bom feriado pessoal', 'saida');
manager.addDocument('pt', 'bom fim de semana galera', 'saida');
manager.addDocument('pt', 'bom fim de semana pessoal', 'saida');

manager.addDocument('en', 'see you later', 'saida')
manager.addDocument('en', 'goodbye', 'saida')
manager.addDocument('en', 'have a nice day', 'saida')
manager.addDocument('en', 'i\'m leaving', 'saida')
manager.addDocument('en', 'bye', 'saida')
manager.addDocument('en', 'bye bye', 'saida')
manager.addDocument('en', 'bye, bye', 'saida')

manager.addDocument('es', 'hasta luego', 'saida')
manager.addDocument('es', 'adiós', 'saida')
manager.addDocument('es', 'que tengas un buen día', 'saida')
manager.addDocument('es', 'me voy', 'saida')

	(async () => {
		await manager.train()
		manager.save()
		console.log("✅ Modelo de NLP treinado e salvo!")
	})()

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMembers,
	]
})

client.once('ready', () => {
	console.log(`✅ Bot ${client.user.tag} está online!`)
})

const classificarMensagem = async (mensagem) => {
	let melhorResposta = { score: 0 }

	for (const lang of ['pt', 'en', 'es']) {
		const resposta = await manager.process(lang, mensagem)
		if (resposta.score > melhorResposta.score) {
			melhorResposta = resposta
		}
	}

	return melhorResposta.intent
}

client.on('messageCreate', async (message) => {
	if (message.author.bot) return

	const mensagemProcessada = removerAcentos(message.content)
	const classificacao = await classificarMensagem(mensagemProcessada)
	const nomeUsuario = message.member ? message.member.displayName : message.author.username;
	const discordId = message.author.id

	if (classificacao === 'entrada') {
		await axios.post(`${process.env.API_URL}/register`, {
			usuario: nomeUsuario,
			mensagem: message.content,
			discordId
		})
		console.log(`✅ Entrada registrada para ${nomeUsuario}`)
	}

	if (classificacao === 'saida') {
		await axios.post(`${process.env.API_URL}/register`, {
			usuario: nomeUsuario,
			mensagem: message.content,
			discordId
		})
		console.log(`✅ Saída registrada para ${nomeUsuario}`)
	}
})

client.on('presenceUpdate', async (oldPresence, newPresence) => {
	try {
		if (!oldPresence || !newPresence) return

		const member = newPresence.guild?.members.cache.get(newPresence.userId)
		const usuario = member?.displayName || newPresence.user.username
		const discordId = newPresence.userId
		const statusAntigo = oldPresence.status
		const statusAtual = newPresence.status

		console.log(`📡 ${usuario} mudou de status: ${statusAntigo} → ${statusAtual}`)
		let registro = {}

		try {
			const response = await axios.get(`${process.env.API_URL}/registro/${usuario}`)
			registro = response.data

			if (registro.saida) {
				console.log(`⛔ ${usuario} já marcou saída às ${registro.saida}, não registrando pausa.`)
				return
			}
		} catch (error) {
			if (error.response && error.response.status === 404) {
				console.log(`🔎 Nenhum registro encontrado para ${usuario}, seguindo normalmente.`)
			} else {
				console.error("❌ Erro ao buscar registro:", error)
			}
		}

		const pausaAtiva = registro.pausas?.length > 0 && !registro.pausas[registro.pausas.length - 1].fim
		if (!registro.saida && !pausaAtiva && (
			(statusAntigo === "online" && (statusAtual === "idle" || statusAtual === "offline")) ||
			(statusAntigo === "dnd" && (statusAtual === "idle" || statusAtual === "offline")) ||
			(statusAntigo === "dnd" && statusAtual === "idle")
		)) {
			await axios.post(`${process.env.API_URL}/pause`, {
				usuario,
				inicio: new Date().toISOString(),
				discordId
			})
			console.log(`⏸️ Pausa iniciada para ${usuario}`)
		}

		if (pausaAtiva && (
			(statusAntigo === "idle" && statusAtual === "dnd") ||
			(statusAntigo === "offline" && statusAtual === "dnd") ||
			(statusAntigo === "idle" && statusAtual === "online") ||
			(statusAntigo === "offline" && statusAtual === "online")
		)) {
			await axios.post(`${process.env.API_URL}/resume`, {
				usuario,
				fim: new Date().toISOString(),
				discordId
			})
			console.log(`▶️ Pausa finalizada para ${usuario}`)
		}
	} catch (error) {
		console.error("❌ Erro inesperado na atualização de presença:", error)
	}
})

client.login(process.env.DISCORD_BOT_TOKEN)

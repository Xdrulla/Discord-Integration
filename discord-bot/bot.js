require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const axios = require('axios')
const { NlpManager } = require('node-nlp')

const removerAcentos = (texto) => {
	return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

const manager = new NlpManager({ languages: ['pt'] })

manager.addDocument('pt', 'bom dia', 'entrada')
manager.addDocument('pt', 'bom dia pessoal', 'entrada')
manager.addDocument('pt', 'e aí, bom dia', 'entrada')
manager.addDocument('pt', 'cheguei, bom dia', 'entrada')

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
	const response = await manager.process('pt', mensagem)
	return response.intent
}

client.on('messageCreate', async (message) => {
	if (message.author.bot) return

	const mensagemProcessada = removerAcentos(message.content)
	const classificacao = await classificarMensagem(mensagemProcessada)
	const nomeUsuario = message.member ? message.member.displayName : message.author.username;

	if (classificacao === 'entrada') {
		try {
			await axios.post(`${process.env.API_URL}/register`, {
				usuario: nomeUsuario,
				mensagem: message.content
			})
			console.log(`✅ Entrada registrada para ${message.author.username}`)
		} catch (error) {
			console.error("❌ Erro ao registrar ponto:", error)
		}
	}

	if (classificacao === 'saida') {
		try {
			await axios.post(`${process.env.API_URL}/register`, {
				usuario: nomeUsuario,
				mensagem: message.content
			})
			console.log(`✅ Saída registrada para ${message.author.username}`)
		} catch (error) {
			console.error("❌ Erro ao registrar saída:", error)
		}
	}
})

client.on('presenceUpdate', async (oldPresence, newPresence) => {
	try {
		if (!oldPresence || !newPresence) return

		const usuario = newPresence.guild?.members.cache.get(newPresence.userId)?.displayName || newPresence.user.username;
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
			try {
				await axios.post(`${process.env.API_URL}/pause`, {
					usuario,
					inicio: new Date().toISOString()
				})
				console.log(`⏸️ Pausa iniciada para ${usuario}`)
			} catch (error) {
				console.error("❌ Erro ao registrar pausa:", error)
			}
		}

		if (pausaAtiva && (
			(statusAntigo === "idle" && statusAtual === "dnd") ||
			(statusAntigo === "offline" && statusAtual === "dnd") ||
			(statusAntigo === "idle" && statusAtual === "online") ||
			(statusAntigo === "offline" && statusAtual === "online")
		)) {
			try {
				await axios.post(`${process.env.API_URL}/resume`, {
					usuario,
					fim: new Date().toISOString()
				})
				console.log(`▶️ Pausa finalizada para ${usuario}`)
			} catch (error) {
				console.error("❌ Erro ao registrar fim da pausa:", error)
			}
		}
	} catch (error) {
		console.error("❌ Erro inesperado na atualização de presença:", error)
	}
})

client.login(process.env.DISCORD_BOT_TOKEN)

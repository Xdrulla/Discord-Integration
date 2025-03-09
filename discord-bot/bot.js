require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const removerAcentos = (texto) => {
	return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

const PALAVRAS_ENTRADA = ["bom dia"];

const PALAVRAS_SAIDA = [
	"até amanhã",
	"até mais pessoal",
	"até pessoal",
	"bom final de semana pessoal",
	"até pessoal bom final de semana",
	"até mais pessoal bom final de semana",
	"até pessoal bom feriado",
	"até mais pessoal bom feriado",
	"até logo",
	"até breve",
	"até mais",
	"até segunda",
	"até terça",
	"até quarta",
	"até quinta",
	"até sexta",
	"até sábado",
	"até domingo",
	"até semana que vem",
	"até mês que vem",
	"até ano que vem",
	"até depois",
	"flw",
	"falou",
	"fui"
];

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMembers,
	]
});

client.once('ready', () => {
	console.log(`✅ Bot ${client.user.tag} está online!`);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	const mensagemProcessada = removerAcentos(message.content);

	if (PALAVRAS_ENTRADA.some(palavra => mensagemProcessada.includes(palavra))) {
		try {
			await axios.post(`${process.env.API_URL}/register`, {
				usuario: message.author.username,
				mensagem: message.content
			});
			console.log(`✅ Entrada registrada para ${message.author.username}`);
		} catch (error) {
			console.error("❌ Erro ao registrar ponto:", error);
			await message.reply("❌ Ocorreu um erro ao registrar seu ponto.");
		}
	}

	if (PALAVRAS_SAIDA.some(palavra => removerAcentos(mensagemProcessada).includes(removerAcentos(palavra)))) {
		try {
			await axios.post(`${process.env.API_URL}/register`, {
				usuario: message.author.username,
				mensagem: message.content
			});
			console.log(`✅ Saída registrada para ${message.author.username}`);
		} catch (error) {
			console.error("❌ Erro ao registrar saída:", error);
			await message.reply("❌ Ocorreu um erro ao registrar sua saída.");
		}
	}
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
	if (!oldPresence || !newPresence) return;

	const usuario = newPresence.user.username;
	const statusAntigo = oldPresence.status;
	const statusAtual = newPresence.status;

	console.log(`📡 ${usuario} mudou de status: ${statusAntigo} → ${statusAtual}`);
	let registro
	try {
		const response = await axios.get(`${process.env.API_URL}/registro/${usuario}`);
		registro = response.data;

		if (registro.saida) {
			console.log(`⛔ ${usuario} já marcou saída às ${registro.saida}, não registrando pausa.`);
			return;
		}
	} catch (error) {
		if (error.response && error.response.status === 404) {
			console.log(`🔎 Nenhum registro encontrado para ${usuario}, seguindo normalmente.`);
		} else {
			console.error("❌ Erro ao verificar status do usuário:", error);
			return;
		}
	}

	if (statusAntigo === "online" && (statusAtual === "idle" || statusAtual === "offline")) {
		try {
			await axios.post(`${process.env.API_URL}/pause`, {
				usuario,
				inicio: new Date().toISOString()
			});
			console.log(`⏸️ Pausa iniciada para ${usuario}`);
		} catch (error) {
			console.error("❌ Erro ao registrar pausa:", error);
		}
	}

	if ((statusAntigo === "idle" || statusAntigo === "offline") && statusAtual === "online") {
		try {
			await axios.post(`${process.env.API_URL}/resume`, {
				usuario,
				fim: new Date().toISOString()
			});
			console.log(`▶️ Pausa finalizada para ${usuario}`);
		} catch (error) {
			console.error("❌ Erro ao registrar fim da pausa:", error);
		}
	}
});

client.login(process.env.DISCORD_BOT_TOKEN);

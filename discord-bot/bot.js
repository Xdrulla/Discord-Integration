require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences
	]
});

client.once('ready', () => {
	console.log(`✅ Bot ${client.user.tag} está online!`);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	const lowerMessage = message.content.toLowerCase();

	if (lowerMessage.includes("bom dia") || lowerMessage.includes("até amanhã")) {
		try {
			await axios.post(`${process.env.API_URL}/register`, {
				usuario: message.author.username,
				mensagem: message.content,
				horario: new Date().toISOString()
			});

			await message.reply("✅ Registro de ponto salvo!");
		} catch (error) {
			console.error("Erro ao registrar ponto:", error);
			await message.reply("❌ Erro ao registrar ponto.");
		}
	}
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
	if (!oldPresence || !newPresence) return;

	const usuario = newPresence.user.username;
	const statusAntigo = oldPresence.status;
	const statusAtual = newPresence.status;

	console.log(`📡 ${usuario} mudou de status: ${statusAntigo} → ${statusAtual}`);

	if (statusAntigo === "online" && (statusAtual === "idle" || statusAtual === "offline")) {
		try {
			await axios.post(`${process.env.API_URL}/pause`, {
				usuario,
				inicio: new Date().toISOString()
			});
			console.log(`⏸️ Pausa iniciada para ${usuario}`);
		} catch (error) {
			console.error("Erro ao registrar pausa:", error);
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
			console.error("Erro ao registrar fim da pausa:", error);
		}
	}
});

client.login(process.env.DISCORD_BOT_TOKEN);

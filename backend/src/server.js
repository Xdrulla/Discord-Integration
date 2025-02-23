require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = {
	type: "service_account",
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: "https://accounts.google.com/o/oauth2/auth",
	token_uri: "https://oauth2.googleapis.com/token",
	auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
	client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
	universe_domain: "googleapis.com"
};

initializeApp({
	credential: cert(serviceAccount)
});

const db = getFirestore();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('✅ API rodando!');
});

app.post('/register', async (req, res) => {
	try {
		const { usuario, mensagem } = req.body;
		const agora = new Date();
		const dataFormatada = agora.toISOString().split("T")[0]; // YYYY-MM-DD
		const horaAtual = agora.toTimeString().split(" ")[0].substring(0, 5); // HH:mm

		const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
		const doc = await registroRef.get();

		let dadosRegistro = {
			usuario,
			data: dataFormatada
		};

		if (!doc.exists) {
			dadosRegistro.entrada = horaAtual;
		} else {
			const registroAtual = doc.data();
			if (mensagem.toLowerCase().includes("até amanhã")) {
				dadosRegistro.saida = horaAtual;
				if (registroAtual.entrada) {
					const { totalHoras, totalPausas } = calcularHorasTrabalhadas(registroAtual.entrada, horaAtual, registroAtual.pausas || []);
					dadosRegistro.total_horas = totalHoras;
					dadosRegistro.total_pausas = totalPausas;
				}
			}
		}

		await registroRef.set(dadosRegistro, { merge: true });
		res.json({ success: true, message: "Registro atualizado!" });
	} catch (error) {
		console.error("Erro ao salvar no banco:", error);
		res.status(500).json({ error: "Erro ao salvar no banco de dados" });
	}
});

function calcularHorasTrabalhadas(entrada, saida, pausas) {
	const totalMinutos = (parseInt(saida.split(":")[0]) * 60 + parseInt(saida.split(":")[1])) -
		(parseInt(entrada.split(":")[0]) * 60 + parseInt(entrada.split(":")[1]));

	let minutosPausa = 0;

	if (pausas && pausas.length > 0) {
		pausas.forEach(p => {
			if (p.inicio && p.fim) {
				minutosPausa += (new Date(p.fim) - new Date(p.inicio)) / 60000;
			}
		});
	}

	const minutosTrabalhados = totalMinutos - minutosPausa;

	return {
		totalHoras: formatarTempo(minutosTrabalhados),
		totalPausas: formatarTempo(minutosPausa)
	};
}

function formatarTempo(minutos) {
	const horas = Math.floor(minutos / 60);
	const minutosRestantes = minutos % 60;
	return `${horas}h ${minutosRestantes}m`;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

const express = require('express');
const cors = require('cors');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../firebase-key.json');

initializeApp({
	credential: cert(serviceAccount)
});

const db = getFirestore();
const app = express();
app.use(cors());
app.use(express.json());

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
			dadosRegistro.saida = null;
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
})

app.post('/pause', async (req, res) => {
	try {
		const { usuario, inicio } = req.body;
		const dataFormatada = inicio.split("T")[0];

		const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
		const doc = await registroRef.get();

		if (!doc.exists) {
			return res.status(400).json({ error: "Usuário ainda não iniciou expediente." });
		}

		const registroAtual = doc.data();
		const pausas = registroAtual.pausas || [];
		pausas.push({ inicio });

		await registroRef.update({ pausas });

		res.json({ success: true, message: "Pausa registrada!" });
	} catch (error) {
		console.error("Erro ao registrar pausa:", error);
		res.status(500).json({ error: "Erro ao registrar pausa" });
	}
});

app.post('/resume', async (req, res) => {
	try {
		const { usuario, fim } = req.body;
		const dataFormatada = fim.split("T")[0];

		const registroRef = db.collection("registros").doc(`${usuario}_${dataFormatada}`);
		const doc = await registroRef.get();

		if (!doc.exists) {
			return res.status(400).json({ error: "Usuário ainda não iniciou expediente." });
		}

		const registroAtual = doc.data();
		let pausas = registroAtual.pausas || [];

		if (pausas.length > 0 && !pausas[pausas.length - 1].fim) {
			pausas[pausas.length - 1].fim = fim;
			const duracao = (new Date(fim) - new Date(pausas[pausas.length - 1].inicio)) / 60000;
			pausas[pausas.length - 1].duracao = `${Math.floor(duracao / 60)}h${duracao % 60}m`;

			await registroRef.update({ pausas });
		}

		res.json({ success: true, message: "Fim da pausa registrado!" });
	} catch (error) {
		console.error("Erro ao registrar fim da pausa:", error);
		res.status(500).json({ error: "Erro ao registrar fim da pausa" });
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
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

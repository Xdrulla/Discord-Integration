require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com",
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function subtrair3Horas(horaStr) {
  const [h, m] = horaStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m);
  date.setSeconds(0);
  date.setHours(date.getHours() - 3);

  const horas = String(date.getHours()).padStart(2, "0");
  const minutos = String(date.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

async function ajustarHorarios() {
  const snapshot = await db.collection("registros").get();
  const batch = db.batch();
  let totalCorrigidos = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const atualizacao = {};
    let precisaAtualizar = false;

    if (data.entrada && data.entrada !== "-") {
      const novaEntrada = subtrair3Horas(data.entrada);
      if (novaEntrada !== data.entrada) {
        atualizacao.entrada = novaEntrada;
        precisaAtualizar = true;
      }
    }

    if (data.saida && data.saida !== "-") {
      const novaSaida = subtrair3Horas(data.saida);
      if (novaSaida !== data.saida) {
        atualizacao.saida = novaSaida;
        precisaAtualizar = true;
      }
    }

    if (precisaAtualizar) {
      batch.update(db.collection("registros").doc(doc.id), atualizacao);
      totalCorrigidos++;
    }
  });

  await batch.commit();
  console.log(`✅ ${totalCorrigidos} registros corrigidos com sucesso!`);
}

ajustarHorarios().catch(console.error);

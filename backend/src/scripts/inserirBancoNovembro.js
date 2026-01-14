require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Configuração do Firebase
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

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Dados do banco de horas de Novembro/2025
const bancoNovembro = [
  { nome: "Luan Drulla", discordId: "1126951391244603472", saldoMinutos: 120 },
  { nome: "Gustavo Haschich", discordId: "252950537559998471", saldoMinutos: 120 },
  { nome: "Carlos Henrique", discordId: "1171796385008455745", saldoMinutos: 120 },
  { nome: "Feliphe", discordId: "1148268621655703662", saldoMinutos: 120 },
  { nome: "Vinicius Grzyb", discordId: "1085617322250752041", saldoMinutos: 120 },
];

function formatarMinutosParaHoras(minutos) {
  const sinal = minutos < 0 ? "-" : "";
  const minutosAbs = Math.abs(minutos);
  const horas = Math.floor(minutosAbs / 60);
  const mins = minutosAbs % 60;
  return `${sinal}${horas}h ${mins}m`;
}

async function inserirBancoNovembro() {
  console.log("=".repeat(50));
  console.log("INSERINDO BANCO DE HORAS - NOVEMBRO 2025");
  console.log("=".repeat(50) + "\n");

  const ano = 2025;
  const mes = 11;
  const mesAnoKey = "2025-11";

  for (const usuario of bancoNovembro) {
    const documento = {
      ano,
      mes,
      mesAno: mesAnoKey,
      saldoMinutos: usuario.saldoMinutos,
      saldoFormatado: formatarMinutosParaHoras(usuario.saldoMinutos),
      fechadoEm: "2025-12-01T05:00:00.000Z",
      discordId: usuario.discordId,
    };

    const docRef = db
      .collection("banco_horas")
      .doc(usuario.discordId)
      .collection("historico")
      .doc(mesAnoKey);

    await docRef.set(documento);

    console.log(`✅ ${usuario.nome}: ${documento.saldoFormatado}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ ${bancoNovembro.length} registros inseridos com sucesso!`);
  console.log("=".repeat(50));

  process.exit(0);
}

inserirBancoNovembro().catch((error) => {
  console.error("❌ Erro:", error);
  process.exit(1);
});

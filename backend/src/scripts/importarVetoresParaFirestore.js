require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: 'googleapis.com',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const inputPath = path.join(__dirname, 'registros_vetorizados.jsonl');

(async () => {
  try {
    const linhas = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(Boolean);
    console.log(`🔎 Importando ${linhas.length} vetores para o Firestore...`);

    for (const linha of linhas) {
      const vetorObj = JSON.parse(linha);
      const { id, texto, embedding } = vetorObj;

      await db
        .collection('registros')
        .doc(id)
        .collection('embeddings')
        .doc('ada-002')
        .set({
          modelo: 'text-embedding-ada-002',
          vetor: embedding,
          texto,
          criado_em: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`✅ Inserido: ${id}`);
    }

    console.log('🎉 Todos os vetores foram importados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao importar vetores:', err.message);
  }
})();

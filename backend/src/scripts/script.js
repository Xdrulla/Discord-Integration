require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { calcularHorasTrabalhadas } = require("../utils/timeUtils");

// Configuração do Firebase seguindo o padrão do seu projeto
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

// Inicializar Firebase
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Mapeamento de displayNames para IDs do Discord
const userIds = {
  'Gustavo Haschich': '252950537559998471',
  'Vinicius Grzyb': '1085617322250752041',
  'Feliphe': '1148268621655703662',
  'Carlos Henrique': '1171796385008455745',
  'Wellington Moscon - GoEpik': '689550618117144645',
  'Luan Drulla': '1126951391244603472',
  'Jonathan Villaça': '1402283024577466441',
  'Diogo Haschich': '1344074391608098868',
  'Erick': '1446259821530579074',
  'Felipe Rodrigues': '1430980477627400245',
};

const timesheetData = {
  '2026-01-02': {
    'Vinicius Grzyb': { entrada: '08:05', saida: '17:06', intervalo: 60 },
    'Feliphe': { entrada: '08:22', saida: '17:22', intervalo: 60 },
    'Diogo Haschich': { entrada: '08:42', saida: '14:53', intervalo: 0 },
    'Erick': { entrada: '12:57', saida: '19:02', intervalo: 0 },
  },
  '2026-01-05': {
    'Luan Drulla': { entrada: '08:07', saida: '17:08', intervalo: 60 },
    'Vinicius Grzyb': { entrada: '08:27', saida: '17:33', intervalo: 60 },
    'Feliphe': { entrada: '08:27', saida: '17:30', intervalo: 60 },
    'Erick': { entrada: '12:56', saida: '19:00', intervalo: 0 },
    'Felipe Rodrigues': { entrada: '08:25', saida: '17:25', intervalo: 60 },
  },
  '2026-01-06': {
    'Felipe Rodrigues': { entrada: '07:16', saida: '17:12', intervalo: 60 },
    'Vinicius Grzyb': { entrada: '08:17', saida: '17:20', intervalo: 60 },
    'Feliphe': { entrada: '08:19', saida: '17:19', intervalo: 60 },
    'Luan Drulla': { entrada: '08:30', saida: '17:25', intervalo: 60 },
    'Erick': { entrada: '12:58', saida: '19:02', intervalo: 0 },
  },
  '2026-01-07': {
    'Felipe Rodrigues': { entrada: '07:34', saida: '17:29', intervalo: 60 },
    'Feliphe': { entrada: '08:21', saida: '17:27', intervalo: 60 },
    'Vinicius Grzyb': { entrada: '08:29', saida: '17:27', intervalo: 60 },
    'Luan Drulla': { entrada: '08:47', saida: '17:31', intervalo: 60 },
    'Erick': { entrada: '13:02', saida: '19:00', intervalo: 0 },
  },
  '2026-01-08': {
    'Felipe Rodrigues': { entrada: '07:09', saida: '17:39', intervalo: 60 },
    'Feliphe': { entrada: '08:18', saida: '17:23', intervalo: 60 },
    'Carlos Henrique': { entrada: '08:29', saida: '17:35', intervalo: 60 },
    'Vinicius Grzyb': { entrada: '08:32', saida: '17:35', intervalo: 60 },
    'Luan Drulla': { entrada: '08:50', saida: '17:50', intervalo: 60 },
    'Erick': { entrada: '12:55', saida: '19:00', intervalo: 0 },
  },
  '2026-01-09': {
    'Felipe Rodrigues': { entrada: '08:05', saida: '18:04', intervalo: 60 },
    'Feliphe': { entrada: '08:19', saida: '17:28', intervalo: 60 },
    'Vinicius Grzyb': { entrada: '08:44', saida: '17:46', intervalo: 60 },
    'Luan Drulla': { entrada: '08:50', saida: '17:51', intervalo: 60 },
    'Carlos Henrique': { entrada: '08:52', saida: '15:03', intervalo: 60 },
    'Erick': { entrada: '12:56', saida: '19:00', intervalo: 0 },
  },
};

// Função para calcular horas trabalhadas usando a mesma lógica do seu sistema
function calcularHorasTrabalhadasCustom(entrada, saida, dataFormatada, intervaloMinutos = 60) {
  const dataCompletaEntrada = `${dataFormatada}T${entrada}:00`;
  const dataCompletaSaida = `${dataFormatada}T${saida}:00`;

  // Calcular pausa baseada no intervalo especificado (0 para estagiários)
  let pausaAlmoco = [];
  if (intervaloMinutos > 0) {
    pausaAlmoco = [
      {
        inicio: `${dataFormatada}T12:00:00`,
        fim: `${dataFormatada}T13:00:00`
      }
    ];
  }

  const { totalHoras, totalPausas } = calcularHorasTrabalhadas(
    dataCompletaEntrada,
    dataCompletaSaida,
    pausaAlmoco
  );

  return { totalHoras, totalPausas, intervaloMinutos };
}

// Função principal para inserir os dados seguindo o padrão do seu sistema
async function inserirDadosPonto() {
  try {
    console.log('🚀 Iniciando inserção dos dados de ponto...');
    console.log('📋 Seguindo estrutura da collection "registros"');
    console.log('🗓️  Período: 02/01/2026 a 07/01/2026');
    console.log('📝 Formato do documento: displayName_YYYY-MM-DD\n');

    let totalInseridos = 0;

    for (const [data, usuarios] of Object.entries(timesheetData)) {
      console.log(`📅 Processando data: ${data}`);

      for (const [displayName, horarios] of Object.entries(usuarios)) {
        const discordId = userIds[displayName];

        if (!discordId) {
          console.log(`⚠️  Discord ID não encontrado para: ${displayName}`);
          continue;
        }

        const intervaloMinutos = horarios.intervalo !== undefined ? horarios.intervalo : 60;

        // Calcular horas trabalhadas usando sua função
        const { totalHoras, totalPausas } = calcularHorasTrabalhadasCustom(
          horarios.entrada,
          horarios.saida,
          data,
          intervaloMinutos
        );

        // Criar ID do documento no padrão: 'displayName_YYYY-MM-DD'
        const documentId = `${displayName}_${data}`;

        // Estrutura de dados seguindo exatamente o padrão do seu sistema
        // Estagiários (Diogo e Erick) não têm pausa
        const pausas = intervaloMinutos > 0 ? [
          {
            inicio: `${data}T12:00:00.000Z`,
            fim: `${data}T13:00:00.000Z`
          }
        ] : [];

        const dadosRegistro = {
          usuario: displayName,
          data: data,
          entrada: horarios.entrada,
          saida: horarios.saida,
          total_horas: totalHoras,
          total_pausas: totalPausas,
          discordId: discordId,
          pausas: pausas,
          manual: false,
          createdAt: new Date().toISOString()
        };

        // Inserir no Firebase na collection "registros"
        const docRef = db.collection('registros').doc(documentId);
        await docRef.set(dadosRegistro);

        const pausaInfo = intervaloMinutos > 0 ? '(1h intervalo)' : '(sem intervalo)';
        console.log(`✅ ${displayName}: ${horarios.entrada} → ${horarios.saida} = ${totalHoras} ${pausaInfo}`);
        totalInseridos++;
      }

      console.log(''); // Linha em branco
    }

    console.log(`🎉 Inserção concluída! Total de registros inseridos: ${totalInseridos}`);
    console.log('📊 Os registros seguem a estrutura padrão da collection "registros"');
    console.log('👤 Formato do documento: displayName_YYYY-MM-DD');
    console.log('📅 Período processado: 02/01/2026 a 07/01/2026');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
    process.exit(1);
  }
}

// Função para verificar os dados antes de inserir
function verificarDados() {
  console.log('=== 🔍 VERIFICAÇÃO DOS DADOS ===\n');
  console.log('🗓️  Período: 02/01/2026 a 07/01/2026');
  console.log('👤 Formato do documento: displayName_YYYY-MM-DD');
  console.log('⏰ Estagiários (Diogo e Erick) sem intervalo\n');

  let totalRegistros = 0;
  const resumoPorDia = {};

  for (const [data, usuarios] of Object.entries(timesheetData)) {
    console.log(`📅 Data: ${data}`);
    resumoPorDia[data] = Object.keys(usuarios).length;

    for (const [displayName, horarios] of Object.entries(usuarios)) {
      const discordId = userIds[displayName];
      const documentId = `${displayName}_${data}`;

      if (!discordId) {
        console.log(`  ❌ ${displayName} - Discord ID não encontrado!`);
        continue;
      }

      const intervaloMinutos = horarios.intervalo !== undefined ? horarios.intervalo : 60;

      const { totalHoras, totalPausas } = calcularHorasTrabalhadasCustom(
        horarios.entrada,
        horarios.saida,
        data,
        intervaloMinutos
      );

      const pausaInfo = intervaloMinutos > 0 ? '1h intervalo' : 'sem intervalo';
      console.log(`  👤 ${displayName}`);
      console.log(`     Discord ID: ${discordId}`);
      console.log(`     Doc ID: ${documentId}`);
      console.log(`     Entrada: ${horarios.entrada}`);
      console.log(`     Saída: ${horarios.saida}`);
      console.log(`     Horas trabalhadas: ${totalHoras} (${pausaInfo})`);
      console.log(`     Total pausas: ${totalPausas}`);
      console.log('');

      totalRegistros++;
    }
  }

  console.log(`📊 RESUMO GERAL:`);
  console.log(`   Total de registros: ${totalRegistros}`);
  console.log(`   Dias processados: ${Object.keys(timesheetData).length}`);
  console.log(`   Registros por dia:`);

  for (const [data, quantidade] of Object.entries(resumoPorDia)) {
    console.log(`     ${data}: ${quantidade} pessoas`);
  }

  console.log('\n🏗️  Estrutura seguirá o padrão da collection "registros"');
  console.log('⏰ CLT: 1 hora de pausa | Estagiários: sem pausa');
  console.log('👤 Usando displayName para campo "usuario" e ID do documento\n');
}

// Função para verificar se já existem registros
async function verificarRegistrosExistentes() {
  console.log('🔍 Verificando registros existentes para janeiro de 2026...\n');

  let encontrados = 0;

  for (const [data, usuarios] of Object.entries(timesheetData)) {
    console.log(`📅 Verificando ${data}:`);
    for (const [displayName] of Object.entries(usuarios)) {
      const documentId = `${displayName}_${data}`;
      const docRef = db.collection('registros').doc(documentId);
      const doc = await docRef.get();

      if (doc.exists) {
        console.log(`  ⚠️  EXISTE: ${documentId}`);
        const dados = doc.data();
        console.log(`     Entrada atual: ${dados.entrada || 'N/A'}`);
        console.log(`     Saída atual: ${dados.saida || 'N/A'}`);
        console.log(`     Total horas: ${dados.total_horas || 'N/A'}`);
        encontrados++;
      } else {
        console.log(`  ✅ Livre: ${documentId}`);
      }
    }
    console.log('');
  }

  if (encontrados === 0) {
    console.log('✅ Nenhum registro encontrado para o período. Seguro para inserir!');
  } else {
    console.log(`⚠️  Encontrados ${encontrados} registros existentes. Verifique antes de inserir!`);
  }
}

// Função para executar com confirmação automática
async function executarComConfirmacao() {
  console.log('🔧 Sistema de Ponto - Inserção de Dados Históricos');
  console.log('📂 Collection: registros');
  console.log('🗓️  Período: 01/08/2025 a 21/08/2025');
  console.log('👤 Formato: displayName_YYYY-MM-DD');
  console.log('🆕 Novos usuários: Jonathan Villaça e Diogo Haschich\n');

  // Verificar os dados primeiro
  verificarDados();

  console.log('⚠️  ATENÇÃO: Este script irá inserir dados na collection "registros"');
  console.log('📝 Certifique-se de que não existem registros duplicados para essas datas\n');

  // Aguardar 3 segundos e executar automaticamente
  console.log('🚀 Iniciando inserção em 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  await inserirDadosPonto();
  process.exit(0);
}

// Função padrão para visualização
async function executar() {
  console.log('🔧 Sistema de Ponto - Inserção de Dados Históricos');
  console.log('📂 Collection: registros');
  console.log('🗓️  Período: 06/08/2025 a 21/08/2025');
  console.log('👤 Formato: displayName_YYYY-MM-DD');
  console.log('🆕 Novos usuários: Jonathan Villaça e Diogo Haschich\n');

  // Verificar os dados primeiro
  verificarDados();

  console.log('⚠️  ATENÇÃO: Este script irá inserir dados na collection "registros"');
  console.log('📝 Certifique-se de que não existem registros duplicados para essas datas');
  console.log('');
  console.log('💡 Para executar imediatamente: node script.js --execute');
  console.log('🔍 Para verificar registros existentes: node script.js --check-existing');
  console.log('🚫 Para cancelar, pressione Ctrl+C');
}

// Exportar funções
module.exports = {
  inserirDadosPonto,
  verificarDados,
  executar,
  verificarRegistrosExistentes
};

// Executar automaticamente se o script for chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--execute') || args.includes('-e')) {
    executarComConfirmacao().catch(console.error);
  } else if (args.includes('--check-existing')) {
    verificarRegistrosExistentes().catch(console.error);
  } else {
    executar().catch(console.error);
  }
}
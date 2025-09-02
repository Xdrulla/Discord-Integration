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
  'Cleverson': '663798051382493212',
  'Thiago Foltran': '1031897347849981952',
  'Vinicius Grzyb': '1085617322250752041',
  'Feliphe': '1148268621655703662',
  'Carlos Henrique': '1171796385008455745',
  'Iza': '1197244152837058575',
  'Wellington Moscon - GoEpik': '689550618117144645',
  'Luan Drulla': '1126951391244603472',
  'Jonathan Villaça': '1402283024577466441',
  'Diogo Haschich': '1344074391608098868'
};

const timesheetData = {
  '2025-08-25': {
    'Vinicius Grzyb': { entrada: '08:14', saida: '17:35' },
    'Cleverson': { entrada: '08:28', saida: '17:30' },
    'Luan Drulla': { entrada: '08:45', saida: '17:46' },
    'Gustavo Haschich': { entrada: '08:17', saida: '17:43' },
    'Feliphe': { entrada: '08:30', saida: '17:55' },
    'Carlos Henrique': { entrada: '08:54', saida: '17:55' },
    'Wellington Moscon - GoEpik': { entrada: '09:03', saida: '18:40' },
    'Diogo Haschich': { entrada: '13:58', saida: '19:29' },
  },
  '2025-08-26': {
    'Vinicius Grzyb': { entrada: '08:30', saida: '17:40' },
    'Cleverson': { entrada: '08:13', saida: '16:46' },
    'Luan Drulla': { entrada: '08:44', saida: '17:00' },
    'Gustavo Haschich': { entrada: '08:21', saida: '18:01' },
    'Feliphe': { entrada: '08:23', saida: '17:34' },
    'Carlos Henrique': { entrada: '09:01', saida: '17:46' },
    'Iza': { entrada: '07:53', saida: '16:08' },
    'Wellington Moscon - GoEpik': { entrada: '08:47', saida: '18:24' },
    'Diogo Haschich': { entrada: '13:58', saida: '18:01' },
  },
  '2025-08-27': {
    'Vinicius Grzyb': { entrada: '08:14', saida: '17:38' },
    'Cleverson': { entrada: '08:23', saida: '17:24' },
    'Luan Drulla': { entrada: '08:31', saida: '18:00' },
    'Gustavo Haschich': { entrada: '08:26', saida: '17:54' },
    'Feliphe': { entrada: '08:46', saida: '17:50' },
    'Carlos Henrique': { entrada: '08:55', saida: '17:56' },
    'Iza': { entrada: '07:45', saida: '16:00' },
    'Wellington Moscon - GoEpik': { entrada: '08:59', saida: '19:18' },
    'Diogo Haschich': { entrada: '14:00', saida: '18:59' },
  },
  '2025-08-28': {
    'Vinicius Grzyb': { entrada: '08:17', saida: '18:12' },
    'Cleverson': { entrada: '08:10', saida: '17:17' },
    'Luan Drulla': { entrada: '08:56', saida: '18:11' },
    'Gustavo Haschich': { entrada: '08:08', saida: '18:41' },
    'Feliphe': { entrada: '08:31', saida: '17:43' },
    'Carlos Henrique': { entrada: '08:53', saida: '17:53' },
    'Iza': { entrada: '07:55', saida: '16:30' },
    'Wellington Moscon - GoEpik': { entrada: '08:53', saida: '18:00' },
    'Diogo Haschich': { entrada: '13:58', saida: '19:00' },
  },
  '2025-08-29': {
    'Vinicius Grzyb': { entrada: '08:20', saida: '18:55' },
    'Cleverson': { entrada: '07:52', saida: '17:08' },
    'Luan Drulla': { entrada: '08:45', saida: '19:04' },
    'Gustavo Haschich': { entrada: '07:43', saida: '18:10' },
    'Feliphe': { entrada: '08:32', saida: '17:33' },
    'Carlos Henrique': { entrada: '08:55', saida: '17:56' },
    'Iza': { entrada: '08:00', saida: '16:16' },
    'Wellington Moscon - GoEpik': { entrada: '09:18', saida: '19:06' },
    'Diogo Haschich': { entrada: '13:59', saida: '19:01' },
  },
  '2025-08-30': {
    'Vinicius Grzyb': { entrada: '14:30', saida: '16:27' },
  },
};

// Função para calcular horas trabalhadas usando a mesma lógica do seu sistema
function calcularHorasTrabalhadasCustom(entrada, saida, dataFormatada) {
  const dataCompletaEntrada = `${dataFormatada}T${entrada}:00`;
  const dataCompletaSaida = `${dataFormatada}T${saida}:00`;

  // Simular 1 hora de pausa (conforme especificado)
  const pausaAlmoco = [
    {
      inicio: `${dataFormatada}T12:00:00`,
      fim: `${dataFormatada}T13:00:00`
    }
  ];

  const { totalHoras, totalPausas } = calcularHorasTrabalhadas(
    dataCompletaEntrada,
    dataCompletaSaida,
    pausaAlmoco
  );

  return { totalHoras, totalPausas };
}

// Função principal para inserir os dados seguindo o padrão do seu sistema
async function inserirDadosPonto() {
  try {
    console.log('🚀 Iniciando inserção dos dados de ponto...');
    console.log('📋 Seguindo estrutura da collection "registros"');
    console.log('🗓️  Período: 01/08/2025 a 21/08/2025');
    console.log('👥 Incluindo: Jonathan Villaça, Diogo Haschich');
    console.log('👋 Último dia do Thiago: 14/08/2025');
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

        // Calcular horas trabalhadas usando sua função
        const { totalHoras, totalPausas } = calcularHorasTrabalhadasCustom(
          horarios.entrada,
          horarios.saida,
          data
        );

        // Criar ID do documento no padrão: 'displayName_YYYY-MM-DD'
        const documentId = `${displayName}_${data}`;

        // Estrutura de dados seguindo exatamente o padrão do seu sistema
        const dadosRegistro = {
          usuario: displayName,
          data: data,
          entrada: horarios.entrada,
          saida: horarios.saida,
          total_horas: totalHoras,
          total_pausas: totalPausas,
          discordId: discordId,
          pausas: [
            {
              inicio: `${data}T12:00:00.000Z`,
              fim: `${data}T13:00:00.000Z`
            }
          ],
          manual: false,
          createdAt: new Date().toISOString()
        };

        // Inserir no Firebase na collection "registros"
        const docRef = db.collection('registros').doc(documentId);
        await docRef.set(dadosRegistro);

        console.log(`✅ ${displayName}: ${horarios.entrada} → ${horarios.saida} = ${totalHoras} (ID: ${discordId})`);
        totalInseridos++;
      }

      console.log(''); // Linha em branco
    }

    console.log(`🎉 Inserção concluída! Total de registros inseridos: ${totalInseridos}`);
    console.log('📊 Os registros seguem a estrutura padrão da collection "registros"');
    console.log('👤 Formato do documento: displayName_YYYY-MM-DD');
    console.log('📅 Período processado: 01/08/2025 a 21/08/2025');
    console.log('🆕 Novos usuários: Jonathan Villaça e Diogo Haschich');
    console.log('👋 Thiago Foltran - último registro: 14/08/2025');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
    process.exit(1);
  }
}

// Função para verificar os dados antes de inserir
function verificarDados() {
  console.log('=== 🔍 VERIFICAÇÃO DOS DADOS ===\n');
  console.log('🗓️  Período: 01/08/2025 a 21/08/2025');
  console.log('👤 Formato do documento: displayName_YYYY-MM-DD');
  console.log('🆕 Novos usuários: Jonathan Villaça e Diogo Haschich');
  console.log('👋 Thiago Foltran sai em 14/08/2025\n');

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

      const { totalHoras, totalPausas } = calcularHorasTrabalhadasCustom(
        horarios.entrada,
        horarios.saida,
        data
      );

      console.log(`  👤 ${displayName}`);
      console.log(`     Discord ID: ${discordId}`);
      console.log(`     Doc ID: ${documentId}`);
      console.log(`     Entrada: ${horarios.entrada}`);
      console.log(`     Saída: ${horarios.saida}`);
      console.log(`     Horas trabalhadas: ${totalHoras}`);
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
  console.log('⏰ Cada registro terá 1 hora de pausa simulada (12:00-13:00)');
  console.log('👤 Usando displayName para campo "usuario" e ID do documento\n');
}

// Função para verificar se já existem registros
async function verificarRegistrosExistentes() {
  console.log('🔍 Verificando registros existentes para agosto de 2025...\n');

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
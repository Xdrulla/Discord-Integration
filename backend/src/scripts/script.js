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
  '2025-10-01': {
    'Iza': { entrada: '04:41', saida: '15:44' },
    'Cleverson': { entrada: '08:01', saida: '17:16' },
    'Feliphe': { entrada: '08:17', saida: '17:18' },
    'Vinicius Grzyb': { entrada: '08:17', saida: '17:20' },
    'Gustavo Haschich': { entrada: '08:28', saida: '17:41' },
    'Luan Drulla': { entrada: '08:57', saida: '18:41' },
    'Wellington Moscon - GoEpik': { entrada: '09:54', saida: '19:30' },
    'Jonathan Villaça': { entrada: '08:30', saida: '13:35' },
    'Diogo Haschich': { entrada: '13:59', saida: '19:03' },
  },
  '2025-10-02': {
    'Iza': { entrada: '05:01', saida: '16:27' },
    'Cleverson': { entrada: '08:03', saida: '18:15' },
    'Gustavo Haschich': { entrada: '08:22', saida: '17:51' },
    'Feliphe': { entrada: '08:23', saida: '17:29' },
    'Vinicius Grzyb': { entrada: '08:26', saida: '17:46' },
    'Luan Drulla': { entrada: '08:33', saida: '17:33' },
    'Wellington Moscon - GoEpik': { entrada: '08:58', saida: '17:40' },
    'Jonathan Villaça': { entrada: '12:59', saida: '18:14' },
    'Diogo Haschich': { entrada: '13:58', saida: '19:12' },
  },
  '2025-10-03': {
    'Jonathan Villaça': { entrada: '08:00', saida: '13:00' },
    'Cleverson': { entrada: '08:28', saida: '16:40' },
    'Vinicius Grzyb': { entrada: '08:53', saida: '17:47' },
    'Wellington Moscon - GoEpik': { entrada: '09:01', saida: '18:37' },
    'Luan Drulla': { entrada: '09:07', saida: '18:07' },
    'Feliphe': { entrada: '09:17', saida: '18:08' },
  },
  '2025-10-04': {
    'Cleverson': { entrada: '09:03', saida: '17:52' },
    'Vinicius Grzyb': { entrada: '09:25', saida: '19:45' },
  },
  '2025-10-06': {
    'Cleverson': { entrada: '08:21', saida: '17:53' },
    'Wellington Moscon - GoEpik': { entrada: '08:21', saida: '19:02' },
    'Feliphe': { entrada: '08:24', saida: '17:25' },
    'Gustavo Haschich': { entrada: '08:41', saida: '17:41' },
    'Vinicius Grzyb': { entrada: '08:44', saida: '13:04' },
    'Luan Drulla': { entrada: '08:46', saida: '17:44' },
    'Jonathan Villaça': { entrada: '09:09', saida: '17:51' },
    'Diogo Haschich': { entrada: '13:59', saida: '19:00' },
  },
  '2025-10-07': {
    'Cleverson': { entrada: '08:01', saida: '19:09' },
    'Vinicius Grzyb': { entrada: '08:16', saida: '18:51' },
    'Feliphe': { entrada: '08:21', saida: '17:52' },
    'Gustavo Haschich': { entrada: '08:33', saida: '17:50' },
    'Luan Drulla': { entrada: '08:56', saida: '18:28' },
    'Wellington Moscon - GoEpik': { entrada: '08:57', saida: '21:20' },
    'Jonathan Villaça': { entrada: '11:00', saida: '17:32' },
    'Diogo Haschich': { entrada: '14:00', saida: '18:03' },
  },
  '2025-10-08': {
    'Feliphe': { entrada: '08:26', saida: '17:32' },
    'Carlos Henrique': { entrada: '08:28', saida: '17:17' },
    'Gustavo Haschich': { entrada: '08:30', saida: '17:35' },
    'Cleverson': { entrada: '08:39', saida: '17:39' },
    'Vinicius Grzyb': { entrada: '08:51', saida: '18:51' },
    'Luan Drulla': { entrada: '08:56', saida: '17:57' },
    'Jonathan Villaça': { entrada: '12:57', saida: '17:02' },
    'Diogo Haschich': { entrada: '14:00', saida: '19:01' },
    'Wellington Moscon - GoEpik': { entrada: '08:57', saida: '17:50' },
  },
  '2025-10-09': {
    'Cleverson': { entrada: '08:13', saida: '20:01' },
    'Feliphe': { entrada: '08:18', saida: '17:23' },
    'Gustavo Haschich': { entrada: '08:27', saida: '18:09' },
    'Wellington Moscon - GoEpik': { entrada: '08:31', saida: '19:54' },
    'Vinicius Grzyb': { entrada: '08:35', saida: '17:47' },
    'Carlos Henrique': { entrada: '08:44', saida: '18:04' },
    'Luan Drulla': { entrada: '08:59', saida: '18:09' },
    'Jonathan Villaça': { entrada: '13:31', saida: '17:42' },
    'Diogo Haschich': { entrada: '13:57', saida: '19:00' },
  },
  '2025-10-10': {
    'Cleverson': { entrada: '08:07', saida: '17:46' },
    'Wellington Moscon - GoEpik': { entrada: '08:10', saida: '18:22' },
    'Gustavo Haschich': { entrada: '08:31', saida: '17:35' },
    'Feliphe': { entrada: '08:38', saida: '17:38' },
    'Luan Drulla': { entrada: '08:45', saida: '17:40' },
    'Vinicius Grzyb': { entrada: '08:46', saida: '17:44' },
    'Carlos Henrique': { entrada: '08:53', saida: '17:59' },
    'Jonathan Villaça': { entrada: '12:55', saida: '17:51' },
    'Diogo Haschich': { entrada: '13:59', saida: '19:00' },
  },
  '2025-10-13': {
    'Cleverson': { entrada: '08:01', saida: '17:52' },
    'Vinicius Grzyb': { entrada: '08:14', saida: '17:24' },
    'Feliphe': { entrada: '08:28', saida: '17:32' },
    'Gustavo Haschich': { entrada: '08:36', saida: '16:47' },
    'Carlos Henrique': { entrada: '08:53', saida: '17:31' },
    'Wellington Moscon - GoEpik': { entrada: '08:59', saida: '18:37' },
    'Luan Drulla': { entrada: '08:59', saida: '18:26' },
    'Jonathan Villaça': { entrada: '10:57', saida: '17:32' },
    'Diogo Haschich': { entrada: '13:59', saida: '19:01' },
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
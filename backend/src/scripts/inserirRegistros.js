require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

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

// Dados dos registros que precisam ser atualizados com intervalo
const registrosParaAtualizar = {
  "2025-09-22": [
    'Gustavo Haschich',
    'Iza',
    'Cleverson', 
    'Feliphe',
    'Vinicius Grzyb',
    'Carlos Henrique',
    'Luan Drulla',
    'Wellington Moscon - GoEpik'
  ]
};

// Função para atualizar registros com intervalo de 1 hora
async function atualizarRegistrosComIntervalo() {
  try {
    console.log('🔄 Iniciando atualização dos registros com intervalo...');
    console.log('⏰ Adicionando 1 hora de intervalo (12:00-13:00) para todos');
    console.log('📝 Atualizando registros existentes na collection "registros"\n');
    
    let totalAtualizados = 0;
    let totalNaoEncontrados = 0;
    
    for (const [data, usuarios] of Object.entries(registrosParaAtualizar)) {
      console.log(`📅 Processando data: ${data}`);
      
      for (const displayName of usuarios) {
        const documentId = `${displayName}_${data}`;
        const docRef = db.collection('registros').doc(documentId);
        
        try {
          const doc = await docRef.get();
          
          if (!doc.exists) {
            console.log(`  ❌ Registro não encontrado: ${documentId}`);
            totalNaoEncontrados++;
            continue;
          }
          
          const dadosAtuais = doc.data();
          
          // Criar o intervalo padrão de 1 hora
          const intervaloPadrao = {
            inicio: `${data}T12:00:00.000Z`,
            fim: `${data}T13:00:00.000Z`
          };
          
          // Atualizar apenas o campo de pausas
          const dadosAtualizados = {
            ...dadosAtuais,
            pausas: [intervaloPadrao],
            total_pausas: "01:00:00", // 1 hora de pausa
            updatedAt: new Date().toISOString()
          };
          
          // Atualizar o documento no Firebase
          await docRef.update(dadosAtualizados);
          
          console.log(`  ✅ ${displayName}: Intervalo 12:00-13:00 adicionado`);
          totalAtualizados++;
          
        } catch (error) {
          console.error(`  ❌ Erro ao atualizar ${documentId}:`, error.message);
        }
      }
      
      console.log(''); // Linha em branco
    }
    
    console.log(`🎉 Atualização concluída!`);
    console.log(`✅ Total de registros atualizados: ${totalAtualizados}`);
    console.log(`❌ Total não encontrados: ${totalNaoEncontrados}`);
    console.log('⏰ Intervalo padrão adicionado: 12:00-13:00 (1 hora)');
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    process.exit(1);
  }
}

// Função para verificar registros antes de atualizar
async function verificarRegistros() {
  console.log('=== 🔍 VERIFICAÇÃO DOS REGISTROS EXISTENTES ===\n');
  console.log('🔄 Modo: Atualização de intervalos');
  console.log('⏰ Intervalo a ser adicionado: 12:00-13:00 (1 hora)\n');
  
  let totalEncontrados = 0;
  let totalSemIntervalo = 0;
  
  for (const [data, usuarios] of Object.entries(registrosParaAtualizar)) {
    console.log(`📅 Data: ${data}`);
    
    for (const displayName of usuarios) {
      const documentId = `${displayName}_${data}`;
      const docRef = db.collection('registros').doc(documentId);
      
      try {
        const doc = await docRef.get();
        
        if (doc.exists) {
          const dados = doc.data();
          const temIntervalo = dados.pausas && dados.pausas.length > 0;
          
          console.log(`  👤 ${displayName}`);
          console.log(`     Doc ID: ${documentId}`);
          console.log(`     Entrada: ${dados.entrada || 'N/A'}`);
          console.log(`     Saída: ${dados.saida || 'N/A'}`);
          console.log(`     Pausas atuais: ${temIntervalo ? dados.pausas.length + ' registrada(s)' : 'Nenhuma'}`);
          console.log(`     Status: ${temIntervalo ? '⚠️  JÁ TEM INTERVALO' : '✅ PRECISA ATUALIZAR'}`);
          
          totalEncontrados++;
          if (!temIntervalo) totalSemIntervalo++;
        } else {
          console.log(`  ❌ ${displayName} - Registro não encontrado: ${documentId}`);
        }
        
        console.log('');
      } catch (error) {
        console.error(`  ❌ Erro ao verificar ${documentId}:`, error.message);
      }
    }
  }
  
  console.log(`📊 RESUMO:`);
  console.log(`   Registros encontrados: ${totalEncontrados}`);
  console.log(`   Precisam de atualização: ${totalSemIntervalo}`);
  console.log(`   Já têm intervalo: ${totalEncontrados - totalSemIntervalo}`);
  console.log('\n⏰ Intervalo que será adicionado: 12:00-13:00 (1 hora)\n');
}

// Função para executar com confirmação automática
async function executarComConfirmacao() {
  console.log('🔧 Sistema de Ponto - Atualização de Intervalos');
  console.log('📂 Collection: registros');
  console.log('⏰ Adicionando intervalo padrão: 12:00-13:00');
  console.log('🔄 Modo: Atualização de registros existentes\n');
  
  // Verificar os registros primeiro
  await verificarRegistros();
  
  console.log('⚠️  ATENÇÃO: Este script irá ATUALIZAR registros existentes');
  console.log('⏰ Será adicionado intervalo de 1 hora (12:00-13:00) para todos');
  console.log('🔄 Registros que já têm intervalo serão sobrescritos\n');
  
  // Aguardar 3 segundos e executar automaticamente
  console.log('🚀 Iniciando atualização em 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await atualizarRegistrosComIntervalo();
  process.exit(0);
}

// Função padrão para visualização
async function executar() {
  console.log('🔧 Sistema de Ponto - Atualização de Intervalos');
  console.log('📂 Collection: registros');
  console.log('⏰ Adicionando intervalo padrão: 12:00-13:00');
  console.log('🔄 Modo: Atualização de registros existentes\n');
  
  // Verificar os registros primeiro
  await verificarRegistros();
  
  console.log('⚠️  ATENÇÃO: Este script irá ATUALIZAR registros existentes');
  console.log('⏰ Intervalo de 1 hora (12:00-13:00) será adicionado');
  console.log('');
  console.log('💡 Para executar imediatamente: node script.js --execute');
  console.log('🔍 Para apenas verificar: node script.js --check');
  console.log('🚫 Para cancelar, pressione Ctrl+C');
}

// Exportar funções
module.exports = {
  atualizarRegistrosComIntervalo,
  verificarRegistros,
  executar
};

// Executar automaticamente se o script for chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--execute') || args.includes('-e')) {
    executarComConfirmacao().catch(console.error);
  } else if (args.includes('--check')) {
    verificarRegistros().catch(console.error);
  } else {
    executar().catch(console.error);
  }
}
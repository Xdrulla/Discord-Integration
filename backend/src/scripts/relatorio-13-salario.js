require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require('fs');
const path = require('path');

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

// Inicializar Firebase
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Configuração de jornada de trabalho
const HORAS_DIARIAS_PADRAO = 8; // 8 horas por dia
const MINUTOS_DIARIOS_PADRAO = HORAS_DIARIAS_PADRAO * 60; // 480 minutos

/**
 * Converte string de horas (formato "HH:mm:ss") para minutos
 */
function horasParaMinutos(horasString) {
  if (!horasString) return 0;

  const partes = horasString.split(':');
  const horas = parseInt(partes[0]) || 0;
  const minutos = parseInt(partes[1]) || 0;
  const segundos = parseInt(partes[2]) || 0;

  return (horas * 60) + minutos + (segundos / 60);
}

/**
 * Converte minutos para formato de horas legível
 */
function minutosParaHoras(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = Math.floor(minutos % 60);
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Busca todos os registros de ponto do Firebase
 */
async function buscarTodosRegistros() {
  console.log('🔍 Buscando todos os registros de ponto...\n');

  const registrosRef = db.collection('registros');
  const snapshot = await registrosRef.get();

  if (snapshot.empty) {
    console.log('⚠️  Nenhum registro encontrado!');
    return [];
  }

  const registros = [];
  snapshot.forEach(doc => {
    registros.push({
      id: doc.id,
      ...doc.data()
    });
  });

  console.log(`✅ ${registros.length} registros encontrados\n`);
  return registros;
}

/**
 * Processa os registros e calcula estatísticas por usuário
 */
function processarRegistros(registros) {
  console.log('📊 Processando registros...\n');

  const estatisticasPorUsuario = {};

  registros.forEach(registro => {
    const usuario = registro.usuario || 'Desconhecido';
    const totalHoras = registro.total_horas || '00:00:00';
    const data = registro.data;
    const discordId = registro.discordId;

    // Converter total de horas para minutos
    const minutosTrabalhadosDia = horasParaMinutos(totalHoras);

    // Calcular horas extras do dia (tudo acima de 8 horas)
    const minutosExtras = Math.max(0, minutosTrabalhadosDia - MINUTOS_DIARIOS_PADRAO);
    const minutosNormais = Math.min(minutosTrabalhadosDia, MINUTOS_DIARIOS_PADRAO);

    // Inicializar estatísticas do usuário se não existir
    if (!estatisticasPorUsuario[usuario]) {
      estatisticasPorUsuario[usuario] = {
        nome: usuario,
        discordId: discordId,
        totalDiasTrabalhados: 0,
        totalMinutosTrabalhados: 0,
        totalMinutosNormais: 0,
        totalMinutosExtras: 0,
        registros: [],
        primeiroRegistro: data,
        ultimoRegistro: data
      };
    }

    // Atualizar estatísticas
    const stats = estatisticasPorUsuario[usuario];
    stats.totalDiasTrabalhados++;
    stats.totalMinutosTrabalhados += minutosTrabalhadosDia;
    stats.totalMinutosNormais += minutosNormais;
    stats.totalMinutosExtras += minutosExtras;
    stats.registros.push({
      data: data,
      entrada: registro.entrada,
      saida: registro.saida,
      totalHoras: totalHoras,
      horasExtras: minutosParaHoras(minutosExtras),
      manual: registro.manual || false
    });

    // Atualizar datas
    if (data < stats.primeiroRegistro) stats.primeiroRegistro = data;
    if (data > stats.ultimoRegistro) stats.ultimoRegistro = data;
  });

  // Ordenar registros de cada usuário por data
  Object.values(estatisticasPorUsuario).forEach(stats => {
    stats.registros.sort((a, b) => a.data.localeCompare(b.data));
  });

  return estatisticasPorUsuario;
}

/**
 * Gera relatório consolidado
 */
function gerarRelatorioConsolidado(estatisticas) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('          RELATÓRIO DE HORAS TRABALHADAS - 13º SALÁRIO');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const usuarios = Object.values(estatisticas).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  let totalGeralMinutos = 0;
  let totalGeralExtras = 0;
  let totalGeralDias = 0;

  usuarios.forEach((stats, index) => {
    console.log(`\n${index + 1}. ${stats.nome.toUpperCase()}`);
    console.log('─'.repeat(65));
    console.log(`   Discord ID:           ${stats.discordId || 'N/A'}`);
    console.log(`   Período:              ${stats.primeiroRegistro} até ${stats.ultimoRegistro}`);
    console.log(`   Dias trabalhados:     ${stats.totalDiasTrabalhados} dias`);
    console.log(`   Total trabalhado:     ${minutosParaHoras(stats.totalMinutosTrabalhados)} horas`);
    console.log(`   Horas normais (8h/dia): ${minutosParaHoras(stats.totalMinutosNormais)} horas`);
    console.log(`   Horas extras:         ${minutosParaHoras(stats.totalMinutosExtras)} horas`);
    console.log(`   Média horas/dia:      ${minutosParaHoras(stats.totalMinutosTrabalhados / stats.totalDiasTrabalhados)} horas`);

    totalGeralMinutos += stats.totalMinutosTrabalhados;
    totalGeralExtras += stats.totalMinutosExtras;
    totalGeralDias += stats.totalDiasTrabalhados;
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                        RESUMO GERAL');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Total de funcionários:    ${usuarios.length}`);
  console.log(`   Total de dias trabalhados: ${totalGeralDias} dias`);
  console.log(`   Total geral trabalhado:    ${minutosParaHoras(totalGeralMinutos)} horas`);
  console.log(`   Total de horas extras:     ${minutosParaHoras(totalGeralExtras)} horas`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Exporta relatório detalhado para CSV
 */
function exportarParaCSV(estatisticas, nomeArquivo = 'relatorio-13-salario.csv') {
  console.log('📄 Gerando arquivo CSV...\n');

  const usuarios = Object.values(estatisticas).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  // Cabeçalho do CSV
  let csv = 'Nome,Discord ID,Período Início,Período Fim,Dias Trabalhados,Total Horas,Horas Normais,Horas Extras,Média Horas/Dia\n';

  // Adicionar dados de cada usuário
  usuarios.forEach(stats => {
    const mediaHorasDia = minutosParaHoras(stats.totalMinutosTrabalhados / stats.totalDiasTrabalhados);

    csv += `"${stats.nome}",`;
    csv += `"${stats.discordId || 'N/A'}",`;
    csv += `"${stats.primeiroRegistro}",`;
    csv += `"${stats.ultimoRegistro}",`;
    csv += `${stats.totalDiasTrabalhados},`;
    csv += `"${minutosParaHoras(stats.totalMinutosTrabalhados)}",`;
    csv += `"${minutosParaHoras(stats.totalMinutosNormais)}",`;
    csv += `"${minutosParaHoras(stats.totalMinutosExtras)}",`;
    csv += `"${mediaHorasDia}"\n`;
  });

  // Salvar arquivo
  const caminhoArquivo = path.join(__dirname, nomeArquivo);
  fs.writeFileSync(caminhoArquivo, csv, 'utf8');

  console.log(`✅ Arquivo CSV gerado: ${caminhoArquivo}\n`);
  return caminhoArquivo;
}

/**
 * Exporta relatório detalhado por dia para CSV
 */
function exportarDetalhamentoParaCSV(estatisticas, nomeArquivo = 'relatorio-detalhado-13-salario.csv') {
  console.log('📄 Gerando arquivo CSV detalhado por dia...\n');

  const usuarios = Object.values(estatisticas).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  // Cabeçalho do CSV
  let csv = 'Nome,Discord ID,Data,Entrada,Saída,Total Horas,Horas Extras,Manual\n';

  // Adicionar dados de cada usuário e cada dia
  usuarios.forEach(stats => {
    stats.registros.forEach(registro => {
      csv += `"${stats.nome}",`;
      csv += `"${stats.discordId || 'N/A'}",`;
      csv += `"${registro.data}",`;
      csv += `"${registro.entrada}",`;
      csv += `"${registro.saida}",`;
      csv += `"${registro.totalHoras}",`;
      csv += `"${registro.horasExtras}",`;
      csv += `"${registro.manual ? 'Sim' : 'Não'}"\n`;
    });
  });

  // Salvar arquivo
  const caminhoArquivo = path.join(__dirname, nomeArquivo);
  fs.writeFileSync(caminhoArquivo, csv, 'utf8');

  console.log(`✅ Arquivo CSV detalhado gerado: ${caminhoArquivo}\n`);
  return caminhoArquivo;
}

/**
 * Exporta relatório em JSON
 */
function exportarParaJSON(estatisticas, nomeArquivo = 'relatorio-13-salario.json') {
  console.log('📄 Gerando arquivo JSON...\n');

  const usuarios = Object.values(estatisticas).sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  const relatorio = {
    dataGeracao: new Date().toISOString(),
    totalFuncionarios: usuarios.length,
    usuarios: usuarios.map(stats => ({
      nome: stats.nome,
      discordId: stats.discordId,
      periodo: {
        inicio: stats.primeiroRegistro,
        fim: stats.ultimoRegistro
      },
      estatisticas: {
        diasTrabalhados: stats.totalDiasTrabalhados,
        totalHoras: minutosParaHoras(stats.totalMinutosTrabalhados),
        horasNormais: minutosParaHoras(stats.totalMinutosNormais),
        horasExtras: minutosParaHoras(stats.totalMinutosExtras),
        mediaHorasDia: minutosParaHoras(stats.totalMinutosTrabalhados / stats.totalDiasTrabalhados)
      },
      registros: stats.registros
    }))
  };

  // Salvar arquivo
  const caminhoArquivo = path.join(__dirname, nomeArquivo);
  fs.writeFileSync(caminhoArquivo, JSON.stringify(relatorio, null, 2), 'utf8');

  console.log(`✅ Arquivo JSON gerado: ${caminhoArquivo}\n`);
  return caminhoArquivo;
}

/**
 * Função principal
 */
async function gerarRelatorio13Salario() {
  try {
    console.log('🚀 Iniciando geração de relatório para 13º salário...\n');
    console.log('📋 Critério: Horas extras = tudo acima de 8h/dia\n');

    // 1. Buscar todos os registros
    const registros = await buscarTodosRegistros();

    if (registros.length === 0) {
      console.log('❌ Nenhum registro encontrado. Encerrando...');
      process.exit(1);
    }

    // 2. Processar registros
    const estatisticas = processarRegistros(registros);

    // 3. Gerar relatório consolidado no console
    gerarRelatorioConsolidado(estatisticas);

    // 4. Exportar para arquivos
    const csvConsolidado = exportarParaCSV(estatisticas);
    const csvDetalhado = exportarDetalhamentoParaCSV(estatisticas);
    const json = exportarParaJSON(estatisticas);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    RELATÓRIO CONCLUÍDO');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📁 Arquivos gerados:');
    console.log(`   • ${csvConsolidado}`);
    console.log(`   • ${csvDetalhado}`);
    console.log(`   • ${json}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('✅ Relatório pronto para envio ao RH!\n');

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  gerarRelatorio13Salario()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = {
  gerarRelatorio13Salario,
  buscarTodosRegistros,
  processarRegistros
};

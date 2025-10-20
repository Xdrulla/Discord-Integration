const db = require('../config/firebase');
const dayjs = require('dayjs');
const { calcularResumoMensal } = require('../utils/resumeUtils');

/**
 * Monta o contexto do sistema (personalidade da IA)
 * @returns {string} Contexto base do sistema
 */
exports.getSystemContext = () => {
  return `Você é o assistente inteligente do Pontobot, um sistema de controle de ponto.

**Sua personalidade:**
- Profissional, mas amigável e acessível
- Responde sempre em português brasileiro
- Objetivo e direto, mas prestativo
- Usa emojis ocasionalmente para deixar a conversa mais leve

**Suas capacidades:**
- Consultar registros de ponto (entrada, saída, horas trabalhadas)
- Fornecer resumos mensais de trabalho
- Esclarecer dúvidas sobre horas trabalhadas
- Ajudar com justificativas e ajustes de ponto
- Manter contexto da conversa para respostas mais naturais

**Regras importantes:**
- Se não souber algo, seja honesto
- Sempre confirme datas e dados importantes
- Sugira ações úteis quando apropriado (ex: "Quer que eu consulte outro mês?")
- Mantenha o foco em questões relacionadas ao controle de ponto`;
};

/**
 * Busca informações do registro do dia atual
 * @param {string} discordId - Discord ID do usuário
 * @param {string} usuario - Nome do usuário (para exibição)
 * @returns {Promise<string>} Contexto do registro de hoje
 */
exports.getRegistroHoje = async (discordId, usuario) => {
  if (!discordId) return '';

  try {
    const data = dayjs().format('YYYY-MM-DD');

    // Busca por discordId + data (query por campo)
    const snapshot = await db.collection('registros')
      .where('discordId', '==', discordId)
      .where('data', '==', data)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return `O usuário ${usuario || 'usuário'} ainda não possui registro para hoje (${dayjs().format('DD/MM/YYYY')}).`;
    }

    const registro = snapshot.docs[0].data();
    return `Registro de hoje (${dayjs().format('DD/MM/YYYY')}) para ${usuario || 'usuário'}:
- Entrada: ${registro.entrada || 'não marcada'}
- Saída: ${registro.saida || 'não marcada'}
- Total de horas: ${registro.total_horas || 'em andamento'}
- Pausas: ${registro.pausas?.length || 0} pausa(s) registrada(s)`;
  } catch (error) {
    console.error('❌ Erro ao buscar registro de hoje:', error.message);
    return '';
  }
};

/**
 * Busca informações de registro de data específica
 * @param {string} discordId - Discord ID do usuário
 * @param {string} usuario - Nome do usuário (para exibição)
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {Promise<string>} Contexto do registro da data
 */
exports.getRegistroData = async (discordId, usuario, data) => {
  if (!discordId || !data) return '';

  try {
    // Busca por discordId + data
    const snapshot = await db.collection('registros')
      .where('discordId', '==', discordId)
      .where('data', '==', data)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return `Nenhum registro encontrado para ${usuario || 'usuário'} em ${dayjs(data).format('DD/MM/YYYY')}.`;
    }

    const registro = snapshot.docs[0].data();
    return `Registro de ${dayjs(data).format('DD/MM/YYYY')} para ${usuario || 'usuário'}:
- Entrada: ${registro.entrada || 'não marcada'}
- Saída: ${registro.saida || 'não marcada'}
- Total de horas: ${registro.total_horas || 'n/a'}
- Pausas: ${registro.pausas?.length || 0} pausa(s)`;
  } catch (error) {
    console.error('❌ Erro ao buscar registro da data:', error.message);
    return '';
  }
};

/**
 * Busca resumo mensal do usuário
 * @param {string} discordId - Discord ID do usuário
 * @param {string} usuario - Nome do usuário
 * @param {number} ano - Ano
 * @param {number} mes - Mês (1-12)
 * @returns {Promise<string>} Contexto do resumo mensal
 */
exports.getResumoMensal = async (discordId, usuario, ano, mes) => {
  if (!discordId) return '';

  try {
    const resumo = await calcularResumoMensal(discordId, ano, mes);

    if (!resumo?.total_horas) {
      const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return `Nenhum dado encontrado para ${usuario} em ${meses[mes - 1]}/${ano}.`;
    }

    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    return `Resumo de ${meses[mes - 1]}/${ano} para ${usuario}:
- Total trabalhado: ${resumo.total_horas}
- Meta do mês: ${resumo.meta}
- Saldo de horas: ${resumo.saldo}
- Status: ${resumo.saldo.includes('-') ? 'Devendo horas' : 'Banco de horas positivo'}`;
  } catch (error) {
    console.error('❌ Erro ao buscar resumo mensal:', error.message);
    return '';
  }
};

/**
 * Monta contexto completo baseado na intenção detectada
 * @param {Object} params - Parâmetros
 * @param {Object} params.intent - Intenção detectada
 * @param {string} params.usuario - Nome do usuário
 * @param {string} params.discordId - Discord ID
 * @returns {Promise<string>} Contexto completo
 */
exports.buildContextFromIntent = async ({ intent, usuario, discordId }) => {
  let additionalContext = '';

  if (discordId) {
    additionalContext += await exports.getRegistroHoje(discordId, usuario);
  }

  switch (intent.intencao) {
    case 'resumo_mensal':
      if (intent.mes && discordId) {
        const meses = {
          janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4,
          maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9,
          outubro: 10, novembro: 11, dezembro: 12,
        };
        const mes = meses[intent.mes.toLowerCase()];
        const ano = intent.ano || new Date().getFullYear();

        if (mes) {
          const resumo = await exports.getResumoMensal(discordId, usuario, ano, mes);
          additionalContext += '\n\n' + resumo;
        }
      }
      break;

    case 'registro_data':
      if (intent.data && discordId) {
        const registro = await exports.getRegistroData(discordId, usuario, intent.data);
        additionalContext += '\n\n' + registro;
      }
      break;

    case 'registro_hoje':
      // Já incluído acima
      break;
  }

  return additionalContext;
};

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

/**
 * Extrai data de string em português
 * Exemplos: "ontem", "hoje", "15/01/2025", "15 de janeiro"
 * @param {string} text - Texto com possível data
 * @returns {string|null} Data no formato YYYY-MM-DD ou null
 */
exports.extractDateFromText = (text) => {
  const textoLower = text.toLowerCase();

  if (textoLower.includes('hoje')) {
    return dayjs().format('YYYY-MM-DD');
  }

  if (textoLower.includes('ontem')) {
    return dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  }

  if (textoLower.includes('anteontem')) {
    return dayjs().subtract(2, 'day').format('YYYY-MM-DD');
  }

  const formatoDDMMYYYY = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (formatoDDMMYYYY) {
    const [, dia, mes, ano] = formatoDDMMYYYY;
    const data = dayjs(`${ano}-${mes}-${dia}`, 'YYYY-MM-DD', true);
    if (data.isValid()) {
      return data.format('YYYY-MM-DD');
    }
  }

  const formatoDDMM = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (formatoDDMM) {
    const [, dia, mes] = formatoDDMM;
    const data = dayjs(`${new Date().getFullYear()}-${mes}-${dia}`, 'YYYY-MM-DD', true);
    if (data.isValid()) {
      return data.format('YYYY-MM-DD');
    }
  }

  return null;
};

/**
 * Extrai mês de string em português
 * @param {string} text - Texto com possível mês
 * @returns {Object|null} {mes: number, ano: number} ou null
 */
exports.extractMonthFromText = (text) => {
  const meses = {
    janeiro: 1, jan: 1,
    fevereiro: 2, fev: 2,
    marco: 3, março: 3, mar: 3,
    abril: 4, abr: 4,
    maio: 5, mai: 5,
    junho: 6, jun: 6,
    julho: 7, jul: 7,
    agosto: 8, ago: 8,
    setembro: 9, set: 9,
    outubro: 10, out: 10,
    novembro: 11, nov: 11,
    dezembro: 12, dez: 12,
  };

  const textoLower = text.toLowerCase();

  for (const [nome, numero] of Object.entries(meses)) {
    if (textoLower.includes(nome)) {
      const anoMatch = text.match(/\b(20\d{2})\b/);
      const ano = anoMatch ? parseInt(anoMatch[1]) : new Date().getFullYear();

      return { mes: numero, ano };
    }
  }

  return null;
};

/**
 * Valida se é uma pergunta relacionada ao sistema de ponto
 * @param {string} question - Pergunta do usuário
 * @returns {boolean}
 */
exports.isWorkRelatedQuestion = (question) => {
  const keywords = [
    'ponto', 'registro', 'entrada', 'saida', 'saída', 'hora',
    'trabalh', 'pausas', 'intervalo', 'banco de horas',
    'resumo', 'mensal', 'saldo', 'justificativa', 'hoje', 'ontem'
  ];

  const textoLower = question.toLowerCase();
  return keywords.some(keyword => textoLower.includes(keyword));
};

/**
 * Sanitiza entrada do usuário
 * @param {string} input - Input do usuário
 * @returns {string} Input sanitizado
 */
exports.sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, 1000)
    .replace(/[<>]/g, '');
};

/**
 * Formata resposta da IA removendo markdown desnecessário
 * @param {string} response - Resposta da IA
 * @returns {string} Resposta formatada
 */
exports.formatResponse = (response) => {
  return response
    .trim()
    .replace(/\*\*\*/g, '')
    .replace(/```/g, '');
};

/**
 * Gera ID único para sessão baseado em userId e timestamp
 * @param {string} userId - ID do usuário
 * @returns {string} Session ID
 */
exports.generateSessionId = (userId) => {
  const timestamp = Date.now();
  return `${userId}_${timestamp}`;
};

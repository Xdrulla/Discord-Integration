import dayjs from "dayjs";
import { extrairMinutosDeString, formatarMinutosParaHoras } from "./timeUtils";

/**
 * Utilitários específicos para cálculos do dashboard do leitor
 * Baseado nas regras de negócio: 8h trabalho + 1h almoço = 9h totais
 */

/**
 * Calcula o status atual baseado no registro
 * @param {Object} registro - Registro do dia atual
 * @returns {string} Status: 'nao_iniciado', 'trabalhando', 'pausado', 'finalizado'
 */
export function calcularStatusAtual(registro) {
  if (!registro) return 'nao_iniciado';

  const { entrada, saida, pausas = [] } = registro;

  // Não iniciou ainda
  if (!entrada) return 'nao_iniciado';

  // Já finalizou
  if (saida) return 'finalizado';

  // Verifica se está em pausa
  const pausaAtiva = pausas.find(pausa => pausa.inicio && !pausa.fim);
  if (pausaAtiva) return 'pausado';

  // Trabalhando normalmente
  return 'trabalhando';
}

/**
 * Calcula o tempo já trabalhado hoje
 * @param {Object} registro - Registro do dia atual
 * @returns {string} Tempo no formato "Xh Ym"
 */
export function calcularTempoTrabalhado(registro) {
  if (!registro || !registro.total_horas) {
    return '0h 0m';
  }

  return registro.total_horas;
}

/**
 * Calcula o tempo restante para completar 8h de trabalho
 * @param {Object} registro - Registro do dia atual
 * @returns {string} Tempo no formato "Xh Ym"
 */
export function calcularTempoRestante(registro) {
  if (!registro || !registro.total_horas) {
    return '8h 0m';
  }

  const minutosTrabalhadosHoje = extrairMinutosDeString(registro.total_horas);
  const metaDiaria = 8 * 60; // 8 horas em minutos
  const restante = Math.max(0, metaDiaria - minutosTrabalhadosHoje);

  return formatarMinutosParaHoras(restante);
}

/**
 * Calcula o horário previsto de saída baseado em 9h totais (8h + 1h almoço)
 * @param {Object} registro - Registro do dia atual
 * @returns {string} Horário no formato "HH:mm"
 */
export function calcularHorarioSaidaPrevisto(registro) {
  if (!registro || !registro.entrada) {
    return '--:--';
  }

  try {
    const hoje = dayjs().format('YYYY-MM-DD');
    const horarioEntrada = dayjs(`${hoje} ${registro.entrada}`);
    
    // Adiciona 9 horas (8h trabalho + 1h almoço)
    const horarioSaida = horarioEntrada.add(9, 'hour');
    
    return horarioSaida.format('HH:mm');
  } catch (error) {
    console.error('Erro ao calcular horário de saída:', error);
    return '--:--';
  }
}

/**
 * Calcula o progresso do dia em porcentagem (baseado em 8h de trabalho)
 * @param {Object} registro - Registro do dia atual
 * @returns {number} Porcentagem de 0 a 100
 */
export function calcularProgressoDia(registro) {
  if (!registro || !registro.total_horas) {
    return 0;
  }

  const minutosTrabalhadosHoje = extrairMinutosDeString(registro.total_horas);
  const metaDiaria = 8 * 60; // 8 horas em minutos
  const progresso = (minutosTrabalhadosHoje / metaDiaria) * 100;

  return Math.min(100, Math.max(0, progresso)); // Entre 0 e 100
}

/**
 * Calcula se o usuário pode sair agora (completou 8h)
 * @param {Object} registro - Registro do dia atual
 * @returns {boolean} True se pode sair
 */
export function podeSerFinalizado(registro) {
  const progresso = calcularProgressoDia(registro);
  return progresso >= 100;
}

/**
 * Calcula o total de pausas realizadas hoje
 * @param {Object} registro - Registro do dia atual
 * @returns {string} Tempo de pausas no formato "Xh Ym"
 */
export function calcularTotalPausas(registro) {
  if (!registro || !registro.total_pausas) {
    return '0h 0m';
  }

  return registro.total_pausas;
}

/**
 * Verifica se o usuário deveria considerar fazer uma pausa
 * Sugere pausa após 4h contínuas de trabalho
 * @param {Object} registro - Registro do dia atual
 * @returns {boolean} True se deveria fazer pausa
 */
export function deveriaSugerirPausa(registro) {
  if (!registro || !registro.entrada || registro.saida) {
    return false;
  }

  const minutosTrabalhadosHoje = extrairMinutosDeString(registro.total_horas || '0h 0m');
  const minutosAntesDaPausa = 4 * 60; // 4 horas em minutos

  return minutosTrabalhadosHoje >= minutosAntesDaPausa;
}

/**
 * Calcula estatísticas úteis para exibição
 * @param {Object} registro - Registro do dia atual
 * @param {Object} resumoMensal - Resumo mensal do usuário
 * @returns {Object} Objeto com estatísticas calculadas
 */
export function calcularEstatisticas(registro, resumoMensal) {
  return {
    statusAtual: calcularStatusAtual(registro),
    tempoTrabalhado: calcularTempoTrabalhado(registro),
    tempoRestante: calcularTempoRestante(registro),
    horarioSaidaPrevisto: calcularHorarioSaidaPrevisto(registro),
    progressoDia: calcularProgressoDia(registro),
    totalPausas: calcularTotalPausas(registro),
    podeSerFinalizado: podeSerFinalizado(registro),
    deveriaSugerirPausa: deveriaSugerirPausa(registro),
    
    // Dados do resumo mensal
    bancoHoras: resumoMensal?.saldo || '0h 0m',
    metaMensal: resumoMensal?.meta || '160h 0m',
    horasTrabalhadasMes: resumoMensal?.total_horas || '0h 0m',
    justificativasPendentes: resumoMensal?.pendentes || 0,
    justificativasAprovadas: resumoMensal?.aprovadas || 0
  };
}

// Não é necessário re-exportar as funções já que são importadas diretamente
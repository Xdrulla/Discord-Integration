import { auth } from "../config/firebaseConfig";
import axios from "axios";
import dayjs from "dayjs";
import { 
  fetchRegistroHoje as fetchRegistroHojeOptimized,
  fetchResumoMensal as fetchResumoMensalOptimized,
  fetchBancoAcumulado3Meses,
  CacheUtils
} from "./registroServiceOptimized";

/**
 * Serviço dedicado para funcionalidades do dashboard do leitor
 * Fornece APIs otimizadas para as necessidades específicas dos usuários leitores
 */

/**
 * Busca o registro de ponto do dia atual do usuário (OTIMIZADO)
 * Usa Firebase diretamente com cache para reduzir leituras
 * @param {string} discordId - ID do Discord do usuário
 * @returns {Promise<Object|null>} Registro do dia atual ou null se não existe
 */
export async function fetchRegistroHoje(discordId) {
  if (!discordId) {
    console.warn('fetchRegistroHoje: discordId é obrigatório');
    return null;
  }

  try {
    // Usa a versão otimizada do Firebase com cache
    const registro = await fetchRegistroHojeOptimized(discordId);
    
    if (registro) {
      return registro;
    }

    // Se não encontrou no Firebase, retorna estrutura vazia
    const hoje = dayjs().format('YYYY-MM-DD');
    return {
      usuario: discordId, // Usando discordId diretamente
      data: hoje,
      entrada: null,
      saida: null,
      pausas: [],
      total_horas: '0h 0m',
      total_pausas: '0h 0m',
      discordId
    };
  } catch (error) {
    console.error('Erro ao buscar registro de hoje:', error);
    
    // Fallback para estrutura vazia
    return {
      usuario: discordId,
      data: dayjs().format('YYYY-MM-DD'),
      entrada: null,
      saida: null,
      pausas: [],
      total_horas: '0h 0m',
      total_pausas: '0h 0m',
      discordId
    };
  }
}

/**
 * Busca o resumo mensal do usuário (OTIMIZADO)
 * Usa cache para reduzir chamadas desnecessárias à API
 * @param {string} discordId - ID do Discord do usuário
 * @param {number} ano - Ano (opcional, padrão: ano atual)
 * @param {number} mes - Mês (opcional, padrão: mês atual)
 * @returns {Promise<Object>} Resumo mensal completo
 */
export async function fetchResumoMensal(discordId, ano = null, mes = null) {
  if (!discordId) {
    console.warn('fetchResumoMensal: discordId é obrigatório');
    return getEmptyResumoMensal();
  }

  try {
    const dataAtual = dayjs();
    const anoTarget = ano || dataAtual.year();
    const mesTarget = mes || dataAtual.month() + 1;

    // Usa a versão otimizada com cache
    return await fetchResumoMensalOptimized(discordId, anoTarget, mesTarget);
  } catch (error) {
    console.error('Erro ao buscar resumo mensal:', error);
    return getEmptyResumoMensal();
  }
}

/**
 * Retorna estrutura vazia padronizada para resumo mensal
 */
function getEmptyResumoMensal() {
  return {
    usuario: 'Usuário',
    total_horas: '0h 0m',
    saldo: '0h 0m',
    meta: '160h 0m',
    extras: {
      sabado: '0h 0m',
      domingo_feriado: '0h 0m',
      dia_util: '0h 0m'
    },
    pendentes: 0,
    aprovadas: 0
  };
}

/**
 * Busca username baseado no discordId
 * Usa a lógica existente do sistema
 */
async function getUsernameByDiscordId(discordId) {
  try {
    // Por enquanto, vamos usar uma abordagem simples
    // Depois podemos otimizar com cache ou endpoint dedicado
    const token = await auth.currentUser.getIdToken();
    
    // Como não temos endpoint direto, vamos usar o próprio discordId
    // O backend já trata a conversão internamente
    return discordId;
  } catch (error) {
    console.error('Erro ao buscar username:', error);
    return discordId;
  }
}

/**
 * Calcula estatísticas da semana atual
 * @param {string} discordId - ID do Discord do usuário
 * @returns {Promise<Object>} Estatísticas da semana
 */
export async function fetchEstatisticasSemana(discordId) {
  try {
    const inicioSemana = dayjs().startOf('week').format('YYYY-MM-DD');
    const fimSemana = dayjs().endOf('week').format('YYYY-MM-DD');
    
    // Por enquanto retornamos dados mock
    // Depois podemos implementar endpoint específico
    return {
      horasTrabalhadasSemana: '38h 0m',
      metaSemana: '40h 0m',
      progressoSemana: 95,
      diasTrabalhados: 5
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas da semana:', error);
    return {
      horasTrabalhadasSemana: '0h 0m',
      metaSemana: '40h 0m',
      progressoSemana: 0,
      diasTrabalhados: 0
    };
  }
}

/**
 * Busca banco acumulado dos últimos 3 meses
 * @param {string} discordId - ID do Discord do usuário
 * @returns {Promise<Object>} Banco acumulado dos últimos 3 meses
 */
export async function fetchBancoAcumulado(discordId) {
  if (!discordId) {
    console.warn('fetchBancoAcumulado: discordId é obrigatório');
    return {
      bancoAcumulado: '0h 0m',
      tendencia: 'neutra',
      detalhePeriodos: []
    };
  }

  try {
    console.log(`🏦 Buscando banco acumulado para ${discordId}`);
    const resultado = await fetchBancoAcumulado3Meses(discordId);
    
    return {
      bancoAcumulado: resultado.bancoAcumulado,
      tendencia: resultado.tendencia,
      totalMinutos: resultado.totalSaldoMinutos,
      detalhePeriodos: resultado.resumoPeriodos,
      mesAtual: resultado.mesAtual,
      mesesAnteriores: resultado.mesesAnteriores,
      dataCalculo: resultado.dataCalculo
    };
  } catch (error) {
    console.error('Erro ao buscar banco acumulado:', error);
    return {
      bancoAcumulado: '0h 0m',
      tendencia: 'neutra',
      detalhePeriodos: [],
      mesAtual: null,
      mesesAnteriores: []
    };
  }
}

/**
 * Força refresh dos dados via socket ou polling (OTIMIZADO)
 * Limpa cache e força nova busca
 * @param {string} discordId - ID do Discord do usuário
 */
export async function refreshDadosUsuario(discordId) {
  try {
    console.log('🔄 Refreshing dados para usuário:', discordId);
    
    // Limpa cache específico do usuário
    CacheUtils.clearUser(discordId);
    
    // Força nova busca dos dados
    const [registroHoje, resumoMensal] = await Promise.all([
      fetchRegistroHoje(discordId),
      fetchResumoMensal(discordId)
    ]);
    
    console.log('✅ Dados refreshed com sucesso');
    return { registroHoje, resumoMensal };
  } catch (error) {
    console.error('Erro ao fazer refresh dos dados:', error);
    return false;
  }
}

/**
 * Utilitários de cache para debugging e manutenção
 */
export const ReaderCacheUtils = {
  /**
   * Limpa todo o cache
   */
  clearAll() {
    return CacheUtils.clearAll();
  },

  /**
   * Limpa cache de um usuário específico
   */
  clearUser(discordId) {
    return CacheUtils.clearUser(discordId);
  },

  /**
   * Mostra estatísticas do cache
   */
  getStats() {
    return CacheUtils.getStats();
  }
};
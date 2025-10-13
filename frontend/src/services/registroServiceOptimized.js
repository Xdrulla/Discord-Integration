import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import {
  ajustarFusoHorario,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  formatarTotalPausas,
} from "../utils/timeUtils";
import axios from "axios";

// Cache em memória para reduzir leituras desnecessárias
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Sistema de cache simples com expiração
 */
class CacheManager {
  static set(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static get(key) {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  static clear(pattern = null) {
    if (pattern) {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  }
}

/**
 * Busca registros específicos do usuário (otimizado)
 * @param {string} discordId - ID do Discord do usuário
 * @param {number} limitResults - Limite de resultados (padrão: 50)
 * @returns {Promise<Array>} Registros do usuário
 */
export async function fetchRegistrosByUser(discordId, limitResults = 50) {
  if (!discordId) {
    console.warn('fetchRegistrosByUser: discordId é obrigatório');
    return [];
  }

  const cacheKey = `registros_${discordId}_${limitResults}`;
  const cached = CacheManager.get(cacheKey);
  if (cached) {
    console.log('📦 Cache hit para registros do usuário');
    return cached;
  }

  try {
    console.log(`🔍 Buscando registros do usuário ${discordId} (Firebase)`);
    
    const registrosRef = collection(db, "registros");
    const q = query(
      registrosRef,
      where("discordId", "==", discordId),
      orderBy("data", "desc"),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    const registros = processarRegistros(querySnapshot);

    // Cache dos resultados
    CacheManager.set(cacheKey, registros);
    
    console.log(`✅ ${registros.length} registros carregados para usuário ${discordId}`);
    return registros;
  } catch (error) {
    console.error("Erro ao buscar registros do usuário:", error);
    return [];
  }
}

/**
 * Busca registro específico de hoje (otimizado)
 * @param {string} discordId - ID do Discord do usuário
 * @param {string} data - Data no formato YYYY-MM-DD (opcional, padrão: hoje)
 * @returns {Promise<Object|null>} Registro do dia ou null
 */
export async function fetchRegistroHoje(discordId, data = null) {
  if (!discordId) {
    console.warn('fetchRegistroHoje: discordId é obrigatório');
    return null;
  }

  const dataTarget = data || new Date().toISOString().split('T')[0];
  const cacheKey = `registro_hoje_${discordId}_${dataTarget}`;
  const cached = CacheManager.get(cacheKey);
  
  if (cached) {
    console.log('📦 Cache hit para registro de hoje');
    return cached;
  }

  try {
    console.log(`🔍 Buscando registro do dia ${dataTarget} para ${discordId}`);
    
    const registrosRef = collection(db, "registros");
    const q = query(
      registrosRef,
      where("discordId", "==", discordId),
      where("data", "==", dataTarget),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`ℹ️ Nenhum registro encontrado para ${dataTarget}`);
      // Cache resultado vazio por menos tempo (30 segundos)
      setTimeout(() => CacheManager.clear(`registro_hoje_${discordId}`), 30000);
      return null;
    }

    const registro = processarRegistros(querySnapshot)[0];
    
    // Cache do resultado (menor duração para dados do dia atual)
    const cacheDuration = data ? CACHE_DURATION : 60000; // 1 minuto para hoje
    setTimeout(() => cache.delete(cacheKey), cacheDuration);
    CacheManager.set(cacheKey, registro);
    
    console.log(`✅ Registro do dia ${dataTarget} carregado`);
    return registro;
  } catch (error) {
    console.error("Erro ao buscar registro de hoje:", error);
    return null;
  }
}

/**
 * Busca TODOS os registros (apenas para admin) - uso limitado
 * @param {number} limitResults - Limite de resultados
 * @returns {Promise<Array>} Todos os registros
 */
export async function fetchAllRegistros(limitResults = 100) {
  console.warn('⚠️ fetchAllRegistros: Esta função consome muitas leituras Firebase!');
  
  const cacheKey = `all_registros_${limitResults}`;
  const cached = CacheManager.get(cacheKey);
  if (cached) {
    console.log('📦 Cache hit para todos os registros');
    return cached;
  }

  try {
    console.log(`🔍 Buscando TODOS os registros (limite: ${limitResults})`);
    
    const registrosRef = collection(db, "registros");
    const q = query(
      registrosRef,
      orderBy("data", "desc"),
      limit(limitResults)
    );

    const querySnapshot = await getDocs(q);
    const registros = processarRegistros(querySnapshot);

    // Cache com duração maior para dados admin
    CacheManager.set(cacheKey, registros);
    
    console.log(`✅ ${registros.length} registros carregados (admin)`);
    return registros;
  } catch (error) {
    console.error("Erro ao buscar todos os registros:", error);
    return [];
  }
}

/**
 * Listener em tempo real para registros do usuário (otimizado)
 * @param {string} discordId - ID do Discord do usuário
 * @param {Function} callback - Função callback para mudanças
 * @param {string} data - Data específica (opcional)
 * @returns {Function} Função unsubscribe
 */
export function subscribeToUserRegistros(discordId, callback, data = null) {
  if (!discordId) {
    console.warn('subscribeToUserRegistros: discordId é obrigatório');
    return () => {};
  }

  console.log(`🔄 Criando listener para registros de ${discordId}`);

  const registrosRef = collection(db, "registros");
  let q = query(
    registrosRef,
    where("discordId", "==", discordId),
    orderBy("data", "desc")
  );

  // Se data específica fornecida, filtra por data
  if (data) {
    q = query(q, where("data", "==", data));
  } else {
    // Limita a registros recentes para reduzir leituras
    q = query(q, limit(10));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log(`📡 Listener: ${snapshot.docs.length} documentos recebidos`);
    
    const registros = processarRegistros(snapshot);
    
    // Limpa cache relacionado ao usuário
    CacheManager.clear(discordId);
    
    callback(registros);
  }, (error) => {
    console.error("Erro no listener de registros:", error);
    callback([]);
  });

  return unsubscribe;
}

/**
 * Busca registros por período (otimizado)
 * @param {string} discordId - ID do Discord do usuário
 * @param {string} dataInicio - Data início (YYYY-MM-DD)
 * @param {string} dataFim - Data fim (YYYY-MM-DD)
 * @returns {Promise<Array>} Registros do período
 */
export async function fetchRegistrosPorPeriodo(discordId, dataInicio, dataFim) {
  if (!discordId || !dataInicio || !dataFim) {
    console.warn('fetchRegistrosPorPeriodo: Parâmetros obrigatórios faltando');
    return [];
  }

  const cacheKey = `registros_periodo_${discordId}_${dataInicio}_${dataFim}`;
  const cached = CacheManager.get(cacheKey);
  if (cached) {
    console.log('📦 Cache hit para registros por período');
    return cached;
  }

  try {
    console.log(`🔍 Buscando registros de ${dataInicio} a ${dataFim} para ${discordId}`);
    
    const registrosRef = collection(db, "registros");
    const q = query(
      registrosRef,
      where("discordId", "==", discordId),
      where("data", ">=", dataInicio),
      where("data", "<=", dataFim),
      orderBy("data", "desc")
    );

    const querySnapshot = await getDocs(q);
    const registros = processarRegistros(querySnapshot);

    // Cache dos resultados
    CacheManager.set(cacheKey, registros);
    
    console.log(`✅ ${registros.length} registros carregados para período`);
    return registros;
  } catch (error) {
    console.error("Erro ao buscar registros por período:", error);
    return [];
  }
}

/**
 * Processa QuerySnapshot do Firebase em objetos de registro formatados
 * @param {QuerySnapshot} querySnapshot - Snapshot do Firebase
 * @returns {Array} Array de registros processados
 */
function processarRegistros(querySnapshot) {
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    const entrada = data.entrada;
    const saida = data.saida;
    const usuario = data.usuario;
    const dataDia = data.data;
    const discordId = data.discordId;
    const pausas = data.pausas || [];

    const rawHoras = data.total_horas;
    const minutosTrabalhados = (() => {
      if (!rawHoras) return 0;
      return extrairMinutosDeString(typeof rawHoras === "string" ? rawHoras : `${rawHoras}`);
    })();

    let bancoHoras = "0h 0m";
    let saldoMinutos = 0;

    if (entrada && saida && entrada !== "-" && saida !== "-") {
      const jornadaBase = 8 * 60;
      const abono = data.justificativa?.status === "aprovado"
        ? extrairMinutosDeString(data.justificativa.abonoHoras || "0h 0m")
        : 0;

      saldoMinutos = minutosTrabalhados - jornadaBase + abono;
      bancoHoras = formatarMinutosParaHoras(saldoMinutos);
    }

    return {
      id: doc.id,
      usuario,
      data: dataDia,
      entrada: ajustarFusoHorario(entrada) || "-",
      saida: ajustarFusoHorario(saida) || "-",
      pausas,
      total_horas: formatarMinutosParaHoras(minutosTrabalhados),
      total_pausas: formatarTotalPausas(data.total_pausas),
      banco_horas: bancoHoras,
      justificativa: data.justificativa
        ? {
          ...data.justificativa,
          abonoHoras: data.justificativa.abonoHoras || "",
          manualBreak: data.justificativa.manualBreak || "",
          observacaoAdmin: data.justificativa.observacaoAdmin || "",
        }
        : null,
      discordId,
    };
  });
}

/**
 * Resumo mensal otimizado (continua usando API backend)
 * @param {string} usuario - Nome do usuário
 * @param {number} ano - Ano
 * @param {number} mes - Mês
 * @returns {Promise<Object>} Resumo mensal
 */
export async function fetchResumoMensal(usuario, ano, mes) {
  const cacheKey = `resumo_${usuario}_${ano}_${mes}`;
  const cached = CacheManager.get(cacheKey);
  if (cached) {
    console.log('📦 Cache hit para resumo mensal');
    return cached;
  }

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/registro/${usuario}/${ano}/${mes}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    const resumo = response.data;
    
    // Cache do resumo mensal por mais tempo (dados menos voláteis)
    CacheManager.set(cacheKey, resumo);
    
    return resumo;
  } catch (error) {
    console.error("Erro ao buscar resumo mensal:", error);
    throw error;
  }
}

/**
 * Busca banco acumulado dos últimos 3 meses
 * @param {string} discordId - ID do Discord do usuário
 * @returns {Promise<Object>} Banco acumulado dos últimos 3 meses
 */
export async function fetchBancoAcumulado3Meses(discordId) {
  if (!discordId) {
    console.warn('fetchBancoAcumulado3Meses: discordId é obrigatório');
    return getBancoVazio();
  }

  const cacheKey = `banco_3meses_${discordId}`;
  const cached = CacheManager.get(cacheKey);
  if (cached) {
    console.log('📦 Cache hit para banco 3 meses');
    return cached;
  }

  try {
    console.log(`🏦 Calculando banco acumulado dos últimos 3 meses para ${discordId}`);
    
    // Calcula os últimos 3 meses (incluindo o atual)
    const hoje = new Date();
    const meses = [];
    
    for (let i = 2; i >= 0; i--) { // 3 meses: atual, anterior e retrasado
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        ano: data.getFullYear(),
        mes: data.getMonth() + 1,
        nome: data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      });
    }

    // Busca resumos dos 3 meses em paralelo
    const token = await auth.currentUser.getIdToken();
    const promises = meses.map(async (periodo) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/registro/${discordId}/${periodo.ano}/${periodo.mes}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        return {
          ...periodo,
          resumo: response.data,
          saldoMinutos: extrairMinutosLocal(response.data.saldo || '0h 0m')
        };
      } catch (error) {
        console.warn(`Erro ao buscar resumo de ${periodo.nome}:`, error);
        return {
          ...periodo,
          resumo: { saldo: '0h 0m', total_horas: '0h 0m', meta: '160h 0m' },
          saldoMinutos: 0
        };
      }
    });

    const resultados = await Promise.all(promises);
    
    // Calcula totais
    const totalSaldoMinutos = resultados.reduce((acc, periodo) => acc + periodo.saldoMinutos, 0);
    const bancoAcumulado = formatarMinutosLocal(totalSaldoMinutos);
    
    // Tendência (positiva se > 0, negativa se < 0)
    const tendencia = totalSaldoMinutos > 0 ? 'positiva' : totalSaldoMinutos < 0 ? 'negativa' : 'neutra';
    
    const resultado = {
      totalSaldoMinutos,
      bancoAcumulado,
      tendencia,
      periodos: resultados,
      dataCalculo: new Date().toISOString(),
      // Dados para exibição
      mesAtual: resultados[2], // Último mês (atual)
      mesesAnteriores: resultados.slice(0, 2), // 2 meses anteriores
      // Resumo por período
      resumoPeriodos: resultados.map(p => ({
        periodo: p.nome,
        saldo: formatarMinutosLocal(p.saldoMinutos),
        totalHoras: p.resumo.total_horas,
        meta: p.resumo.meta
      }))
    };

    // Cache com duração maior (dados históricos mudam pouco)
    const CACHE_BANCO_3MESES = 10 * 60 * 1000; // 10 minutos
    setTimeout(() => cache.delete(cacheKey), CACHE_BANCO_3MESES);
    CacheManager.set(cacheKey, resultado);
    
    console.log(`✅ Banco 3 meses calculado: ${bancoAcumulado} (${tendencia})`);
    return resultado;
    
  } catch (error) {
    console.error('Erro ao calcular banco acumulado 3 meses:', error);
    return getBancoVazio();
  }
}

/**
 * Função auxiliar para extrair minutos de string de tempo
 * Versão local para evitar dependência circular
 */
function extrairMinutosLocal(timeString) {
  if (!timeString || timeString === '0h 0m') return 0;
  
  const match = timeString.match(/(-?\d+)h\s*(-?\d+)m/);
  if (!match) return 0;
  
  const horas = parseInt(match[1]) || 0;
  const minutos = parseInt(match[2]) || 0;
  
  return (horas * 60) + minutos;
}

/**
 * Função auxiliar para formatar minutos em horas
 * Versão local para evitar dependência circular
 */
function formatarMinutosLocal(totalMinutos) {
  if (totalMinutos === 0) return '0h 0m';
  
  const isNegativo = totalMinutos < 0;
  const minutosAbs = Math.abs(totalMinutos);
  
  const horas = Math.floor(minutosAbs / 60);
  const minutos = minutosAbs % 60;
  
  const resultado = `${horas}h ${minutos}m`;
  return isNegativo ? `-${resultado}` : resultado;
}

/**
 * Retorna estrutura vazia para banco acumulado
 */
function getBancoVazio() {
  return {
    totalSaldoMinutos: 0,
    bancoAcumulado: '0h 0m',
    tendencia: 'neutra',
    periodos: [],
    mesAtual: null,
    mesesAnteriores: [],
    resumoPeriodos: []
  };
}

/**
 * Funções de utilidade para gerenciamento de cache
 */
export const CacheUtils = {
  /**
   * Limpa todo o cache
   */
  clearAll() {
    CacheManager.clear();
    console.log('🗑️ Cache limpo completamente');
  },

  /**
   * Limpa cache de um usuário específico
   */
  clearUser(discordId) {
    CacheManager.clear(discordId);
    console.log(`🗑️ Cache limpo para usuário ${discordId}`);
  },

  /**
   * Mostra estatísticas do cache (debug)
   */
  getStats() {
    const now = Date.now();
    const stats = {
      total: cache.size,
      expired: 0,
      active: 0
    };

    for (const [key, value] of cache.entries()) {
      const isExpired = now - value.timestamp > CACHE_DURATION;
      if (isExpired) {
        stats.expired++;
      } else {
        stats.active++;
      }
    }

    console.log('📊 Cache Stats:', stats);
    return stats;
  }
};

// Limpa cache expirado periodicamente (a cada 10 minutos)
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, value] of cache.entries()) {
    const isExpired = now - value.timestamp > CACHE_DURATION;
    if (isExpired) {
      cache.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Limpeza automática: ${cleanedCount} itens removidos do cache`);
  }
}, 10 * 60 * 1000);
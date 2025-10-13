import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { fetchRegistroHoje, fetchResumoMensal, fetchBancoAcumulado, ReaderCacheUtils } from '../services/readerService';
import { subscribeToUserRegistros } from '../services/registroServiceOptimized';
import { 
  calcularStatusAtual, 
  calcularTempoTrabalhado, 
  calcularTempoRestante, 
  calcularHorarioSaidaPrevisto, 
  calcularProgressoDia 
} from '../utils/readerUtils';

/**
 * Hook personalizado para gerenciar dados do dashboard do leitor (OTIMIZADO)
 * Centraliza toda a lógica de estado, cálculos e real-time updates
 * Inclui debounce, cache e redução de leituras Firebase
 */
export const useReaderData = (discordId) => {
  // Estados principais
  const [registroHoje, setRegistroHoje] = useState(null);
  const [resumoMensal, setResumoMensal] = useState(null);
  const [bancoAcumulado, setBancoAcumulado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  
  // Refs para controle de debounce e cleanup
  const loadingTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const firebaseUnsubscribeRef = useRef(null);

  // Estados calculados
  const [statusAtual, setStatusAtual] = useState('nao_iniciado');
  const [tempoTrabalhado, setTempoTrabalhado] = useState('0h 0m');
  const [tempoRestante, setTempoRestante] = useState('8h 0m');
  const [horarioSaidaPrevisto, setHorarioSaidaPrevisto] = useState('--:--');
  const [progressoDia, setProgressoDia] = useState(0);

  // Função para carregar dados iniciais (OTIMIZADA com debounce)
  const carregarDadosIniciais = useCallback(async () => {
    if (!discordId) return;

    // Debounce para evitar múltiplas chamadas simultâneas
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(async () => {
      try {
        console.log(`🔄 Carregando dados iniciais para ${discordId}`);
        setLoading(true);
        
        // Carrega dados em paralelo usando services otimizados
        const [registroData, resumoData, bancoData] = await Promise.all([
          fetchRegistroHoje(discordId),
          fetchResumoMensal(discordId),
          fetchBancoAcumulado(discordId)
        ]);

        setRegistroHoje(registroData);
        setResumoMensal(resumoData);
        setBancoAcumulado(bancoData);
        
        // Atualiza estados calculados
        atualizarEstadosCalculados(registroData);
        
        console.log('✅ Dados iniciais carregados com sucesso');
      } catch (error) {
        console.error('Erro ao carregar dados do leitor:', error);
        // Em caso de erro, define dados vazios em vez de deixar null
        setRegistroHoje({
          usuario: discordId,
          data: new Date().toISOString().split('T')[0],
          entrada: null,
          saida: null,
          pausas: [],
          total_horas: '0h 0m',
          total_pausas: '0h 0m',
          discordId
        });
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce de 300ms
  }, [discordId]);

  // Função para atualizar estados calculados
  const atualizarEstadosCalculados = useCallback((registro) => {
    if (!registro) return;

    const status = calcularStatusAtual(registro);
    const trabalhado = calcularTempoTrabalhado(registro);
    const restante = calcularTempoRestante(registro);
    const saidaPrevista = calcularHorarioSaidaPrevisto(registro);
    const progresso = calcularProgressoDia(registro);

    setStatusAtual(status);
    setTempoTrabalhado(trabalhado);
    setTempoRestante(restante);
    setHorarioSaidaPrevisto(saidaPrevista);
    setProgressoDia(progresso);
  }, []);

  // Setup de listeners otimizado (Firebase + Socket.IO híbrido)
  useEffect(() => {
    if (!discordId) return;

    // Firebase listener para dados em tempo real (otimizado)
    console.log(`🔄 Configurando listener Firebase para ${discordId}`);
    const unsubscribeFirebase = subscribeToUserRegistros(
      discordId,
      (registros) => {
        // Pega o registro de hoje dos resultados
        const hoje = new Date().toISOString().split('T')[0];
        const registroHoje = registros.find(r => r.data === hoje) || null;
        
        if (registroHoje) {
          console.log('📡 Firebase: Registro de hoje atualizado');
          setRegistroHoje(registroHoje);
          atualizarEstadosCalculados(registroHoje);
        }
      },
      new Date().toISOString().split('T')[0] // Filtra apenas hoje
    );

    firebaseUnsubscribeRef.current = unsubscribeFirebase;

    // Socket.IO como fallback/complemento
    const socketConnection = io(import.meta.env.VITE_API_URL);
    setSocket(socketConnection);

    socketConnection.on('registro-atualizado', (data) => {
      if (data.discordId === discordId) {
        console.log('📡 Socket.IO: Update recebido como backup');
        // Só usa se não teve update Firebase recente
        const lastFirebaseUpdate = Date.now() - 5000; // 5 segundos
        if (Date.now() - lastFirebaseUpdate > 5000) {
          setRegistroHoje(data.data);
          atualizarEstadosCalculados(data.data);
        }
      }
    });

    // Cleanup
    return () => {
      if (firebaseUnsubscribeRef.current) {
        firebaseUnsubscribeRef.current();
      }
      socketConnection.disconnect();
    };
  }, [discordId, atualizarEstadosCalculados]);

  // Carrega dados iniciais quando discordId está disponível
  useEffect(() => {
    if (discordId) {
      carregarDadosIniciais();
    }
  }, [discordId, carregarDadosIniciais]);

  // Atualização periódica otimizada (apenas para cálculos locais)
  useEffect(() => {
    const interval = setInterval(() => {
      if (registroHoje && !loading) {
        // Debounce para evitar recálculos desnecessários
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          console.log('🕐 Atualizando cálculos periódicos (local)');
          atualizarEstadosCalculados(registroHoje);
        }, 100);
      }
    }, 60000); // Atualiza a cada minuto

    return () => {
      clearInterval(interval);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [registroHoje, loading, atualizarEstadosCalculados]);

  // Função para forçar refresh dos dados (otimizada)
  const refreshDados = useCallback(() => {
    console.log('🔄 Refresh manual solicitado');
    // Limpa cache específico antes do refresh
    ReaderCacheUtils.clearUser(discordId);
    carregarDadosIniciais();
  }, [discordId, carregarDadosIniciais]);

  // Cleanup geral quando o componente desmonta
  useEffect(() => {
    return () => {
      // Limpa todos os timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (firebaseUnsubscribeRef.current) {
        firebaseUnsubscribeRef.current();
      }
      
      console.log('🧹 useReaderData cleanup executado');
    };
  }, []);

  return {
    // Dados brutos
    registroHoje,
    resumoMensal,
    bancoAcumulado,
    loading,
    
    // Estados calculados
    statusAtual,
    tempoTrabalhado,
    tempoRestante,
    horarioSaidaPrevisto,
    progressoDia,
    
    // Funções
    refreshDados,
    
    // Funções de debugging (desenvolvimento)
    debugCache: () => ReaderCacheUtils.getStats(),
    clearCache: () => ReaderCacheUtils.clearUser(discordId),
    
    // Socket connection (para debugging)
    socket
  };
};
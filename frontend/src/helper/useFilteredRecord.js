import { fetchRegistrosByUser, fetchAllRegistros } from "../services/registroServiceOptimized";
import { fetchResumoMensal } from "../services/registroService";

/**
 * Carrega registros filtrados de forma otimizada
 * ADMIN: Carrega últimos 100 registros de todos usuários
 * LEITOR: Carrega apenas registros do usuário específico
 */
export const carregarRegistrosFiltrados = async (role, discordId, setData, setFilteredData, setLoading = null) => {
  try {
    console.log(`🔍 Carregando registros para ${role} (${discordId})`);
    
    let registros = [];

    if (role === "leitor") {
      // OTIMIZADO: Query específica do usuário (máximo 50 registros recentes)
      registros = await fetchRegistrosByUser(discordId, 50);
      console.log(`✅ ${registros.length} registros carregados para usuário ${discordId}`);
    } else if (role === "admin") {
      // OTIMIZADO: Limita registros para admin (máximo 100 mais recentes)
      registros = await fetchAllRegistros(100);
      console.log(`✅ ${registros.length} registros carregados para admin`);
    } else {
      console.warn(`Role desconhecido: ${role}`);
      registros = [];
    }

    setData(registros);
    setFilteredData(registros);
    
    // Log de economia de leituras
    if (role === "leitor") {
      console.log('💡 Economia: Query específica evitou carregar todos os registros');
    }
    
  } catch (error) {
    console.error("Erro ao carregar registros:", error);
    setData([]);
    setFilteredData([]);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const carregarResumoMensal = async (usuario, ano, mes, setResumo, setResumoLoading) => {
  try {
    setResumoLoading(true);
    const resumo = await fetchResumoMensal(usuario, ano, mes);
    setResumo(resumo);
  } catch (error) {
    console.error("Erro ao carregar resumo mensal:", error);
    setResumo(null);
  } finally {
    setResumoLoading(false);
  }
};
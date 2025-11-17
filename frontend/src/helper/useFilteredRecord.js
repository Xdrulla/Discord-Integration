import { fetchRegistros, fetchResumoMensal } from "../services/registroService";

export const carregarRegistrosFiltrados = async (role, discordId, setData, setFilteredData, setLoading = null) => {
  try {
    // Otimização: filtra no Firestore ao invés de buscar tudo e filtrar no frontend
    const options = role === "leitor" 
      ? { discordId, diasRetroativos: 60, maxResults: 300 }  // Leitor: últimos 60 dias
      : { diasRetroativos: 30, maxResults: 500 };            // Admin: últimos 30 dias

    const registros = await fetchRegistros(options);

    setData(registros);
    setFilteredData(registros);
  } catch (error) {
    console.error("Erro ao carregar registros:", error);
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
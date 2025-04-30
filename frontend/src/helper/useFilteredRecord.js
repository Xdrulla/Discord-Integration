import { fetchRegistros, fetchResumoMensal } from "../services/registroService";

export const carregarRegistrosFiltrados = async (role, discordId, setData, setFilteredData, setLoading = null) => {
  try {
    let registros = await fetchRegistros();

    if (role === "leitor") {
      registros = registros.filter((record) => record.discordId === discordId);
    }

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
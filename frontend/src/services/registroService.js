import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import {
  ajustarFusoHorario,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  formatarTotalPausas,
} from "../utils/timeUtils";
import axios from "axios";
import dayjs from "dayjs";

/**
 * Busca registros com filtros otimizados
 * @param {Object} options - Opções de filtro
 * @param {string} options.discordId - Discord ID do usuário (para leitores)
 * @param {number} options.diasRetroativos - Quantos dias buscar (padrão: 60)
 * @param {number} options.maxResults - Limite de resultados (padrão: 500)
 */
export async function fetchRegistros(options = {}) {
  const { 
    discordId = null, 
    diasRetroativos = 60, 
    maxResults = 500 
  } = options;

  try {
    // Data inicial (X dias atrás)
    const dataInicio = dayjs().subtract(diasRetroativos, 'day').format('YYYY-MM-DD');
    
    // Constrói a query com filtros
    const registrosRef = collection(db, "registros");
    let q;

    if (discordId) {
      // Se for leitor, filtra por discordId E data
      q = query(
        registrosRef,
        where("discordId", "==", discordId),
        where("data", ">=", dataInicio),
        orderBy("data", "desc"),
        limit(maxResults)
      );
    } else {
      // Se for admin, apenas filtra por data
      q = query(
        registrosRef,
        where("data", ">=", dataInicio),
        orderBy("data", "desc"),
        limit(maxResults)
      );
    }

    const querySnapshot = await getDocs(q);
    
    console.log(`✅ Buscados ${querySnapshot.size} registros (últimos ${diasRetroativos} dias)`);
    
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
  } catch (error) {
    console.error("❌ Erro ao buscar registros:", error);
    throw error;
  }
}

export async function fetchResumoMensal(usuario, ano, mes) {
  const token = await auth.currentUser.getIdToken()
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/registro/${usuario}/${ano}/${mes}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
}

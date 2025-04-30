import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import {
  ajustarFusoHorario,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  formatarTotalPausas,
} from "../utils/timeUtils";
import axios from "axios";

export async function fetchRegistros() {
  const querySnapshot = await getDocs(collection(db, "registros"));
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

export async function fetchResumoMensal(usuario, ano, mes) {
  const token = await auth.currentUser.getIdToken()
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/registro/${usuario}/${ano}/${mes}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  return response.data;
}

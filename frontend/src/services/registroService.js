import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  ajustarFusoHorario,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  formatarTotalPausas,
} from "../utils/timeUtils";

export async function fetchRegistros() {
  const querySnapshot = await getDocs(collection(db, "registros"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    const entrada = data.entrada;
    const saida = data.saida;
    const usuario = data.usuario;
    const dataDia = data.data;

    const rawHoras = data.total_horas;
    const minutosTrabalhados = (() => {
      if (!rawHoras) return 0;
      return extrairMinutosDeString(typeof rawHoras === "string" ? rawHoras : `${rawHoras}`);
    })();

    let bancoHoras = "0h 0m";
    let saldoMinutos = 0;

    if (entrada && saida && entrada !== "-" && saida !== "-") {
      const jornadaBase = 8 * 60;
      saldoMinutos = minutosTrabalhados - jornadaBase;
      bancoHoras = formatarMinutosParaHoras(saldoMinutos);
    }

    return {
      id: doc.id,
      usuario,
      data: dataDia,
      entrada: ajustarFusoHorario(entrada) || "-",
      saida: ajustarFusoHorario(saida) || "-",
      total_horas: formatarMinutosParaHoras(minutosTrabalhados),
      total_pausas: formatarTotalPausas(data.total_pausas),
      banco_horas: bancoHoras,
      justificativa: data.justificativa || null
    };
  });
}

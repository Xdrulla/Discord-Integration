import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ajustarFusoHorario, extrairMinutosDeString, formatarTempo, formatarTotalPausas } from "../utils/timeUtils";

export async function fetchRegistros() {
  const querySnapshot = await getDocs(collection(db, "registros"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    const totalMinutosTrabalhados = extrairMinutosDeString(data.total_horas);
    const jornadaPadrao = 8 * 60;
    const saldoMinutos = totalMinutosTrabalhados - jornadaPadrao;
    const bancoHoras = saldoMinutos !== 0 ? formatarTempo(saldoMinutos) : "0h 0m";

    return {
      id: doc.id,
      usuario: data.usuario,
      data: data.data,
      entrada: ajustarFusoHorario(data.entrada) || "-",
      saida: ajustarFusoHorario(data.saida) || "-",
      total_horas: formatarTempo(totalMinutosTrabalhados),
      total_pausas: formatarTotalPausas(data.total_pausas),
      banco_horas: bancoHoras,
    };
  });
}

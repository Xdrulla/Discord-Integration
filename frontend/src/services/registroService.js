import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  ajustarFusoHorario,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  formatarTempo,
  formatarTotalPausas,
  horaStringParaMinutos
} from "../utils/timeUtils";

export async function fetchRegistros() {
  const querySnapshot = await getDocs(collection(db, "registros"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    const entrada = data.entrada;
    const saida = data.saida;
    const totalPausasMin = extrairMinutosDeString(data.total_pausas);

    let bancoHoras = "0h 0m";

    if (entrada && saida && entrada !== "-" && saida !== "-") {
      const entradaMin = horaStringParaMinutos(entrada);
      const saidaMin = horaStringParaMinutos(saida);
      const duracaoDia = saidaMin - entradaMin;

      const jornadaCom1HoraPausa = 9 * 60;
      const pausaExcedente = Math.max(totalPausasMin - 60, 0);

      const saldoMinutos = duracaoDia - jornadaCom1HoraPausa - pausaExcedente;
      bancoHoras = formatarMinutosParaHoras(saldoMinutos);
    }

    const minutosTrabalhados = extrairMinutosDeString(data.total_horas);

    return {
      id: doc.id,
      usuario: data.usuario,
      data: data.data,
      entrada: ajustarFusoHorario(entrada) || "-",
      saida: ajustarFusoHorario(saida) || "-",
      total_horas: formatarTempo(minutosTrabalhados),
      total_pausas: formatarTotalPausas(data.total_pausas),
      banco_horas: bancoHoras,
      justificativa: data.justificativa || null
    };
  });
}

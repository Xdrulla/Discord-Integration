import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ajustarFusoHorario, calcularTotalPausas, extrairMinutosDeString, formatarTempo } from "../utils/timeUtils";

export async function fetchRegistros() {
  const querySnapshot = await getDocs(collection(db, "registros"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      usuario: data.usuario,
      data: data.data,
      entrada: ajustarFusoHorario(data.entrada) || "-",
      saida: ajustarFusoHorario(data.saida) || "-",
      total_horas: formatarTempo(extrairMinutosDeString(data.total_horas)),
      total_pausas: calcularTotalPausas(data.pausas || []),
    };
  });
}

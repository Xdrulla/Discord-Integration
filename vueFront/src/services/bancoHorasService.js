import { collection, doc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'

/**
 * Busca o histórico de banco de horas de um usuário.
 * Estrutura Firestore: banco_horas/{discordId}/historico/{mesAno}
 * Cada documento tem: ano, mes, mesAno, discordId, saldoMinutos, saldoFormatado, fechadoEm
 */
export async function fetchBancoHorasHistorico(discordId) {
  if (!discordId) return []

  const historicoRef = collection(db, 'banco_horas', discordId, 'historico')
  const q = query(historicoRef, orderBy('mesAno', 'desc'), limit(12))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(d => d.data())
}

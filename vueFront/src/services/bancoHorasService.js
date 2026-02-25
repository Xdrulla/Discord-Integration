import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
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

/**
 * Busca o saldo acumulado histórico de uma lista de discordIds.
 * Recebe os IDs dos registros já carregados para evitar listagem da collection raiz
 * (que pode falhar por regras do Firestore).
 * Retorna { [discordId]: { saldoMinutos, mesAnoMaisRecente } } por usuário.
 */
export async function fetchBancoHorasPorIds(discordIds) {
  const ids = [...new Set(discordIds.filter(Boolean))]
  if (!ids.length) return {}

  const result = {}
  await Promise.all(
    ids.map(async (discordId) => {
      const historicoRef = collection(db, 'banco_horas', discordId, 'historico')
      const q = query(historicoRef, orderBy('mesAno', 'desc'), limit(24))
      const snap = await getDocs(q)
      const total = snap.docs.reduce((acc, d) => acc + (d.data().saldoMinutos ?? 0), 0)
      const mesAnoMaisRecente = snap.docs[0]?.data().mesAno ?? null
      result[discordId] = { saldoMinutos: total, mesAnoMaisRecente }
    })
  )

  return result
}

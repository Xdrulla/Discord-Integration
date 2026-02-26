import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import {
  ajustarFusoHorario,
  extrairMinutosDeString,
  formatarMinutosParaHoras,
  formatarTotalPausas,
} from '@/utils/timeUtils'

dayjs.locale('pt-br')

export const PAGE_SIZE = 20

function mapDoc(doc, metaHorasDia = 8) {
  const d = doc.data()
  const entrada = d.entrada
  const saida = d.saida
  const pausas = d.pausas || []

  const rawHoras = d.total_horas
  const minutosTrabalhados = rawHoras
    ? extrairMinutosDeString(typeof rawHoras === 'string' ? rawHoras : `${rawHoras}`)
    : 0

  let bancoHoras = '0h 0m'
  let saldoMinutos = 0

  if (entrada && saida && entrada !== '-' && saida !== '-') {
    const diaSemana = dayjs(d.data).day() // 0 = domingo, 6 = sábado
    const jornadaBase = (diaSemana === 0 || diaSemana === 6) ? 0 : metaHorasDia * 60
    const abono =
      d.justificativa?.status === 'aprovado'
        ? extrairMinutosDeString(d.justificativa.abonoHoras || '0h 0m')
        : 0
    saldoMinutos = minutosTrabalhados - jornadaBase + abono
    bancoHoras = formatarMinutosParaHoras(saldoMinutos)
  }

  return {
    id: doc.id,
    usuario: d.usuario,
    discordId: d.discordId,
    displayName: d.displayName ?? d.usuario,
    data: d.data,
    hora_entrada: ajustarFusoHorario(entrada) || '-',
    hora_saida: ajustarFusoHorario(saida) || '-',
    pausas,
    total_horas: formatarMinutosParaHoras(minutosTrabalhados),
    total_pausas: formatarTotalPausas(d.total_pausas),
    banco_horas: bancoHoras,
    banco_horas_min: saldoMinutos,
    justificativa: d.justificativa
      ? {
          ...d.justificativa,
          abonoHoras: d.justificativa.abonoHoras || '',
          manualBreak: d.justificativa.manualBreak || '',
          observacaoAdmin: d.justificativa.observacaoAdmin || '',
        }
      : null,
    _ref: doc, // raw Firestore doc — used as cursor for startAfter
  }
}

/**
 * Busca registros paginados do Firestore.
 * @param {object} options
 * @param {string|null} options.discordId - filtra por usuário (null = admin, todos)
 * @param {string|null} options.dataInicioParam - data início explícita "YYYY-MM-DD" (prioridade sobre diasRetroativos)
 * @param {string|null} options.dataFimParam - data fim explícita "YYYY-MM-DD" (filtro local, Firestore não suporta range duplo sem índice composto)
 * @param {number} options.diasRetroativos - janela de datas padrão quando dataInicioParam não fornecido
 * @param {import('firebase/firestore').QueryDocumentSnapshot|null} options.cursorDoc - cursor da página anterior
 * @returns {{ records: object[], lastDoc: object|null, hasMore: boolean }}
 */
export async function fetchRegistrosPaginated({ discordId = null, dataInicioParam = null, dataFimParam = null, diasRetroativos = 60, cursorDoc = null, metaHorasDia = 8 } = {}) {
  const dataInicio = dataInicioParam ?? dayjs().subtract(diasRetroativos, 'day').format('YYYY-MM-DD')
  const registrosRef = collection(db, 'registros')

  const constraints = []

  if (discordId) {
    constraints.push(where('discordId', '==', discordId))
  }
  constraints.push(where('data', '>=', dataInicio))
  // Firestore não suporta where('data', '<=', ...) junto com where('discordId', '==', ...)
  // sem índice composto, então filtramos a data fim localmente
  constraints.push(orderBy('data', 'desc'))
  if (cursorDoc) {
    constraints.push(startAfter(cursorDoc))
  }
  constraints.push(limit(PAGE_SIZE))

  const snapshot = await getDocs(query(registrosRef, ...constraints))

  let docs = snapshot.docs
  if (dataFimParam) {
    docs = docs.filter(d => d.data().data <= dataFimParam)
  }

  const records = docs.map(d => mapDoc(d, metaHorasDia))
  // Usa o último doc filtrado como cursor para que a próxima página continue do ponto certo
  const lastDoc = docs.at(-1) ?? null
  const hasMore = snapshot.size === PAGE_SIZE && docs.length > 0

  return { records, lastDoc, hasMore }
}

/**
 * Busca todos os registros do Firestore (usado por GeneralTab para resumo do mês).
 * Limita a maxResults para evitar leituras excessivas.
 */
export async function fetchRegistros({ discordId = null, diasRetroativos = 30, maxResults = 100 } = {}) {
  const dataInicio = dayjs().subtract(diasRetroativos, 'day').format('YYYY-MM-DD')
  const registrosRef = collection(db, 'registros')

  const constraints = []
  if (discordId) constraints.push(where('discordId', '==', discordId))
  constraints.push(where('data', '>=', dataInicio))
  constraints.push(orderBy('data', 'desc'))
  constraints.push(limit(maxResults))

  const snapshot = await getDocs(query(registrosRef, ...constraints))
  return snapshot.docs.map(mapDoc)
}

export async function fetchResumoMensal(usuario, ano, mes) {
  const token = await auth.currentUser.getIdToken()
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/registro/${usuario}/${ano}/${mes}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data
}

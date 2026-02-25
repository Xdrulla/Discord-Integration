export function ajustarFusoHorario(horario) {
  return horario || '-'
}

export function extrairMinutosDeString(tempoString) {
  if (!tempoString || typeof tempoString !== 'string') return 0
  const match = tempoString.trim().match(/^(-?)(\d+)h\s*(\d+(\.\d+)?)(m|min)$/i)
  if (!match) return 0
  const sinal = match[1] === '-' ? -1 : 1
  const horas = parseInt(match[2]) || 0
  const minutos = Math.round(parseFloat(match[3]) || 0)
  return sinal * (horas * 60 + minutos)
}

export function formatarMinutosParaHoras(minutosTotais) {
  const sinal = minutosTotais < 0 ? '-' : ''
  const minutosAbs = Math.abs(minutosTotais)
  const horas = Math.floor(minutosAbs / 60)
  const minutos = minutosAbs % 60
  return `${sinal}${horas}h ${minutos}m`
}

export function formatarTotalPausas(tempoString) {
  if (!tempoString || typeof tempoString !== 'string') return '0h 0m'
  const partes = tempoString.match(/(\d+)h\s*(\d+(\.\d+)?)m/)
  if (partes) {
    const horas = parseInt(partes[1]) || 0
    const minutos = Math.round(parseFloat(partes[2]) || 0)
    return `${horas}h ${minutos}m`
  }
  return '0h 0m'
}

export function converterParaMinutos(tempo) {
  if (!tempo) return 0
  const isNegativo = tempo.startsWith('-')
  const [horas, minutos] = tempo.replace('-', '').match(/\d+/g)?.map(Number) || [0, 0]
  const total = horas * 60 + minutos
  return isNegativo ? -total : total
}

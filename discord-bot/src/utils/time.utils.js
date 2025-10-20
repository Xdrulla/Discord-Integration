/**
 * Converte string de horas (ex: "8h 30m") para minutos totais
 * @param {string} horasStr - String no formato "Xh Ym"
 * @returns {number} Total de minutos
 */
export const parseMinutes = (horasStr) => {
  const match = /(-?\d+)h\s*(\d+(?:\.\d+)?)m/.exec(horasStr || '')
  if (!match) return 0
  const horas = parseInt(match[1])
  const minutos = parseFloat(match[2])
  return horas * 60 + minutos
}

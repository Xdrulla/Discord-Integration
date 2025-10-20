/**
 * Remove acentos e normaliza texto para processamento
 * @param {string} texto - Texto a ser normalizado
 * @returns {string} Texto sem acentos, em minúsculas e sem espaços extras
 */
export const removerAcentos = (texto) => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

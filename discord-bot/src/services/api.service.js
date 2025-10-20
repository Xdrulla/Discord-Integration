import axios from 'axios'

const baseURL = process.env.API_URL

/**
 * Registra entrada ou saída do usuário
 */
export const registrar = async (usuario, mensagem, discordId) => {
  return axios.post(`${baseURL}/register`, {
    usuario,
    mensagem,
    discordId
  })
}

/**
 * Busca registro do usuário
 */
export const buscarRegistro = async (usuario) => {
  const response = await axios.get(`${baseURL}/registro/${usuario}`)
  return response.data
}

/**
 * Registra início de pausa
 */
export const iniciarPausa = async (usuario, discordId) => {
  return axios.post(`${baseURL}/pause`, {
    usuario,
    inicio: new Date().toISOString(),
    discordId
  })
}

/**
 * Registra fim de pausa
 */
export const finalizarPausa = async (usuario, discordId) => {
  return axios.post(`${baseURL}/resume`, {
    usuario,
    fim: new Date().toISOString(),
    discordId
  })
}

/**
 * Envia pergunta para IA
 */
export const perguntarIA = async (question, usuario, discordId) => {
  const response = await axios.post(`${baseURL}/ai/chat`, {
    question,
    usuario,
    discordId
  })
  return response.data.answer
}
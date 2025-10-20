import { parseMinutes } from '../utils/time.utils.js'

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * Verifica se deve notificar usuário sobre horas trabalhadas
 * @param {Object} registro - Registro do usuário
 * @returns {Object|null} - Objeto com mensagem se deve notificar, null caso contrário
 */
export const deveNotificarHoras = (registro) => {
  const minutos = parseMinutes(registro.total_horas)

  if (!minutos || minutos === 480) {
    return null // 480 minutos = 8 horas exatas
  }

  const diff = minutos > 480 ? 'mais' : 'menos'
  const link = `${frontendURL}/dashboard?registro=${encodeURIComponent(registro.usuario + '_' + registro.data)}`

  return {
    mensagem: `Você trabalhou ${diff} que 8h hoje (${registro.total_horas}). Justifique se necessário: ${link}`,
    minutos,
    diff
  }
}

/**
 * Envia DM para um usuário
 * @param {Object} user - Objeto user do Discord
 * @param {string} mensagem - Mensagem a enviar
 */
export const enviarDM = async (user, mensagem) => {
  try {
    await user.send(mensagem)
    return true
  } catch (error) {
    console.error(`❌ Erro ao enviar DM para ${user.username}:`, error.message)
    return false
  }
}

export const formatarRegistro = (registro) => {
  return `Entrada: ${registro.entrada || 'não marcada'}\nSaída: ${registro.saida || 'não marcada'}\nTotal: ${registro.total_horas || 'n/a'}`
}
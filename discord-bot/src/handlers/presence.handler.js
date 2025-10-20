import * as apiService from '../services/api.service.js'

/**
 * Handler de atualização de presença (status)
 * @param {Presence} oldPresence - Presença anterior
 * @param {Presence} newPresence - Nova presença
 */
export const handlePresenceUpdate = async (oldPresence, newPresence) => {
  try {
    if (!oldPresence || !newPresence) return

    const member = newPresence.guild?.members.cache.get(newPresence.userId)
    const usuario = member?.displayName || newPresence.user.username
    const discordId = newPresence.userId
    const statusAntigo = oldPresence.status
    const statusAtual = newPresence.status

    const registro = await buscarRegistroAtual(usuario)

    if (!registro || registro.saida) {
      return
    }

    if (deveIniciarPausa(statusAntigo, statusAtual, registro)) {
      await apiService.iniciarPausa(usuario, discordId)
      console.log(`⏸️  Pausa iniciada para ${usuario} (${statusAntigo} → ${statusAtual})`)
    }

    if (deveFinalizarPausa(statusAntigo, statusAtual, registro)) {
      await apiService.finalizarPausa(usuario, discordId)
      console.log(`▶️  Pausa finalizada para ${usuario} (${statusAntigo} → ${statusAtual})`)
    }
  } catch (error) {
    console.error("❌ Erro inesperado na atualização de presença:", error.message)
  }
}

/**
 * Busca registro atual do usuário
 * @param {string} usuario - Nome do usuário
 * @returns {Object|null} Registro ou null
 */
const buscarRegistroAtual = async (usuario) => {
  try {
    return await apiService.buscarRegistro(usuario)
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null
    }
    console.error("❌ Erro ao buscar registro:", error.message)
    return null
  }
}

/**
 * Verifica se deve iniciar pausa automática
 * @param {string} statusAntigo - Status anterior
 * @param {string} statusAtual - Status atual
 * @param {Object} registro - Registro do usuário
 * @returns {boolean}
 */
const deveIniciarPausa = (statusAntigo, statusAtual, registro) => {
  const pausaAtiva = registro.pausas?.length > 0 && !registro.pausas[registro.pausas.length - 1].fim

  if (pausaAtiva) return false

  return (
    (statusAntigo === "online" && (statusAtual === "idle" || statusAtual === "offline")) ||
    (statusAntigo === "dnd" && (statusAtual === "idle" || statusAtual === "offline"))
  )
}

/**
 * Verifica se deve finalizar pausa automática
 * @param {string} statusAntigo - Status anterior
 * @param {string} statusAtual - Status atual
 * @param {Object} registro - Registro do usuário
 * @returns {boolean}
 */
const deveFinalizarPausa = (statusAntigo, statusAtual, registro) => {
  const pausaAtiva = registro.pausas?.length > 0 && !registro.pausas[registro.pausas.length - 1].fim

  if (!pausaAtiva) return false

  return (
    (statusAntigo === "idle" && (statusAtual === "dnd" || statusAtual === "online")) ||
    (statusAntigo === "offline" && (statusAtual === "dnd" || statusAtual === "online"))
  )
}
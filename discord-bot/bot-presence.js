import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js'
import axios from 'axios'

const API_URL = process.env.API_URL
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN

/**
 * Bot minimalista - apenas monitora mudanças de presença
 * para registro automático de pausas.
 *
 * Todas as outras funcionalidades (registro de ponto, comandos, IA)
 * foram migradas para o n8n.
 */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
})

client.once('ready', () => {
  console.log(`[Presence Bot] Online: ${client.user.tag}`)
})

/**
 * Busca registro atual do usuário no backend
 */
const buscarRegistro = async (usuario) => {
  try {
    const response = await axios.get(`${API_URL}/registro/${usuario}`)
    return response.data
  } catch (error) {
    return null
  }
}

/**
 * Verifica se há uma pausa ativa (sem fim)
 */
const temPausaAtiva = (registro) => {
  if (!registro?.pausas?.length) return false
  const ultimaPausa = registro.pausas[registro.pausas.length - 1]
  return !ultimaPausa.fim
}

/**
 * Verifica se deve iniciar pausa
 * Condição: status mudou de online/dnd para idle/offline
 */
const deveIniciarPausa = (statusAntigo, statusAtual) => {
  const estavaPresenteAtivo = statusAntigo === 'online' || statusAntigo === 'dnd'
  const ficouAusente = statusAtual === 'idle' || statusAtual === 'offline'
  return estavaPresenteAtivo && ficouAusente
}

/**
 * Verifica se deve finalizar pausa
 * Condição: status mudou de idle/offline para online/dnd
 */
const deveFinalizarPausa = (statusAntigo, statusAtual) => {
  const estavaAusente = statusAntigo === 'idle' || statusAntigo === 'offline'
  const ficouPresenteAtivo = statusAtual === 'online' || statusAtual === 'dnd'
  return estavaAusente && ficouPresenteAtivo
}

/**
 * Handler principal de atualização de presença
 */
client.on('presenceUpdate', async (oldPresence, newPresence) => {
  if (!oldPresence || !newPresence) return

  const member = newPresence.guild?.members.cache.get(newPresence.userId)
  const usuario = member?.displayName || newPresence.user?.username
  const discordId = newPresence.userId
  const statusAntigo = oldPresence.status
  const statusAtual = newPresence.status

  // Ignora se não houve mudança de status
  if (statusAntigo === statusAtual) return

  try {
    const registro = await buscarRegistro(usuario)

    // Ignora se não há registro do dia ou se já tem saída
    if (!registro || registro.saida) return

    const pausaAtiva = temPausaAtiva(registro)

    // Iniciar pausa
    if (!pausaAtiva && deveIniciarPausa(statusAntigo, statusAtual)) {
      await axios.post(`${API_URL}/pause`, { usuario, discordId })
      console.log(`[Pausa] Iniciada: ${usuario} (${statusAntigo} -> ${statusAtual})`)
    }

    // Finalizar pausa
    if (pausaAtiva && deveFinalizarPausa(statusAntigo, statusAtual)) {
      await axios.post(`${API_URL}/resume`, { usuario, discordId })
      console.log(`[Pausa] Finalizada: ${usuario} (${statusAntigo} -> ${statusAtual})`)
    }
  } catch (error) {
    console.error(`[Erro] Presença ${usuario}:`, error.message)
  }
})

// Iniciar bot
client.login(DISCORD_TOKEN).catch(error => {
  console.error('[Erro Fatal] Falha ao conectar:', error.message)
  process.exit(1)
})

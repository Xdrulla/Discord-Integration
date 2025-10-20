import { ChannelType } from 'discord.js'
import * as nlpService from '../services/nlp.service.js'
import * as apiService from '../services/api.service.js'
import * as notificationService from '../services/notification.service.js'
import * as commandHandler from './command.handler.js'

/**
 * Handler principal de mensagens
 * @param {Message} message - Mensagem do Discord
 */
export const handleMessage = async (message) => {
  if (message.author.bot) return

  const content = message.content.trim()

  if (message.channel.type === ChannelType.DM) {
    await commandHandler.handleDMQuestion(message)
    return
  }

  const nomeUsuario = message.member ? message.member.displayName : message.author.username
  const discordId = message.author.id

  if (content.startsWith('!registro')) {
    await commandHandler.handleRegistroCommand(message, nomeUsuario)
    return
  }

  if (content.startsWith('!pergunta')) {
    await commandHandler.handlePerguntaCommand(message, nomeUsuario, discordId)
    return
  }

  await processarMensagemNLP(message, content, nomeUsuario, discordId)
}

/**
 * Processa mensagem usando NLP para detectar entrada/saída
 * @param {Message} message - Mensagem do Discord
 * @param {string} content - Conteúdo da mensagem
 * @param {string} nomeUsuario - Nome do usuário
 * @param {string} discordId - ID do Discord
 */
const processarMensagemNLP = async (message, content, nomeUsuario, discordId) => {
  const { intent, score } = await nlpService.classificarMensagem(content)

  console.log(`📊 Mensagem: "${content}" | Intent: ${intent} | Confiança: ${(score * 100).toFixed(1)}%`)

  if (intent === 'neutro') return

  if (intent === 'entrada' || intent === 'saida') {
    await apiService.registrar(nomeUsuario, content, discordId)
    console.log(`✅ ${intent.toUpperCase()} registrada para ${nomeUsuario}`)

    // Se for saída, verificar se precisa notificar sobre horas trabalhadas
    if (intent === 'saida') {
      await verificarNotificacaoHoras(message, nomeUsuario)
    }
  }
}

/**
 * Verifica se deve notificar usuário sobre horas trabalhadas
 * @param {Message} message - Mensagem do Discord
 * @param {string} nomeUsuario - Nome do usuário
 */
const verificarNotificacaoHoras = async (message, nomeUsuario) => {
  try {
    const registro = await apiService.buscarRegistro(nomeUsuario)
    const notificacao = notificationService.deveNotificarHoras(registro)

    if (notificacao) {
      await notificationService.enviarDM(message.author, notificacao.mensagem)
      console.log(`📬 Notificação enviada para ${nomeUsuario}: ${notificacao.diff} que 8h`)
    }
  } catch (error) {
    // Silenciosamente ignora erros de notificação
  }
}
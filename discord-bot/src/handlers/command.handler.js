import * as apiService from '../services/api.service.js'
import * as notificationService from '../services/notification.service.js'

/**
 * Processa comando !registro
 * @param {Message} message - Mensagem do Discord
 * @param {string} nomeUsuario - Nome do usuário
 */
export const handleRegistroCommand = async (message, nomeUsuario) => {
  try {
    const registro = await apiService.buscarRegistro(nomeUsuario)
    const mensagemFormatada = notificationService.formatarRegistro(registro)
    await message.reply({ content: mensagemFormatada, ephemeral: false })
  } catch (err) {
    await message.reply('Registro não encontrado.')
  }
}

/**
 * Processa comando !pergunta
 * @param {Message} message - Mensagem do Discord
 * @param {string} nomeUsuario - Nome do usuário
 * @param {string} discordId - ID do Discord do usuário
 */
export const handlePerguntaCommand = async (message, nomeUsuario, discordId) => {
  const pergunta = message.content.replace('!pergunta', '').trim()
  
  if (!pergunta) return

  try {
    const resposta = await apiService.perguntarIA(pergunta, nomeUsuario, discordId)
    await message.reply(resposta)
  } catch (err) {
    await message.reply('Erro ao consultar a IA.')
  }
}

/**
 * Processa pergunta via DM
 * @param {Message} message - Mensagem do Discord
 */
export const handleDMQuestion = async (message) => {
  const pergunta = message.content.trim()
  
  if (!pergunta) return

  try {
    const resposta = await apiService.perguntarIA(
      pergunta,
      message.author.username,
      message.author.id
    )
    await message.reply(resposta)
  } catch (err) {
    await message.reply('Erro ao consultar a IA.')
  }
}

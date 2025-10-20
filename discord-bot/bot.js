import 'dotenv/config'
import { Client } from 'discord.js'
import { DISCORD_CONFIG, DISCORD_TOKEN } from './src/config/discord.config.js'
import * as nlpService from './src/services/nlp.service.js'
import { handleMessage } from './src/handlers/message.handler.js'
import { handlePresenceUpdate } from './src/handlers/presence.handler.js'

/**
 * Inicializa o bot Discord
 */
const inicializarBot = async () => {
  console.log('🧠 Treinando modelo NLP...')
  await nlpService.train()

  const client = new Client(DISCORD_CONFIG)

  client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} está online!`)
  })

  client.on('messageCreate', handleMessage)
  client.on('presenceUpdate', handlePresenceUpdate)

  await client.login(DISCORD_TOKEN)
}

// Iniciar bot
inicializarBot().catch(error => {
  console.error('❌ Erro ao inicializar bot:', error)
  process.exit(1)
})

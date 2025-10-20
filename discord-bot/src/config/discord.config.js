import { GatewayIntentBits, Partials } from 'discord.js'

/**
 * Configuração de intents e partials do Discord Client
 */
export const DISCORD_CONFIG = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel]
}

/**
 * Token do bot Discord
 */
export const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN
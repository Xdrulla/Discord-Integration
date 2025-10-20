import { NlpManager } from 'node-nlp'
import { TRAINING_DATA, NLP_CONFIG } from '../constants/nlp-training.js'
import { removerAcentos } from '../utils/string.utils.js'

const manager = new NlpManager({ languages: NLP_CONFIG.languages })
let isTrained = false

/**
 * Treina o modelo NLP com os dados de treinamento
 */
export const train = async () => {
  TRAINING_DATA.entrada.forEach(doc => {
    manager.addDocument('pt', doc, 'entrada')
  })

  TRAINING_DATA.saida.forEach(doc => {
    manager.addDocument('pt', doc, 'saida')
  })

  TRAINING_DATA.neutro.forEach(doc => {
    manager.addDocument('pt', doc, 'neutro')
  })

  await manager.train()
  manager.save()
  isTrained = true
  console.log('✅ NLP treinado com sucesso!')
}

/**
 * Classifica uma mensagem e retorna o intent
 * @param {string} mensagem - Mensagem a ser classificada
 * @returns {Promise<{intent: string, score: number}>}
 */
export const classificarMensagem = async (mensagem) => {
  if (!isTrained) {
    throw new Error('NLP não foi treinado ainda')
  }

  const mensagemProcessada = removerAcentos(mensagem)
  const response = await manager.process('pt', mensagemProcessada)

  if (response.score < NLP_CONFIG.minConfidence) {
    return { intent: 'None', score: response.score }
  }

  return {
    intent: response.intent,
    score: response.score
  }
}

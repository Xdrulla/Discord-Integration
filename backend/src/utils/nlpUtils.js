const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['pt', 'en', 'es'] })

manager.addDocument('pt', 'bom dia', 'entrada')
manager.addDocument('pt', 'bom dia pessoal', 'entrada')
manager.addDocument('pt', 'e aí, bom dia', 'entrada')
manager.addDocument('pt', 'cheguei, bom dia', 'entrada')

manager.addDocument('en', 'good morning', 'entrada')
manager.addDocument('en', 'hi, good morning', 'entrada')
manager.addDocument('en', 'i just arrived', 'entrada')
manager.addDocument('en', 'hello everyone', 'entrada')

manager.addDocument('es', 'buenos días', 'entrada')
manager.addDocument('es', 'hola, buenos días', 'entrada')
manager.addDocument('es', 'acabo de llegar', 'entrada')
manager.addDocument('es', 'hola a todos', 'entrada')

manager.addDocument('pt', 'até logo', 'saida')
manager.addDocument('pt', 'até breve', 'saida')
manager.addDocument('pt', 'até mais pessoal', 'saida')
manager.addDocument('pt', 'até amanhã', 'saida')
manager.addDocument('pt', 'até depois', 'saida')
manager.addDocument('pt', 'até semana que vem', 'saida')
manager.addDocument('pt', 'falou', 'saida')
manager.addDocument('pt', 'fui', 'saida')
manager.addDocument('pt', 'bom final de semana pessoal', 'saida');
manager.addDocument('pt', 'até mais pessoal bom final de semana', 'saida');
manager.addDocument('pt', 'bom feriado pessoal', 'saida');
manager.addDocument('pt', 'bom fim de semana galera', 'saida');
manager.addDocument('pt', 'bom fim de semana pessoal', 'saida');

manager.addDocument('en', 'see you later', 'saida')
manager.addDocument('en', 'goodbye', 'saida')
manager.addDocument('en', 'have a nice day', 'saida')
manager.addDocument('en', 'i\'m leaving', 'saida')

manager.addDocument('es', 'hasta luego', 'saida')
manager.addDocument('es', 'adiós', 'saida')
manager.addDocument('es', 'que tengas un buen día', 'saida')
manager.addDocument('es', 'me voy', 'saida')

  (async () => {
    await manager.train()
    manager.save()
    console.log("✅ Modelo de NLP treinado e salvo!")
  })()

const classificarMensagem = async (mensagem) => {
  let melhorResposta = { score: 0 }

  for (const lang of ['pt', 'en', 'es']) {
    const resposta = await manager.process(lang, mensagem)
    if (resposta.score > melhorResposta.score) {
      melhorResposta = resposta
    }
  }

  return melhorResposta.intent
}

const removerAcentos = (texto) => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

module.exports = {
  classificarMensagem,
  removerAcentos,
}
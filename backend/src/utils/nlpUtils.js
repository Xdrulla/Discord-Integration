const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['pt'] })

manager.addDocument('pt', 'bom dia', 'entrada')
manager.addDocument('pt', 'bom dia pessoal', 'entrada')
manager.addDocument('pt', 'bom dia galera', 'entrada')
manager.addDocument('pt', 'bom dia a todos', 'entrada')
manager.addDocument('pt', 'bom dia a todos pessoal', 'entrada')
manager.addDocument('pt', 'bom dia a todos galera', 'entrada')
manager.addDocument('pt', 'boa tarde', 'entrada')
manager.addDocument('pt', 'boa tarde pessoal', 'entrada')
manager.addDocument('pt', 'e aí, bom dia', 'entrada')
manager.addDocument('pt', 'cheguei, bom dia', 'entrada')

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
manager.addDocument('pt', 'bye', 'saida');
manager.addDocument('pt', 'bye, bye', 'saida');
manager.addDocument('pt', 'bye bye', 'saida');

(async () => {
  await manager.train()
  manager.save()
})()

const classificarMensagem = async (mensagem) => {
  const response = await manager.process('pt', mensagem)
  return response.intent
}

const removerAcentos = (texto) => {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

module.exports = {
  classificarMensagem,
  removerAcentos,
}
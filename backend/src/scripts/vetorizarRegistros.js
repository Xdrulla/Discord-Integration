require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const inputPath = path.join(__dirname, 'registros_exportadas.json');
const outputPath = path.join(__dirname, 'registros_vetorizados.jsonl');

// Lê arquivo se existir
const registrosSalvos = new Set();
if (fs.existsSync(outputPath)) {
  const linhas = fs.readFileSync(outputPath, 'utf-8').split('\n').filter(Boolean);
  for (const linha of linhas) {
    const obj = JSON.parse(linha);
    registrosSalvos.add(obj.id);
  }
}

(async () => {
  try {
    const dados = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    for (const item of dados) {
      if (registrosSalvos.has(item.id)) {
        console.log(`⏩ Pulado (já vetorizado): ${item.id}`);
        continue;
      }

      const texto = `
        Registro de ponto para o usuário ${item.usuario || 'desconhecido'} no dia ${item.data || 'sem data'}.
        Entrada: ${item.entrada || 'não registrada'}.
        Saída: ${item.saida || 'não registrada'}.
        Total de horas: ${item.total_horas || 'indisponível'}.
        Pausas: ${
          Array.isArray(item.pausas)
            ? item.pausas.map((p, i) => `Pausa ${i + 1}: de ${p.inicio} até ${p.fim}`).join('; ')
            : 'nenhuma'
        }.
      `.trim();

      const resposta = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texto,
      });

      const vetor = {
        id: item.id,
        usuario: item.usuario || null,
        data: item.data || null,
        texto,
        embedding: resposta.data[0].embedding,
      };

      fs.appendFileSync(outputPath, JSON.stringify(vetor) + '\n');
      console.log(`✅ Vetorizado: ${item.id}`);

      // Delay de 100ms entre as chamadas (10 por segundo)
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n🎉 Todos os embeddings foram gerados com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante vetorização:', err.message);
  }
})();

# Workflows n8n - Sistema de Ponto Discord

Este documento detalha os workflows necessários no n8n para substituir as funcionalidades do bot Discord.

## Pré-requisitos

### 1. Credenciais Discord no n8n
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Use o mesmo bot existente ou crie um novo
3. No n8n, vá em **Credentials** > **Add Credential** > **Discord**
4. Configure com o Bot Token

### 2. IDs Necessários
Você vai precisar dos seguintes IDs do Discord:
- **Channel ID** do canal de registros de ponto
- **Guild ID** (ID do servidor)

Para obter: Ative o "Modo Desenvolvedor" no Discord (Configurações > Avançado), clique com botão direito no canal/servidor e "Copiar ID".

### 3. URL do Backend
- Produção: `https://discord-backend.fly.dev`

---

## Workflow 1: Registro de Ponto (Entrada/Saída)

Este workflow roda a cada 10 minutos, busca mensagens recentes e envia para o backend classificar via NLP.

### Estrutura do Workflow

```
[Schedule: 10min] → [Get many messages] → [Filter últimos 10min] → [Loop] → [HTTP POST /register]
```

### Nodes:

#### Node 1: Schedule Trigger
- **Type:** Schedule Trigger
- **Trigger Interval:** Every 10 minutes

#### Node 2: Discord - Get many messages
- **Type:** Discord
- **Operation:** Get Many Messages
- **Channel ID:** `SEU_CHANNEL_ID_DE_REGISTROS`
- **Limit:** 50

#### Node 3: Code - Filtrar mensagens recentes (não bots)
- **Type:** Code
- **Language:** JavaScript
```javascript
const agora = Date.now();
const dezMinutos = 10 * 60 * 1000;

const mensagensRecentes = [];

for (const item of $input.all()) {
  const msg = item.json;
  const timestamp = new Date(msg.timestamp).getTime();
  const isRecente = (agora - timestamp) < dezMinutos;
  const isBot = msg.author?.bot === true;

  if (isRecente && !isBot) {
    mensagensRecentes.push(item);
  }
}

return mensagensRecentes;
```

#### Node 4: HTTP Request - Registrar Ponto
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://discord-backend.fly.dev/register`
- **Authentication:** None
- **Send Body:** ON
- **Body Content Type:** JSON
- **Specify Body:** Using JSON
- **JSON:**
```json
{
  "usuario": "{{ $json.author.username }}",
  "mensagem": "{{ $json.content }}",
  "discordId": "{{ $json.author.id }}"
}
```

### Diagrama Visual

```
┌──────────────────┐     ┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Schedule Trigger │ ──► │ Discord             │ ──► │ Code             │ ──► │ HTTP Request    │
│ Every 10 min     │     │ Get many messages   │     │ Filtrar recentes │     │ POST /register  │
└──────────────────┘     └─────────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Workflow 2: Comando !registro

Roda a cada 5 minutos, busca comandos `!registro` e responde com os dados do usuário.

### Estrutura do Workflow

```
[Schedule: 5min] → [Get messages] → [Filter !registro] → [HTTP GET registro] → [Format] → [Discord Send]
```

### Nodes:

#### Node 1: Schedule Trigger
- **Trigger Interval:** Every 5 minutes

#### Node 2: Discord - Get many messages
- **Channel ID:** `SEU_CHANNEL_ID`
- **Limit:** 30

#### Node 3: Code - Filtrar comandos !registro
```javascript
const agora = Date.now();
const cincoMinutos = 5 * 60 * 1000;

const comandos = [];

for (const item of $input.all()) {
  const msg = item.json;
  const timestamp = new Date(msg.timestamp).getTime();
  const isRecente = (agora - timestamp) < cincoMinutos;
  const isComando = msg.content?.startsWith('!registro');
  const isBot = msg.author?.bot === true;

  if (isRecente && isComando && !isBot) {
    comandos.push(item);
  }
}

return comandos;
```

#### Node 4: HTTP Request - Buscar Registro
- **Method:** GET
- **URL:** `https://discord-backend.fly.dev/registro/{{ $json.author.username }}`

#### Node 5: Code - Formatar Mensagem
```javascript
const registro = $input.first().json;
const originalMsg = $('Filtrar comandos !registro').first().json;

if (!registro || !registro.entrada) {
  return [{
    json: {
      message: 'Registro não encontrado para hoje.',
      channelId: originalMsg.channel_id
    }
  }];
}

let mensagem = `**Registro de Ponto - ${registro.data}**\n`;
mensagem += `👤 ${registro.usuario}\n`;
mensagem += `🟢 Entrada: ${registro.entrada}\n`;

if (registro.saida) {
  mensagem += `🔴 Saída: ${registro.saida}\n`;
  mensagem += `⏱️ Total: ${registro.total_horas}\n`;
}

if (registro.total_pausas) {
  mensagem += `⏸️ Pausas: ${registro.total_pausas}\n`;
}

return [{
  json: {
    message: mensagem,
    channelId: originalMsg.channel_id
  }
}];
```

#### Node 6: Discord - Send Message
- **Operation:** Send a Message
- **Channel ID:** `{{ $json.channelId }}`
- **Message:** `{{ $json.message }}`

---

## Workflow 3: Comando !pergunta (Chat IA)

Processa perguntas enviadas com `!pergunta` e responde usando a IA do backend.

### Estrutura do Workflow

```
[Schedule: 5min] → [Get messages] → [Filter !pergunta] → [Extract question] → [HTTP POST /ai/chat] → [Discord Send]
```

### Nodes:

#### Node 1: Schedule Trigger
- **Trigger Interval:** Every 5 minutes

#### Node 2: Discord - Get many messages
- **Channel ID:** `SEU_CHANNEL_ID`
- **Limit:** 30

#### Node 3: Code - Filtrar e extrair perguntas
```javascript
const agora = Date.now();
const cincoMinutos = 5 * 60 * 1000;

const perguntas = [];

for (const item of $input.all()) {
  const msg = item.json;
  const timestamp = new Date(msg.timestamp).getTime();
  const isRecente = (agora - timestamp) < cincoMinutos;
  const isComando = msg.content?.startsWith('!pergunta');
  const isBot = msg.author?.bot === true;

  if (isRecente && isComando && !isBot) {
    const pergunta = msg.content.replace('!pergunta', '').trim();
    if (pergunta) {
      perguntas.push({
        json: {
          pergunta: pergunta,
          usuario: msg.author.username,
          discordId: msg.author.id,
          channelId: msg.channel_id
        }
      });
    }
  }
}

return perguntas;
```

#### Node 4: HTTP Request - Chat IA
- **Method:** POST
- **URL:** `https://discord-backend.fly.dev/ai/chat`
- **Body:**
```json
{
  "question": "{{ $json.pergunta }}",
  "usuario": "{{ $json.usuario }}",
  "discordId": "{{ $json.discordId }}"
}
```

#### Node 5: Code - Preparar resposta
```javascript
const resposta = $input.first().json;
const dadosOriginal = $('Filtrar e extrair perguntas').first().json;

return [{
  json: {
    message: resposta.answer || 'Não consegui processar sua pergunta.',
    channelId: dadosOriginal.channelId
  }
}];
```

#### Node 6: Discord - Send Message
- **Channel ID:** `{{ $json.channelId }}`
- **Message:** `{{ $json.message }}`

---

## Workflow Unificado (Alternativa Recomendada)

Em vez de 3 workflows separados, você pode criar um único workflow que trata tudo:

### Estrutura

```
[Schedule: 5min] → [Get messages] → [Filter recentes] → [Switch] → [Branches...]
```

### Node Switch - Roteamento
Após filtrar mensagens recentes, use um node **Switch** para rotear:

```javascript
// Condição 1: É comando !registro
{{ $json.content.startsWith('!registro') }}

// Condição 2: É comando !pergunta
{{ $json.content.startsWith('!pergunta') }}

// Condição 3: Default (mensagem normal - registrar ponto)
// Todas as outras mensagens vão para registro
```

### Diagrama do Workflow Unificado

```
                                         ┌─► [HTTP GET /registro] ─► [Format] ─► [Discord Send]
                                         │   (Branch: !registro)
                                         │
[Schedule] ─► [Get Messages] ─► [Filter] ─► [Switch] ─► [HTTP POST /ai/chat] ─► [Discord Send]
                                         │   (Branch: !pergunta)
                                         │
                                         └─► [HTTP POST /register]
                                             (Branch: Default)
```

---

## Evitando Mensagens Duplicadas

Como o workflow roda por polling, a mesma mensagem pode ser processada múltiplas vezes. Para evitar isso:

### Opção 1: Usar ID da última mensagem (Recomendado)

Adicione um node **Static Data** para guardar o último ID processado:

```javascript
// No início do Code de filtro
const staticData = $getWorkflowStaticData('global');
const lastProcessedId = staticData.lastMessageId || '0';

const mensagensNovas = [];

for (const item of $input.all()) {
  const msg = item.json;
  // Só processa se ID for maior que o último processado
  if (BigInt(msg.id) > BigInt(lastProcessedId)) {
    mensagensNovas.push(item);
  }
}

// Salva o maior ID processado
if (mensagensNovas.length > 0) {
  const maiorId = mensagensNovas
    .map(m => m.json.id)
    .sort((a, b) => BigInt(b) - BigInt(a))[0];
  staticData.lastMessageId = maiorId;
}

return mensagensNovas;
```

### Opção 2: Confiar no backend

O backend já trata parcialmente:
- **Entrada:** Mantém a primeira, ignora duplicatas
- **Saída:** Atualiza para a última (pode ser um problema se processar mensagem antiga)

Para começar, pode usar sem controle de duplicatas e adicionar depois se necessário.

---

## Variáveis para Substituir

Antes de ativar os workflows, substitua:

| Placeholder | Valor | Onde encontrar |
|-------------|-------|----------------|
| `SEU_CHANNEL_ID` | ID do canal de ponto | Botão direito no canal > Copiar ID |
| `https://discord-backend.fly.dev` | URL do backend | Já está configurado |

---

## Limitações do Polling vs Bot em Tempo Real

| Aspecto | Bot (tempo real) | n8n (polling) |
|---------|------------------|---------------|
| Latência | Instantâneo | Até 10 minutos |
| Registro de entrada | Imediato | Até 10 min depois |
| Comandos | Resposta imediata | Até 5 min depois |
| Custo | Máquina 24/7 | Zero (usa n8n existente) |

**Nota:** Para o sistema de ponto, um delay de até 10 minutos no registro geralmente é aceitável, já que o que importa é o horário da mensagem original, não quando foi processada.

---

## Checklist de Configuração

- [ ] Criar credencial Discord no n8n
- [ ] Obter Channel ID do canal de registros
- [ ] Criar Workflow 1 (Registro de Ponto)
- [ ] Testar Workflow 1 enviando "bom dia" no canal
- [ ] Criar Workflow 2 (Comando !registro) - opcional
- [ ] Criar Workflow 3 (Comando !pergunta) - opcional
- [ ] Ativar todos os workflows
- [ ] Configurar bot-presence.js para pausas automáticas
- [ ] Desativar bot antigo

---

## Troubleshooting

### Mensagens não estão sendo buscadas
- Verifique se o Channel ID está correto
- Confirme que o bot tem permissão de ler mensagens no canal
- Teste o node Discord isoladamente

### HTTP Request retorna erro
- Verifique se a URL do backend está correta
- Teste o endpoint manualmente com curl/Postman
- Verifique os logs do backend

### Respostas não aparecem no Discord
- Verifique se o bot tem permissão de enviar mensagens
- Confirme que o Channel ID no node Send Message está correto

### Workflow não executa
- Verifique se o workflow está ativo (toggle verde)
- Confira o histórico de execuções no n8n
- Verifique se o Schedule Trigger está configurado corretamente

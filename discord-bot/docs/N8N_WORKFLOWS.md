# Workflows n8n - Sistema de Ponto Discord

Este documento detalha os workflows necessários no n8n para substituir as funcionalidades do bot Discord.

## Pré-requisitos

### 1. Credenciais Discord no n8n
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Use o mesmo bot existente ou crie um novo
3. No n8n, vá em **Credentials** > **Add Credential** > **Discord OAuth2 API**
4. Configure com Client ID e Client Secret do bot

### 2. URL do Backend
Certifique-se que o backend está acessível. Exemplos:
- Local: `http://localhost:5000`
- Produção: `https://seu-backend.com`

---

## Workflow 1: Registro de Ponto (Entrada/Saída)

Este workflow detecta mensagens e envia para o backend classificar via NLP.

### Estrutura do Workflow

```
[Discord Trigger] → [Filter Bot] → [HTTP Request] → [IF Error] → [Discord Reply]
```

### Nodes:

#### Node 1: Discord Trigger
- **Type:** Discord Trigger
- **Event:** Message Create
- **Channel:** Selecione o canal de ponto (ou todos)

#### Node 2: Filter - Ignorar Bots
- **Type:** IF
- **Condition:** `{{ $json.author.bot }}` is equal to `false`

#### Node 3: HTTP Request - Registrar
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `{SEU_BACKEND}/register`
- **Body Content Type:** JSON
- **Body:**
```json
{
  "usuario": "={{ $json.member.nick || $json.author.username }}",
  "mensagem": "={{ $json.content }}",
  "discordId": "={{ $json.author.id }}"
}
```

#### Node 4 (Opcional): Tratar Erro
- **Type:** IF
- **Condition:** Check if HTTP response has error
- Se erro, pode logar ou ignorar silenciosamente

### JSON do Workflow (Importar no n8n)

```json
{
  "name": "Discord - Registro de Ponto",
  "nodes": [
    {
      "parameters": {
        "resource": "message",
        "event": "messageCreate"
      },
      "name": "Discord Trigger",
      "type": "n8n-nodes-base.discordTrigger",
      "position": [250, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.author.bot }}",
              "value2": false
            }
          ]
        }
      },
      "name": "Ignorar Bots",
      "type": "n8n-nodes-base.if",
      "position": [450, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "method": "POST",
        "url": "={YOUR_BACKEND_URL}/register",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "usuario",
              "value": "={{ $json.member?.nick || $json.author.username }}"
            },
            {
              "name": "mensagem",
              "value": "={{ $json.content }}"
            },
            {
              "name": "discordId",
              "value": "={{ $json.author.id }}"
            }
          ]
        },
        "options": {}
      },
      "name": "Registrar Ponto",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300],
      "typeVersion": 4
    }
  ],
  "connections": {
    "Discord Trigger": {
      "main": [
        [
          {
            "node": "Ignorar Bots",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ignorar Bots": {
      "main": [
        [
          {
            "node": "Registrar Ponto",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## Workflow 2: Comando !registro

Responde com o registro do dia quando usuário digita `!registro`.

### Estrutura do Workflow

```
[Discord Trigger] → [IF !registro] → [HTTP GET] → [Format Message] → [Discord Reply]
```

### Nodes:

#### Node 1: Discord Trigger
- **Type:** Discord Trigger
- **Event:** Message Create

#### Node 2: IF - Verificar Comando
- **Type:** IF
- **Condition:** `{{ $json.content.startsWith('!registro') }}` is equal to `true`

#### Node 3: HTTP Request - Buscar Registro
- **Type:** HTTP Request
- **Method:** GET
- **URL:** `{SEU_BACKEND}/registro/{{ $json.member.nick || $json.author.username }}`

#### Node 4: Code - Formatar Mensagem
- **Type:** Code (JavaScript)
```javascript
const registro = $input.first().json;

if (!registro || !registro.entrada) {
  return [{ json: { message: 'Registro não encontrado para hoje.' } }];
}

let mensagem = `**Registro de Ponto - ${registro.data}**\n`;
mensagem += `Entrada: ${registro.entrada}\n`;

if (registro.saida) {
  mensagem += `Saída: ${registro.saida}\n`;
  mensagem += `Total: ${registro.total_horas}\n`;
}

if (registro.pausas && registro.pausas.length > 0) {
  mensagem += `Pausas: ${registro.total_pausas || 'N/A'}\n`;
}

return [{ json: { message: mensagem } }];
```

#### Node 5: Discord - Responder
- **Type:** Discord
- **Operation:** Send Message
- **Channel ID:** `={{ $('Discord Trigger').item.json.channel_id }}`
- **Message:** `={{ $json.message }}`

### JSON do Workflow

```json
{
  "name": "Discord - Comando Registro",
  "nodes": [
    {
      "parameters": {
        "resource": "message",
        "event": "messageCreate"
      },
      "name": "Discord Trigger",
      "type": "n8n-nodes-base.discordTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.content }}",
              "operation": "startsWith",
              "value2": "!registro"
            }
          ]
        }
      },
      "name": "IF Comando Registro",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={YOUR_BACKEND_URL}/registro/{{ $json.member?.nick || $json.author.username }}"
      },
      "name": "Buscar Registro",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300]
    },
    {
      "parameters": {
        "jsCode": "const registro = $input.first().json;\n\nif (!registro || !registro.entrada) {\n  return [{ json: { message: 'Registro não encontrado para hoje.' } }];\n}\n\nlet mensagem = `**Registro de Ponto - ${registro.data}**\\n`;\nmensagem += `Entrada: ${registro.entrada}\\n`;\n\nif (registro.saida) {\n  mensagem += `Saída: ${registro.saida}\\n`;\n  mensagem += `Total: ${registro.total_horas}\\n`;\n}\n\nif (registro.pausas && registro.pausas.length > 0) {\n  mensagem += `Pausas: ${registro.total_pausas || 'N/A'}\\n`;\n}\n\nreturn [{ json: { message: mensagem } }];"
      },
      "name": "Formatar Mensagem",
      "type": "n8n-nodes-base.code",
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "channelId": "={{ $('Discord Trigger').item.json.channel_id }}",
        "message": "={{ $json.message }}"
      },
      "name": "Discord Reply",
      "type": "n8n-nodes-base.discord",
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Discord Trigger": {
      "main": [[{ "node": "IF Comando Registro", "type": "main", "index": 0 }]]
    },
    "IF Comando Registro": {
      "main": [[{ "node": "Buscar Registro", "type": "main", "index": 0 }]]
    },
    "Buscar Registro": {
      "main": [[{ "node": "Formatar Mensagem", "type": "main", "index": 0 }]]
    },
    "Formatar Mensagem": {
      "main": [[{ "node": "Discord Reply", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Workflow 3: Comando !pergunta (Chat IA)

Processa perguntas e envia para o endpoint de IA.

### Estrutura do Workflow

```
[Discord Trigger] → [IF !pergunta] → [Extract Question] → [HTTP POST /ai/chat] → [Discord Reply]
```

### Nodes:

#### Node 1: Discord Trigger
- **Event:** Message Create

#### Node 2: IF - Verificar Comando
- **Condition:** `{{ $json.content.startsWith('!pergunta') }}`

#### Node 3: Code - Extrair Pergunta
```javascript
const content = $input.first().json.content;
const pergunta = content.replace('!pergunta', '').trim();

return [{
  json: {
    pergunta: pergunta,
    usuario: $input.first().json.member?.nick || $input.first().json.author.username,
    discordId: $input.first().json.author.id,
    channelId: $input.first().json.channel_id
  }
}];
```

#### Node 4: HTTP Request - Chat IA
- **Method:** POST
- **URL:** `{SEU_BACKEND}/ai/chat`
- **Body:**
```json
{
  "question": "={{ $json.pergunta }}",
  "usuario": "={{ $json.usuario }}",
  "discordId": "={{ $json.discordId }}"
}
```

#### Node 5: Discord - Responder
- **Channel ID:** `={{ $('Extrair Pergunta').item.json.channelId }}`
- **Message:** `={{ $json.answer }}`

---

## Workflow 4: Perguntas via DM

Responde perguntas enviadas diretamente ao bot via mensagem privada.

### Estrutura do Workflow

```
[Discord Trigger (DM)] → [Filter Bot] → [HTTP POST /ai/chat] → [Discord DM Reply]
```

### Nodes:

#### Node 1: Discord Trigger
- **Event:** Direct Message Create

#### Node 2: IF - Ignorar Bots
- **Condition:** `{{ $json.author.bot }}` is equal to `false`

#### Node 3: HTTP Request - Chat IA
- **Method:** POST
- **URL:** `{SEU_BACKEND}/ai/chat`
- **Body:**
```json
{
  "question": "={{ $json.content }}",
  "usuario": "={{ $json.author.username }}",
  "discordId": "={{ $json.author.id }}"
}
```

#### Node 4: Discord - Responder DM
- **Operation:** Send Direct Message
- **User ID:** `={{ $json.author.id }}`
- **Message:** `={{ $json.answer }}`

---

## Workflow Unificado (Recomendado)

Para simplificar, você pode criar um único workflow que trata todos os casos:

```
                                    ┌─→ [Registrar Ponto]
                                    │
[Discord Trigger] → [Filter Bot] → [Switch] → [!registro] → [Buscar] → [Reply]
                                    │
                                    ├─→ [!pergunta] → [Chat IA] → [Reply]
                                    │
                                    └─→ [DM] → [Chat IA] → [DM Reply]
```

### Node Switch - Roteamento
```javascript
// Condições do Switch:
// 1. content.startsWith('!registro') → Output 1
// 2. content.startsWith('!pergunta') → Output 2
// 3. channel.type === 'DM' → Output 3
// 4. default → Output 4 (Registrar Ponto)
```

---

## Variáveis de Ambiente n8n

Configure estas variáveis no seu n8n:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `BACKEND_URL` | `https://seu-backend.com` | URL do backend de ponto |

Você pode usar `{{ $env.BACKEND_URL }}` nos nodes HTTP Request.

---

## Dicas de Configuração

### 1. Tratamento de Erros
Adicione um node **Error Trigger** para capturar falhas e notificar via Discord ou email.

### 2. Rate Limiting
O Discord tem limites de requisição. Se necessário, adicione um node **Wait** entre operações.

### 3. Logs
Use o node **Write Binary File** ou integração com serviço de logs para monitorar execuções.

### 4. Webhook vs Trigger
- **Discord Trigger:** Requer n8n sempre rodando (modo worker)
- **Webhook:** Alternativa se seu Discord bot suportar enviar webhooks

---

## Migração Passo a Passo

1. **Importe os workflows** no n8n
2. **Configure as credenciais** do Discord
3. **Substitua `{YOUR_BACKEND_URL}`** pela URL real
4. **Teste cada workflow** individualmente
5. **Ative os workflows**
6. **Pare o bot antigo** e inicie o `bot-presence.js`
7. **Monitore** por alguns dias para garantir funcionamento

---

## Troubleshooting

### Mensagens não estão sendo capturadas
- Verifique se o bot tem permissão no canal
- Confirme que os intents estão habilitados no Discord Developer Portal

### Erro 404 no backend
- Verifique se a URL está correta
- Confirme que o backend está rodando

### Resposta não aparece no Discord
- Verifique se o bot tem permissão de enviar mensagens
- Confirme que o Channel ID está correto

### Timeout nas requisições
- Aumente o timeout no node HTTP Request
- Verifique latência do backend

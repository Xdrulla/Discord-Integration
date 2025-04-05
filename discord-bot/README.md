# Discord Bot 🧹

Este bot integra-se com um backend para registrar automaticamente entradas, saídas e pausas de usuários em um servidor Discord com base em mensagens e mudanças de status.

---

## 💡 Visão Geral
- Detecta mensagens como "bom dia" ou "fui" para marcar entrada/saída.
- Usa **NLP (node-nlp)** para classificar mensagens.
- Monitora mudanças de status (`online`, `idle`, `offline`, `dnd`) para iniciar ou encerrar **pausas automaticamente**.
- Faz chamadas HTTP ao backend para registrar os eventos.

---

## 🚀 Como Funciona

### NLP (Processamento de Linguagem Natural)
- Treina um modelo com frases comuns para entrada e saída.
- As mensagens recebidas são normalizadas (acentos removidos) e processadas com NLP para determinar se são:
  - `entrada`
  - `saida`

### Eventos:
- `messageCreate`: escuta mensagens em texto dos usuários.
- `presenceUpdate`: escuta mudanças de status do Discord para registrar pausas.

### API Endpoints Utilizados:
- `POST /register` → Para entrada/saída
- `POST /pause` → Para início de pausa
- `POST /resume` → Para fim de pausa
- `GET /registro/:usuario` → Para checar se o usuário já marcou saída ou já está em pausa

---

## ⚙️ Execução

### 1. Criar `.env`
```env
DISCORD_BOT_TOKEN=seu_token_aqui
API_URL=http://localhost:5000
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Rodar o bot
```bash
npm start
```

---

## 🚜 Intents utilizados
```js
GatewayIntentBits.Guilds
GatewayIntentBits.GuildMessages
GatewayIntentBits.MessageContent
GatewayIntentBits.GuildPresences
GatewayIntentBits.GuildMembers
```

Certifique-se que o bot tem os intents ativados nas configurações do portal do Discord Developer.

---

## 📄 Exemplo de fluxo

1. **Usuário diz "bom dia"** no chat → `POST /register` com entrada
2. **Usuário muda de online para idle** → `POST /pause`
3. **Usuário volta para online** → `POST /resume`
4. **Usuário diz "falou"** → `POST /register` com saída

---

## 🔧 Dependências principais
| Pacote | Função |
|--------|--------|
| `discord.js` | Interação com a API do Discord |
| `node-nlp` | Classificação das mensagens via NLP |
| `axios` | Requisições HTTP para o backend |
| `dotenv` | Carregamento de variáveis de ambiente |

---

## 💡 Observações
- O bot **ignora mensagens de outros bots**.
- As presenças são validadas para evitar erro em caso de desconexão do Discord.
- O bot também loga a hora de mudança de status e se o usuário já marcou saída.

---

## 🌐 Possíveis melhorias
- Salvar modelo NLP treinado em disco e reaproveitar
- Feedback de confirmação via mensagem no canal
- Logs estruturados para auditoria (ex: Winston)

---

## 🎓 Autor
Desenvolvido por **Luan**


# Guia de Migração: Bot Discord → n8n + Bot Presença

## Visão Geral

Esta migração divide o bot monolítico em duas partes:

| Componente | Responsabilidade | Onde roda |
|------------|------------------|-----------|
| **n8n** | Mensagens, comandos, IA | Servidor n8n da empresa |
| **Bot Presença** | Monitorar status online/idle/offline | Host atual (muito mais leve) |

### Benefícios
- Redução drástica de consumo de recursos
- Sem NLP rodando localmente
- Sem processamento de mensagens
- Bot mantém apenas conexão WebSocket

---

## Arquivos Criados

```
discord-bot/
├── bot-presence.js          # Novo bot minimalista
├── package-presence.json    # Dependências reduzidas
└── docs/
    ├── N8N_WORKFLOWS.md     # Documentação dos workflows
    └── MIGRATION_GUIDE.md   # Este guia
```

---

## Passo a Passo da Migração

### Fase 1: Configurar n8n (Antes de desligar bot atual)

#### 1.1 Criar credenciais Discord no n8n

1. Acesse seu n8n
2. Vá em **Settings** > **Credentials**
3. Clique em **Add Credential**
4. Selecione **Discord OAuth2 API**
5. Preencha com os dados do [Discord Developer Portal](https://discord.com/developers/applications):
   - Client ID
   - Client Secret
   - Bot Token

#### 1.2 Importar workflows

1. Abra o n8n
2. Crie um novo workflow
3. Clique em **...** > **Import from JSON**
4. Cole o JSON dos workflows (veja `docs/N8N_WORKFLOWS.md`)

#### 1.3 Configurar variáveis

Substitua em todos os workflows:
- `{YOUR_BACKEND_URL}` → URL real do backend (ex: `https://api.seudominio.com`)

#### 1.4 Testar workflows

1. Ative o workflow de **Registro de Ponto**
2. Envie uma mensagem no Discord: "bom dia"
3. Verifique se o backend recebeu a requisição
4. Repita para os outros workflows

---

### Fase 2: Preparar Bot de Presença

#### 2.1 Instalar dependências mínimas

```bash
cd /home/luandrulla/Discord-Integration/discord-bot

# Opção A: Usar package-presence.json
cp package-presence.json package.json
npm install

# Opção B: Instalar manualmente apenas o necessário
npm install discord.js axios dotenv
npm uninstall node-nlp express  # Remover desnecessários
```

#### 2.2 Atualizar .env (se necessário)

O `.env` atual já tem tudo necessário:
```env
DISCORD_BOT_TOKEN=seu_token
API_URL=http://seu-backend:5000
```

#### 2.3 Testar bot de presença

```bash
node bot-presence.js
```

Deve aparecer:
```
[Presence Bot] Online: SeuBot#1234
```

---

### Fase 3: Migração Final

#### 3.1 Parar bot atual

```bash
# Se estiver rodando via PM2
pm2 stop discord-bot

# Se estiver rodando direto
# Ctrl+C ou kill do processo
```

#### 3.2 Garantir workflows ativos no n8n

Verifique que todos os workflows estão:
- Ativos (toggle verde)
- Sem erros de conexão

#### 3.3 Iniciar bot de presença

```bash
# Desenvolvimento
node bot-presence.js

# Produção (PM2)
pm2 start bot-presence.js --name "presence-bot"
pm2 save
```

#### 3.4 Monitorar

Nos primeiros dias, monitore:
- Logs do bot de presença
- Execuções dos workflows no n8n
- Registros no backend

---

## Comandos Úteis

### PM2 (Gerenciador de processos)

```bash
# Iniciar
pm2 start bot-presence.js --name "presence-bot"

# Ver status
pm2 status

# Ver logs
pm2 logs presence-bot

# Reiniciar
pm2 restart presence-bot

# Parar
pm2 stop presence-bot

# Salvar configuração
pm2 save
pm2 startup  # Para iniciar no boot
```

### Docker (Alternativa)

```dockerfile
# Dockerfile.presence
FROM node:20-alpine

WORKDIR /app

COPY package-presence.json ./package.json
RUN npm install --production

COPY bot-presence.js .
COPY .env .

CMD ["node", "bot-presence.js"]
```

```bash
docker build -f Dockerfile.presence -t presence-bot .
docker run -d --name presence-bot --restart unless-stopped presence-bot
```

---

## Rollback (Se algo der errado)

### Voltar para bot original

```bash
# 1. Parar bot de presença
pm2 stop presence-bot

# 2. Desativar workflows no n8n
# (fazer manualmente na interface)

# 3. Restaurar package.json original
git checkout package.json

# 4. Reinstalar dependências
npm install

# 5. Iniciar bot original
pm2 start bot.js --name "discord-bot"
```

---

## Arquivos que podem ser removidos (após migração estável)

Depois de confirmar que tudo funciona por pelo menos 1 semana:

```bash
# Handlers de mensagem (migrados para n8n)
rm src/handlers/message.handler.js
rm src/handlers/command.handler.js

# Serviços não mais necessários
rm src/services/nlp.service.js
rm src/services/notification.service.js

# Config antiga
rm src/config/discord.config.js

# Bot original
rm bot.js
rm server.js  # Se não for mais necessário

# Renomear arquivos
mv bot-presence.js bot.js
mv package-presence.json package.json
```

---

## Comparativo de Recursos

### Antes (Bot Monolítico)

| Recurso | Uso |
|---------|-----|
| RAM | ~150-300 MB (NLP carregado) |
| CPU | Alto (classificação constante) |
| Dependências | 5+ (discord.js, node-nlp, express, etc) |
| Intents | 6 (mensagens, presença, DM, etc) |

### Depois (Bot Presença)

| Recurso | Uso |
|---------|-----|
| RAM | ~30-50 MB |
| CPU | Mínimo (só eventos de presença) |
| Dependências | 3 (discord.js, axios, dotenv) |
| Intents | 3 (guilds, presences, members) |

**Redução estimada: 70-80% de recursos**

---

## Troubleshooting

### Bot de presença não detecta mudanças de status

1. Verifique se o intent `GuildPresences` está habilitado no Discord Developer Portal
2. Confirme que o bot tem permissão de ver membros no servidor

### Workflows n8n não recebem mensagens

1. Verifique se o trigger está ativo
2. Confirme as credenciais do Discord
3. Verifique se o bot tem acesso ao canal

### Pausas não estão sendo registradas

1. Verifique logs do bot: `pm2 logs presence-bot`
2. Confirme que o backend está acessível
3. Verifique se o usuário tem registro de entrada no dia

### Backend retorna 404

1. Usuário pode não ter registro do dia
2. Nome do usuário pode estar diferente (nickname vs username)
3. Verifique a URL do backend no .env

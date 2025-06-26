# Discord Integration Bot 🤖📅

Sistema completo para registro de ponto via Discord, com backend em Node.js + Firebase, um bot com NLP para entrada/saída, e frontend em React para visualização e gestão dos dados.

---

## 📂 Estrutura do Projeto

```
discord-integration/
├── backend/        # API com Express + Firebase + NLP
├── discord-bot/    # Bot do Discord com NLP e controle de status
├── frontend/       # Aplicativo React com dashboard, filtros, e painel de justificativas
```

---

## 🚀 Funcionalidades

### Discord Bot:
- Detecta mensagens como "bom dia" ou "fui" e registra entrada/saída automaticamente
- Utiliza **NLP** com `node-nlp` para classificação das mensagens
- Detecta **mudança de status (online/idle/offline)** para registrar início/fim de pausa automaticamente
- Comando `!registro` para consultar o ponto do dia
- Comando `!pergunta` integrado ao ChatGPT para dúvidas rápidas

### Backend:
- API em **Express** com integração Firebase Firestore
- NLP adicional para fallback ou serviços extra
- Cálculo automático de horas trabalhadas e pausas via `dayjs`
- WebSocket via `socket.io` para atualização em tempo real no frontend
- Sistema de **justificativas** com aprovação manual
- Controle de permissão: **admin** e **leitor**

### Frontend:
- Painel React com **Ant Design** para visualização dos registros
- Colunas configuráveis, filtros, datas e busca
- Cronômetro ao vivo em caso de pausa ativa
- Modal com justificativa, upload de comprovantes e aprovação
- Exportação para PDF ou CSV

---

## 👩‍💻 Tecnologias Utilizadas

| Módulo       | Tecnologias |  
|--------------|-------------|
| **Bot**      | discord.js, node-nlp, dotenv, axios |
| **Backend**  | express, firebase-admin, socket.io, nodemailer, dayjs |
| **Frontend** | react, vite, antd, socket.io-client, sweetalert2, firebase |

---

## ⚙️ Instalação e Execução

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/Discord-Integration.git
cd Discord-Integration
```

### 2. Criar os arquivos `.env`

Crie os seguintes arquivos com suas variáveis de ambiente:
- `backend/.env`
- `discord-bot/.env`
- `frontend/.env`

Sugestão: mantenha um `*.env.example` para cada pasta como modelo.

### 3. Instalar dependências
```bash
# Backend
cd backend
npm install

# Bot
cd ../discord-bot
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Iniciar os serviços
```bash
# Iniciar backend (porta 3001 por padrão)
cd backend
npm start

# Iniciar bot do Discord
cd ../discord-bot
npm start

# Iniciar frontend
cd ../frontend
npm run dev
```

---

## 🔢 Rotas da API (backend)

### `POST /register`
Registra entrada ou saída com base em mensagem:
```json
{
  "usuario": "Luan",
  "mensagem": "bom dia",
  "discordId": "123456789"
}
```

### `POST /pause`
Inicia uma pausa:
```json
{
  "usuario": "Luan",
  "inicio": "2025-04-05T14:30:00",
  "discordId": "123456789"
}
```

### `POST /resume`
Finaliza uma pausa:
```json
{
  "usuario": "Luan",
  "discordId": "123456789"
}
```

### `GET /registro/:usuario`
Busca registro atual do dia para um usuário.

---

## 🌐 Variáveis de Ambiente

### `backend/.env`
```
PORT=...
OPENAI_API_KEY=...
FIREBASE_CREDENTIALS=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_CLIENT_CERT_URL=...
REACT_APP_API_URL=...
EMAIL_SISTEMA=...
EMAIL_SENHA=...
```

### `discord-bot/.env`
```
DISCORD_BOT_TOKEN=...
API_URL=http://localhost:5000
PORT=4000
```

### `frontend/.env`
```
VITE_API_URL=...
```

---

## 📊 Futuras Melhorias
- [ ] Dashboard para admins com gráficos de desempenho
- [ ] Exportação de relatórios mensais por email
- [ ] Sistema de autenticação com roles mais granulares
- [ ] IA para sugestão de justificativas

---

## 🎓 Autor

Desenvolvido por **Luan** — Fullstack Developer.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

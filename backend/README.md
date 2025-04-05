# Backend - Discord Integration (Pontobot)

Este é o backend da aplicação **Pontobot**, um sistema de controle de ponto automatizado que integra mensagens do Discord com registros armazenados no Firebase. Ele permite o registro de entrada, saída, pausas e justificativas, com controle de autenticação e permissões via Firebase Auth.

---

## 📚 Visão Geral

O backend é responsável por:

- Receber e processar os registros de ponto enviados pelo bot do Discord.
- Gerenciar justificativas enviadas pelos usuários.
- Calcular o total de horas trabalhadas e pausas.
- Enviar e-mails de notificação e aprovação.
- Fornecer dados para o frontend.
- Garantir autenticação com Firebase.
- Emitir eventos em tempo real via WebSocket (Socket.IO).

---

## 📊 Tecnologias Utilizadas

- **Node.js** + **Express**
- **Firebase Admin SDK** (Firestore e Auth)
- **Socket.IO** (atualização em tempo real)
- **Nodemailer** (envio de e-mails)
- **Day.js** (fuso horário e data/hora)
- **dotenv** (variáveis de ambiente)
- **node-nlp** (processamento de linguagem natural)

---

## 🔹 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/                # Configuração do Firebase
│   ├── controllers/           # Controladores de registros e justificativas
│   ├── middlewares/          # Autenticação Firebase
│   ├── routes/               # Rotas da aplicação
│   ├── scripts/              # Scripts utilitários (ex: ajustar dados)
│   ├── utils/                # Funções de NLP e cálculo de horas
│   └── server.js           # Ponto de entrada do servidor Express
├── .env                      # Configurações sensíveis
├── package.json
```

---

## 🔒 Autenticação

A autenticação é feita com **tokens JWT do Firebase**. A função `authMiddleware.js`:

- Verifica o token no `Authorization: Bearer <token>`
- Adiciona `req.user` com `email`, `uid` e `role`
- É usada nas rotas protegidas (`justificativa`)

---

## ✉️ Notificações por E-mail

Quando uma justificativa é enviada:
- Admins com `receberNotificacoes=true` recebem e-mail.
- Quando aprovada ou reprovada, o leitor é notificado (caso deseje).
- Envio feito via **Nodemailer** com conta Gmail.

---

## ⚖️ Permissões

- **Admin**: pode aprovar, reprovar, ver e editar qualquer justificativa.
- **Leitor**: pode enviar e deletar apenas suas justificativas.

Permissão é atribuída via campo `role` no Firestore (coleção `users`).

---

## 🚧 Principais Funcionalidades

### 1. Registro de Entrada/Saída (`/register`)
- Recebe mensagem classificada como entrada ou saída.
- Salva a hora e atualiza pausas pendentes.
- Calcula total de horas e pausas.

### 2. Pausa (`/pause`) e Retorno de Pausa (`/resume`)
- Salva a hora de início e fim das pausas.
- Cálculo em tempo real baseado no status do Discord.

### 3. Justificativas (`PUT /justificativa`)
- Salva justificativa textual, anexos e campos manuais.
- Recalcula as horas se aprovado.
- Atualiza o banco de horas.

### 4. Exclusão de Justificativas (`DELETE /justificativa`)
- Somente o próprio autor pode deletar.

### 5. Consulta de Registro Atual (`GET /registro/:usuario`)
- Retorna os dados do dia atual para um determinado usuário.

---

## 🔍 Variáveis de Ambiente (`.env`)

```env
PORT=5000
API_URL=http://localhost:5000
EMAIL_SISTEMA=seu_email@gmail.com
EMAIL_SENHA=senha_segura
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_CERT_URL=...
```

**Importante**: Nunca subir o `.env` no Git. Use `.gitignore`.

---

## 📡 WebSocket (Socket.IO)

- Toda vez que um registro é atualizado (entrada, pausa, justificativa etc),
  o backend emite um evento: `registro-atualizado`

```js
io.emit("registro-atualizado", { usuario, data })
```

- O frontend escuta esse evento para atualizar a tabela em tempo real.

---

## ✅ Como Rodar

```bash
# Instalar dependências
npm install

# Rodar servidor
npm start
```

Certifique-se de ter um arquivo `.env` com as credenciais certas e acesso ao Firebase configurado corretamente.

---

## ✨ Melhorias Futuras

- Upload real de anexos (em vez de base64)
- Testes automatizados (Jest ou Vitest)
- Paginação nos registros
- Painel para gerenciamento de usuários (roles, permissões)
- Criação de logs de auditoria

---

## 🎓 Licença

Este projeto é de uso privado para fins de estudo e demonstração. Para uso comercial, consulte o autor.


## 🎓 Autor
Desenvolvido por **Luan**

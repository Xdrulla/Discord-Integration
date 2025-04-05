# Frontend - Discord Integration Pontobot

Este projeto representa o frontend da plataforma **Pontobot**, um sistema de controle de ponto e gestão de justificativas integrado ao Discord, com autenticação Firebase e painel web interativo.

## 📆 Funcionalidades Principais

- ✅ **Autenticação** com Firebase.
- 📍 **Registro de ponto** via mensagens no Discord ou mudança de status.
- ⏰ **Controle de pausas automáticas**, com contagem em tempo real.
- 📄 **Justificativas** com anexo, aprovação/reprovação por admins.
- ✉️ **Notificações por email** para admins e leitores.
- ▶️ **Painel com filtros, colunas configuráveis** e visualização clara de horas trabalhadas e pausas.
- ⏺ **Socket.IO** para atualização em tempo real dos registros.
- ✏️ **Sistema de justificativas com validação de permissões e alterações automáticas no banco de horas.**

## 📂 Estrutura de Pastas

```
src/
├── assets/               # Imagens e arquivos estáticos
├── components/           # Componentes organizados por contexto
│   ├── Admin/            # Telas e componentes administrativos
│   ├── Auth/             # Telas de login e perfil
│   ├── common/           # Componentes reutilizáveis (alertas, modal, etc)
│   └── layout/           # Layout da aplicação (sidebar, rotas protegidas)
├── config/               # Configuração do Firebase
├── context/              # Contexto de autenticação
├── helper/               # Hooks auxiliares e filtros
├── pages/                # App principal
├── services/             # Serviços para chamadas à API
├── styles/               # Estilização SCSS modularizada
├── utils/                # Funções auxiliares
└── main.jsx              # Entrada principal da aplicação
```

## 🚀 Tecnologias Utilizadas

- **React 19** com **Vite**
- **Firebase** (Auth e Firestore)
- **Socket.IO Client**
- **Ant Design** para UI
- **SCSS** modular
- **SweetAlert2** para alertas
- **Axios** para requisições HTTP
- **jsPDF + AutoTable** para exportação
- **PapaParse** para CSV
- **Lodash / debounce**
- **Moment / Dayjs** para datas

## 🔧 Instalação e Execução

```bash
# Instale as dependências
npm install

# Rode o servidor local
npm run dev

# Para build de produção
vercel --prod
```

## 📁 Variáveis de Ambiente

Coloque o arquivo `.env` dentro da pasta `frontend/` com as variáveis:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_SOCKET_URL=
```

## 📅 Observações Importantes

- O frontend depende do backend (porta 5000 por padrão).
- A comunicação em tempo real exige que o backend esteja online.
- As permissões do usuário (admin ou leitor) são atribuídas via Firestore.

## 📃 Documentação Adicional

- [README do Backend](../backend/README.md)
- [README do Bot Discord](../discord-bot/README.md)

---

## 🎓 Autor
Desenvolvido por **Luan**

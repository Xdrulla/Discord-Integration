# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## 🚀 Comandos de Desenvolvimento

### Comandos Principais
```bash
npm install        # Instalar dependências
npm run dev        # Executar servidor de desenvolvimento (Vite)
npm run build      # Build de produção
npm run preview    # Preview do build de produção
npm run lint       # Executar ESLint
```

### Ambiente
- **Frontend**: React 19 + Vite + JavaScript (ES modules)
- **Build Tool**: Vite 6.1.0
- **Linting**: ESLint 9.x com regras React

## 🏗️ Arquitetura e Stack Tecnológico

### Stack Principal
- **React 19** com hooks (function components apenas)
- **Vite** como bundler (substituiu Webpack)
- **Firebase Auth + Firestore** para autenticação e dados
- **Ant Design 5.24+** como biblioteca de UI principal
- **SASS** modular para estilização
- **Socket.IO Client** para atualizações em tempo real
- **React Router DOM 6.30** para roteamento
- **Axios** para requisições HTTP

### Padrões de Arquitetura

#### Sistema de Autenticação
- **Firebase Auth** integrado com **Context API**
- AuthProvider gerencia estado global do usuário
- PrivateRoute component para proteção de rotas
- Roles: "admin" | "leitor" armazenados no Firestore
- Token JWT Firebase usado para autenticação com backend

#### Estrutura de Dados
- **Firebase Firestore** como banco principal
- **Backend API** (Node.js) para operações específicas 
- Comunicação híbrida: Firestore + API REST + WebSocket

#### Sistema de Roteamento
Usa **React Router DOM 6.30** com padrão de nested routes:
```javascript
// App.jsx - Estrutura principal
<AuthProvider>
  <Router>
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
  </Router>
</AuthProvider>
```

#### Layout System
- **ProtectedLayout**: Layout principal com sidebar + topbar
- **Outlet** do React Router para renderizar páginas filhas
- **PaginationProvider** para contexto de paginação global

## 📁 Estrutura de Arquivos e Convenções

### Organização por Feature/Context
```
src/
├── components/
│   ├── Admin/              # Componentes administrativos
│   │   ├── Dashboard.jsx   # Dashboard principal
│   │   ├── ManageUsers.jsx # Gestão de usuários
│   │   └── justification/  # Sub-módulo de justificativas
│   ├── Auth/               # Autenticação e perfil
│   ├── common/             # Componentes reutilizáveis
│   └── layout/             # Layout e navegação
├── context/                # React Context providers
├── services/               # Serviços API e Firebase
├── hooks/                  # Custom hooks
├── utils/                  # Funções utilitárias
├── styles/                 # SASS modular
└── config/                 # Configurações
```

### Convenções de Nomenclatura
- **Componentes**: PascalCase (ex: `UserProfile.jsx`)
- **Services**: camelCase + Service (ex: `registroService.js`)
- **Hooks**: camelCase com use (ex: `useFilteredRecord.js`)
- **Utils**: camelCase + Utils (ex: `timeUtils.js`)
- **Styles**: kebab-case com underscore (ex: `_dashboard-stats.scss`)

## 🎨 Sistema de Estilização

### SASS Modular Centralizado
- **Arquivos**: `styles/_component-name.scss`
- **Import**: Centralizado em `styles/main.scss`
- **Variáveis**: Definidas em `styles/_variables.scss`
- **NUNCA** importe SCSS diretamente nos componentes

### Padrão de Importação SCSS
```scss
// styles/main.scss
@use "variables";
@use "login";
@use "dashboard";
// ... outros componentes
```

### Theme System
- Suporte a **dark mode** com CSS custom properties
- Toggle de tema implementado
- Variáveis CSS dinâmicas para cores

## 🔧 Padrões de Código Obrigatórios

### Component Pattern
```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from 'antd';

const ComponentName = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState('');
  
  // Lógica do componente
  
  return (
    <Card className="component-name">
      {/* JSX */}
    </Card>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

export default ComponentName;
```

### Service Pattern
```javascript
// services/entityService.js
import { auth } from "../config/firebaseConfig";
import axios from "axios";

export async function fetchEntity() {
  const token = await auth.currentUser.getIdToken();
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/entity`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
```

### Context Pattern
```javascript
// context/EntityProvider.jsx
import { createContext, useContext, useState } from 'react';

const EntityContext = createContext();

export const EntityProvider = ({ children }) => {
  const [entity, setEntity] = useState(null);
  
  const value = { entity, setEntity };
  
  return (
    <EntityContext.Provider value={value}>
      {children}
    </EntityContext.Provider>
  );
};

// Hook personalizado
export const useEntity = () => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error('useEntity must be used within EntityProvider');
  }
  return context;
};
```

## 🔒 Sistema de Autenticação e Permissões

### Firebase Auth Integration
- Login via email/password
- Token JWT automático
- Persistent auth state
- Role-based access control

### Permission System
- Roles armazenados no Firestore collection "users"
- PrivateRoute component com `roleRequired` prop
- Context global para verificação de permissões

### Protected Routes Pattern
```javascript
<Route path="/admin/*" element={
  <PrivateRoute roleRequired="admin">
    <AdminComponent />
  </PrivateRoute>
} />
```

## 🌐 Comunicação com Backend

### Padrão Híbrido
1. **Firebase Auth**: Autenticação e tokens
2. **Firestore**: Dados em tempo real (registros, usuários)
3. **REST API**: Operações complexas (relatórios, uploads)
4. **Socket.IO**: Atualizações em tempo real

### API Communication
- Base URL: `import.meta.env.VITE_API_URL`
- Authorization: `Bearer ${firebaseToken}`
- Axios para requisições HTTP
- Firebase SDK para operações Firestore

### Real-time Updates
- Socket.IO client para atualizações live
- Integração com Dashboard para dados em tempo real
- Reconexão automática

## 📱 Responsividade e Acessibilidade

### Breakpoints
- Mobile: `max-width: 425px`
- Estratégia mobile-first nos estilos SASS
- Ant Design responsive grid system

### Dark Mode Support
- Toggle theme implementado
- CSS custom properties para cores dinâmicas
- Persistência de preferência do usuário

## 🚫 Restrições Importantes

### Não Faça
- ❌ **TypeScript**: Projeto usa JavaScript puro
- ❌ **Class Components**: Apenas function components
- ❌ **CSS-in-JS**: Use apenas SASS modular
- ❌ **Inline Styles**: Use classes CSS
- ❌ **console.log**: Remova antes do commit

### Padrões Obrigatórios
- ✅ **PropTypes** para validação
- ✅ **Function components** com hooks
- ✅ **SASS modular** centralizado
- ✅ **Ant Design** para novos componentes
- ✅ **ESLint** compliance

## 🔄 Features Específicas da Aplicação

### Sistema de Ponto
- Registro via Discord bot ou web
- Controle automático de pausas
- Cálculo de banco de horas
- Integração Firebase + Socket.IO

### Sistema de Justificativas
- Upload de arquivos
- Workflow de aprovação (admin)
- Integração com banco de horas
- Notificações por email

### Dashboard Administrativo
- Filtros avançados de registros
- Visualização de estatísticas
- Gestão de usuários e datas especiais
- Exportação de relatórios (PDF/CSV)

### Alertas e Notificações
- **SweetAlert2** para todos os alertas
- Componente centralizado: `components/common/ReactSwal.js`
- Configurações em: `components/common/alert.js`

## 🛠️ Desenvolvimento e Debugging

### Vite DevServer
- Hot reload automático
- Fast refresh para React
- Source maps habilitados
- Proxy configurado para backend

### ESLint Configuration
- Regras React 18.3
- React hooks compliance
- ES2020+ features
- Avisos para export components

### Estrutura de Build
- Assets otimizados
- Code splitting automático
- Minificação de CSS/JS
- Deploy via Vercel

---

## ⚡ Dicas para Desenvolvimento Eficiente

1. **Componentes**: Sempre inicie com estrutura base + PropTypes
2. **Estilos**: Crie arquivo SCSS e importe em main.scss
3. **Services**: Use padrão async/await com Firebase token
4. **Context**: Crie hook personalizado junto com Provider
5. **Rotas**: Use PrivateRoute para proteção automática
6. **Real-time**: Aproveite Socket.IO para atualizações live
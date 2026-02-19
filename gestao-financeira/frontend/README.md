# Frontend – Gestão Financeira Pessoal

Interface em **React 18 + TypeScript** (Vite) que consome a API do backend (Spring Boot). Login com JWT, dashboard, abas para Transações, Categorias e Relatórios, e exportação PDF/Excel.

## Pré-requisitos

- **Node.js 18+** e npm
- Backend rodando em **http://localhost:8080** (ou configure o proxy/ variável de ambiente)

## Instalação e execução

```bash
# Na pasta frontend
cd frontend

# Instalar dependências (só na primeira vez)
npm install

# Subir o servidor de desenvolvimento (porta 3000)
npm run dev
```

Acesse: **http://localhost:3000**

As requisições para `/api/*` são enviadas pelo Vite para o backend em `http://localhost:8080` (proxy no `vite.config.ts`).

## Scripts

| Comando | Descrição |
|--------|------------|
| `npm run dev` | Sobe o app em modo desenvolvimento (hot reload) |
| `npm run build` | Gera a build de produção na pasta `dist/` |
| `npm run preview` | Serve a pasta `dist/` localmente para testar a build |

## Estrutura principal

- **`src/api/client.ts`** – Cliente axios com interceptors (token JWT, tratamento 401).
- **`src/contexts/AuthContext.tsx`** – Estado global de autenticação (login, logout, token, usuário).
- **`src/pages/`** – Telas: Login, Registrar, Dashboard, Transacoes, Categorias, Relatorios.
- **`src/components/Layout.tsx`** – Layout com cabeçalho, abas de navegação e área do conteúdo.
- **`src/App.tsx`** – Rotas: rotas públicas (login/registro), rotas protegidas (layout com abas) e redirecionamentos.

## Fluxo de uso

1. **Registrar** ou **Entrar** (e-mail e senha) → o backend retorna o token JWT.
2. O token é guardado no `localStorage` e enviado no header `Authorization: Bearer <token>` em todas as chamadas à API.
3. **Dashboard** – Resumo do mês atual (entradas, saídas, saldo, por categoria, últimas transações).
4. **Categorias** – CRUD de categorias (necessário criar antes de cadastrar transações).
5. **Transações** – CRUD de entradas/saídas (data, valor, tipo, categoria, descrição).
6. **Relatórios** – Escolher ano/mês, ver resumo e exportar PDF ou Excel.

## Variáveis de ambiente (opcional)

Crie um arquivo `.env` na pasta `frontend` se quiser apontar para outro backend:

- `VITE_API_BASE` – URL base das requisições (ex.: `http://localhost:8080`). Se vazio, usa o mesmo host (proxy).
- `VITE_API_PREFIX` – Prefixo da API (padrão: `/api`).

Exemplo para backend em outra porta:

```env
VITE_API_BASE=http://localhost:8080
VITE_API_PREFIX=/api
```

Nesse caso, desative o proxy no `vite.config.ts` ou use a URL completa; o CORS precisa estar habilitado no backend.

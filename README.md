# Sistema de Pedidos e Clientes - Restaurante

Aplicativo web reativo para gerenciamento de clientes e emissão de cupons de pedido para restaurante, integrado com Supabase.

## Objetivo

- Cadastrar e atualizar clientes no banco de dados (nome, telefone, endereço)
- Buscar clientes por telefone para agilizar atendimentos
- Emitir cupons de pedido formatados para impressora Sweda SI-250 (80mm)
- Autenticação de usuários via Supabase Auth

## Tecnologias

- **React 18** — interface reativa
- **Vite** — build tool e dev server
- **Supabase** — banco de dados PostgreSQL + autenticação
- **Vercel** — hospedagem

## Estrutura do Projeto

```
rg-cadastro-cliente/
├── index.html              # Entry point HTML
├── package.json            # Dependências e scripts
├── vite.config.js          # Configuração do Vite
├── vercel.json             # Configuração para deploy no Vercel
├── .gitignore              # Arquivos ignorados pelo git
├── src/
│   ├── main.jsx            # Bootstrap do React
│   ├── index.css           # Estilos globais
│   ├── supabase.js         # Cliente Supabase
│   ├── App.jsx             # Componente principal + auth
│   └── pages/
│       ├── Login.jsx       # Tela de login/cadastro
│       └── Principal.jsx   # Tela principal (clientes + pedidos)
```

## Pré-requisitos

- **Node.js** v18+ (LTS recomendado)
- **npm** (vem junto com o Node.js)
- Conta no **Supabase** com projeto criado
- Conta no **Vercel** (para deploy)

## Instalação

### 1. Instalar Node.js

Baixe em: https://nodejs.org/en/download

Escolha a versão **LTS** (recomendada para produção).

### 2. Instalar dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 3. Configurar Supabase

1. Acesse https://supabase.com e crie um projeto
2. No painel do Supabase, vá em **SQL Editor** e execute:

```sql
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT UNIQUE NOT NULL,
  endereco TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Desativar RLS para permitir acesso público (ajuste conforme necessidade)
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
```

3. Vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon public` key

4. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
```

5. (Opcional) Para autenticação de usuários, vá em **Authentication > Providers** e habilite **Email**.

## Rodar Localmente

```bash
# Instalar dependências (apenas na primeira vez)
npm install

# Rodar servidor de desenvolvimento
npm run dev
```

Abra http://localhost:5173 no navegador.

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados ficam na pasta `dist/`.

## Deploy no Vercel

### Opção 1: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel
```

### Opção 2: Via GitHub

1. Faça push do projeto para um repositório GitHub
2. Acesse https://vercel.com
3. Clique em **"Add New Project"**
4. Importe o repositório
5. O Vercel detecta automaticamente o Vite e faz o build
6. Clique em **"Deploy"**

### Opção 3: Via Dashboard Vercel

1. Acesse https://vercel.com/new
2. Faça upload da pasta do projeto
3. O deploy é feito automaticamente

## Funcionalidades

### Tela de Login
- Login com email e senha
- Cadastro de novo usuário
- Logout

### Tela Principal — Clientes
- Cadastrar novo cliente (nome, telefone, endereço)
- Atualizar cliente existente (busca por telefone)
- Validação de campos obrigatórios

### Tela Principal — Pedido
- Buscar cliente por telefone (preenche dados automaticamente)
- Preencher nome, endereço, telefone e valor do pedido
- Selecionar status de pagamento (Pago / Cobrar no local)
- Imprimir cupom formatado para impressora térmica 80mm

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Rodar servidor de desenvolvimento (hot reload) |
| `npm run build` | Gerar build de produção na pasta `dist/` |
| `npm run preview` | Visualizar o build de produção localmente |

## Banco de Dados — Tabela `clientes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | Identificador único (auto-incremento) |
| `nome` | TEXT | Nome do cliente |
| `telefone` | TEXT | Telefone (único, usado como chave de busca) |
| `endereco` | TEXT | Endereço completo de entrega |
| `created_at` | TIMESTAMP | Data de criação do registro |

## Licença

MIT
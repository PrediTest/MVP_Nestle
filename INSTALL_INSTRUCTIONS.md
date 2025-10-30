# Instruções de Instalação - PrediTest AI (Aegis)

## 📦 Conteúdo do ZIP

O arquivo `preditest-ai-complete.zip` contém:

- ✅ Código-fonte completo (frontend React + backend Node.js)
- ✅ Configurações de banco de dados (Drizzle ORM)
- ✅ Scripts de seed de dados
- ✅ Documentação completa (README, API, Arquitetura)
- ✅ Resumo executivo e proposta técnica (PDF)
- ✅ Configurações de build (Vite, TypeScript)
- ✅ Arquivo `package.json` com todas as dependências

**NÃO inclui:**
- node_modules (será instalado via pnpm)
- .git (repositório)
- Arquivos de build (dist, build)
- Arquivos de ambiente (.env)

## 🚀 Passo a Passo de Instalação

### 1. Extrair o ZIP

```bash
unzip preditest-ai-complete.zip
cd preditest-ai
```

### 2. Instalar Dependências

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### 3. Configurar Banco de Dados

```bash
# Aplicar migrações
pnpm db:push

# (Opcional) Popular com dados de exemplo
npx tsx database/seeds/seed.ts
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em: **http://localhost:3000**

## 📋 Requisitos do Sistema

- **Node.js**: 22.0 ou superior
- **pnpm**: 8.0 ou superior
- **PostgreSQL**: 15 ou superior (ou usar banco gerenciado)
- **RAM**: Mínimo 2GB
- **Disco**: Mínimo 1GB livre

## 🔧 Variáveis de Ambiente

Antes de iniciar, você precisa configurar as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/preditest_ai

# JWT
JWT_SECRET=your-secret-key-here

# OAuth (Manus)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# App Configuration
VITE_APP_TITLE=PrediTest AI (Aegis)
VITE_APP_LOGO=https://your-logo-url.com/logo.png

# Built-in APIs (Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key

# Owner Information
OWNER_NAME=Nestlé Brasil
OWNER_OPEN_ID=your-owner-id

# Analytics (Opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## 📚 Documentação

Dentro do projeto você encontrará:

- **README.md** - Documentação técnica completa
- **docs/API.md** - Documentação da API tRPC
- **docs/ARCHITECTURE.md** - Arquitetura detalhada
- **EXECUTIVE_SUMMARY.md** - Resumo executivo (também em PDF)
- **TECHNICAL_PROPOSAL.md** - Proposta técnica (também em PDF)
- **INDEX.md** - Índice de toda documentação

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor de desenvolvimento

# Banco de Dados
pnpm db:push          # Aplicar migrações
pnpm db:generate      # Gerar migrações
pnpm db:studio        # Abrir Drizzle Studio (GUI)

# Build
pnpm build            # Build para produção
pnpm start            # Iniciar servidor de produção

# Testes
pnpm test             # Executar testes
pnpm test:ui          # Abrir UI de testes

# Linting
pnpm lint             # Verificar linting
pnpm format           # Formatar código
```

## 🐳 Usando Docker (Opcional)

Se preferir usar Docker:

```bash
# Build da imagem
docker build -t preditest-ai .

# Executar container
docker run -p 3000:3000 preditest-ai

# Ou usar Docker Compose
docker-compose up -d
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage
```

## 📊 Estrutura do Projeto

```
preditest-ai/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes React
│   │   ├── lib/           # Utilitários
│   │   └── index.css      # Estilos globais
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── _core/             # Core do framework
│   ├── routers.ts         # Routers tRPC
│   ├── db.ts              # Funções de BD
│   └── main.ts            # Entry point
│
├── drizzle/               # Schema e migrações
│   ├── schema.ts          # Definição de tabelas
│   └── migrations/        # Migrações SQL
│
├── database/              # Scripts de BD
│   └── seeds/             # Seeds de dados
│
├── docs/                  # Documentação
├── package.json           # Dependências
├── vite.config.ts         # Configuração Vite
├── tsconfig.json          # Configuração TypeScript
└── README.md              # Documentação técnica
```

## 🔐 Segurança

- Nunca commit `.env` ou arquivos com secrets
- Use variáveis de ambiente para configurações sensíveis
- Atualize dependências regularmente: `pnpm update`
- Revise as práticas de segurança em `docs/ARCHITECTURE.md`

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `docs/`
2. Verifique o `README.md` para troubleshooting
3. Entre em contato: innovation@nestle.com.br

## 🚀 Próximos Passos

1. ✅ Extrair e instalar o projeto
2. ✅ Configurar variáveis de ambiente
3. ✅ Executar migrações do BD
4. ✅ Iniciar servidor de desenvolvimento
5. ✅ Acessar http://localhost:3000
6. ✅ Explorar a aplicação
7. ✅ Ler a documentação técnica

## 📄 Versão

- **Versão**: 1.0.0
- **Data**: Outubro 2025
- **Status**: Pronto para Produção

---

**Desenvolvido com ❤️ para a Nestlé Brasil**

# PrediTest AI (Aegis)

**Plataforma de IA Preditiva para Testes Industriais - Nestlé Brasil**

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API](#api)
- [Banco de Dados](#banco-de-dados)
- [Deployment](#deployment)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O **PrediTest AI (Aegis)** é uma plataforma de inteligência artificial desenvolvida para prever e mitigar riscos em testes industriais de novos produtos nas fábricas da Nestlé Brasil. A solução analisa dados históricos de manufatura, reclamações de consumidores, standards Nestlé e externos (ISO, FDA), histórico de projetos e performance de linhas de produção para prever falhas, riscos e métricas de sucesso.

### Objetivos

- **Reduzir falhas críticas em 75%**
- **Reduzir reclamações pós-lançamento em 50%**
- **Reduzir downtime em 40%**
- **Economia anual estimada: R$ 3.002.500**
- **ROI: 38%**
- **Payback: 8,7 meses**

## ✨ Funcionalidades

### 1. Gestão de Projetos
- Cadastro e acompanhamento de projetos de lançamento
- Visualização de status (Planejamento, Em Teste, Concluído, Cancelado)
- Métricas de risco e probabilidade de sucesso

### 2. Análise Preditiva
- Scoring de riscos (0-100)
- Probabilidade de sucesso
- Identificação de fatores de falha
- Recomendações de mitigação
- Métricas de ML (F1-Score, AUC-ROC, Precision, Recall)

### 3. Dados de Manufatura
- Integração com linhas de produção
- Análise de downtime, eficiência e qualidade
- Monitoramento de taxa de defeitos
- Throughput de produção

### 4. Standards e Conformidade
- Banco de dados de standards Nestlé e externos (ISO, FDA)
- Análise de conformidade
- Detecção de desvios
- Versionamento de normas

### 5. Reclamações de Consumidores
- Análise de sentiment
- Clustering por categoria (sabor, textura, embalagem)
- Identificação de padrões
- Severidade e status de resolução

### 6. Sistema de Alertas
- Alertas em tempo real
- Classificação por tipo (risco, conformidade, qualidade, timeline)
- Níveis de severidade (info, warning, error, critical)
- Gerenciamento de status

### 7. Relatórios
- Geração de relatórios customizados
- Exportação em PDF, Excel, JSON
- Análise de performance
- Relatórios de conformidade

### 8. Dashboard Interativo
- Visualização de métricas em tempo real
- Gráficos e heatmaps
- KPIs estratégicos
- Visão executiva

## 🏗️ Arquitetura

### Arquitetura de Microservices

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│         React.js + TypeScript + Tailwind CSS            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                         │
│         FastAPI + tRPC + Express.js                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│    PostgreSQL (Relacional) + Redis (Cache)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                     │
│         Docker + Kubernetes + Auto-scaling               │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Ingestão**: APIs RESTful seguras para integração com SAP, MFC, CRM
2. **Pré-processamento**: Normalização e feature engineering
3. **Análise Preditiva**: Modelos de ML para scoring de riscos
4. **Outputs**: Dashboards, relatórios e alertas

## 🛠️ Tecnologias

### Frontend
- **React.js 18+** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Visualização de dados
- **tRPC** - Type-safe API calls
- **Wouter** - Roteamento

### Backend
- **Node.js 22** - Runtime
- **Express.js 4** - Web framework
- **tRPC 11** - Type-safe RPC
- **Drizzle ORM** - Database ORM
- **Zod** - Validação de schemas
- **JWT** - Autenticação

### Banco de Dados
- **PostgreSQL 15** - Banco relacional
- **Redis 7** - Cache e sessões

### DevOps
- **Docker** - Containerização
- **pnpm** - Gerenciador de pacotes
- **Git** - Controle de versão

### Segurança
- **OAuth 2.0** - Autenticação
- **JWT** - Tokens de sessão
- **Bcrypt** - Hash de senhas
- **HTTPS/TLS** - Criptografia

## 📦 Instalação

### Pré-requisitos

- Node.js 22+
- pnpm 8+
- PostgreSQL 15+
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <repository-url>
cd preditest-ai
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute as migrações do banco de dados**
```bash
pnpm db:push
```

5. **Popule o banco com dados de exemplo (opcional)**
```bash
npx tsx database/seeds/seed.ts
```

6. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

7. **Acesse a aplicação**
```
http://localhost:3000
```

## 🚀 Uso

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

### Banco de Dados

```bash
# Gerar migração
pnpm db:generate

# Aplicar migração
pnpm db:push

# Abrir Drizzle Studio
pnpm db:studio
```

## 📁 Estrutura do Projeto

```
preditest-ai/
├── client/                     # Frontend React
│   ├── public/                # Arquivos estáticos
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── ui/           # Componentes shadcn/ui
│   │   │   └── DashboardLayout.tsx
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Home.tsx
│   │   │   ├── Projects.tsx
│   │   │   └── NotFound.tsx
│   │   ├── lib/              # Utilitários
│   │   │   └── trpc.ts       # Cliente tRPC
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Entry point
│   └── package.json
│
├── server/                     # Backend Node.js
│   ├── _core/                 # Core do framework
│   ├── api/                   # Endpoints REST (se necessário)
│   ├── db.ts                  # Funções de banco de dados
│   ├── routers.ts             # Routers tRPC
│   └── main.ts                # Entry point do servidor
│
├── drizzle/                    # Schema e migrações
│   ├── schema.ts              # Definição de tabelas
│   └── migrations/            # Migrações SQL
│
├── database/                   # Scripts de banco
│   └── seeds/                 # Seeds de dados
│       └── seed.ts
│
├── shared/                     # Código compartilhado
│   └── const.ts               # Constantes
│
├── docs/                       # Documentação
│   ├── API.md                 # Documentação da API
│   └── ARCHITECTURE.md        # Arquitetura detalhada
│
├── docker-compose.yml          # Orquestração Docker
├── package.json               # Dependências
└── README.md                  # Este arquivo
```

## 🔌 API

### Endpoints tRPC

#### Projetos
- `projects.list` - Listar projetos do usuário
- `projects.listAll` - Listar todos os projetos
- `projects.getById` - Obter projeto por ID
- `projects.create` - Criar novo projeto
- `projects.update` - Atualizar projeto

#### Manufatura
- `manufacturing.listByProject` - Listar dados de manufatura por projeto
- `manufacturing.create` - Criar dados de manufatura

#### Standards
- `standards.list` - Listar todos os standards
- `standards.listByType` - Listar standards por tipo
- `standards.create` - Criar standard

#### Reclamações
- `complaints.list` - Listar todas as reclamações
- `complaints.listByProduct` - Listar reclamações por produto
- `complaints.create` - Criar reclamação

#### Predições
- `predictions.listByProject` - Listar predições por projeto
- `predictions.create` - Criar predição
- `predictions.generatePrediction` - Gerar predição automática

#### Alertas
- `alerts.listByProject` - Listar alertas por projeto
- `alerts.listActive` - Listar alertas ativos
- `alerts.create` - Criar alerta
- `alerts.acknowledge` - Reconhecer alerta

#### Relatórios
- `reports.listByProject` - Listar relatórios por projeto
- `reports.create` - Criar relatório

#### Autenticação
- `auth.me` - Obter usuário atual
- `auth.logout` - Fazer logout

## 🗄️ Banco de Dados

### Tabelas Principais

#### users
- Usuários do sistema
- Autenticação e perfis

#### projects
- Projetos de lançamento
- Status, riscos e probabilidades

#### manufacturingData
- Dados de manufatura
- Métricas de produção

#### standards
- Standards Nestlé e externos
- Normas ISO, FDA, etc.

#### complaints
- Reclamações de consumidores
- Sentiment e categorização

#### predictions
- Análises preditivas
- Scores e recomendações

#### alerts
- Sistema de alertas
- Severidade e status

#### reports
- Relatórios gerados
- Múltiplos formatos

### Diagrama ER

Ver arquivo `docs/ARCHITECTURE.md` para diagrama completo.

## 🚢 Deployment

### Docker

```bash
# Build da imagem
docker build -t preditest-ai .

# Executar container
docker run -p 3000:3000 preditest-ai
```

### Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar serviços
docker-compose down
```

### Variáveis de Ambiente de Produção

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://oauth.example.com
```

## 📊 Requisitos Não-Funcionais

- **Interface**: Português brasileiro
- **Escalabilidade**: Suporte até 1TB/mês de dados
- **Acurácia ML**: ≥85%
- **Uptime**: ≥99%
- **Segurança**: Criptografia AES-256, OAuth 2.0
- **Conformidade**: GDPR

## 🎯 Benefícios Esperados

| Métrica | Meta |
|---------|------|
| Redução de falhas críticas | 75% |
| Redução de reclamações pós-lançamento | 50% |
| Redução de downtime | 40% |
| Economia anual | R$ 3.002.500 |
| ROI | 38% |
| Payback | 8,7 meses |

## 📝 Cronograma de Implementação

### Fase 1: Kick-off (1 semana)
- Alinhamento de requisitos
- Setup de ambiente
- Definição de arquitetura

### Fase 2: Desenvolvimento (8 semanas)
- Sprint 1-2: Backend core + autenticação
- Sprint 3-4: Modelos ML + integração
- Sprint 5-6: Frontend + dashboards
- Sprint 7-8: Integrações e refinamentos

### Fase 3: Validação/PoC (4 semanas)
- Testes com dados reais
- Ajustes de acurácia
- Validação com stakeholders

### Fase 4: Rollout (4 semanas)
- Deployment em produção
- Treinamento de usuários
- Monitoramento inicial

### Fase 5: Suporte (5 semanas)
- Correção de bugs
- Otimizações
- Feedback loops

**Duração Total**: 5,5 meses

## 💰 Orçamento

- **Investimento Total**: R$ 2.180.000
- **Custos Humanos**: R$ 1.448.500
- **Infraestrutura**: R$ 144.000/mês
- **Licenças**: R$ 49.048
- **Margem Bruta**: 13,9%

## 🛡️ Garantias

- Acurácia ML ≥85%
- Disponibilidade ≥99%
- Correção de bugs em 90 dias
- Suporte técnico por 12 meses

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da Nestlé Brasil.

## 📞 Contato

**Centro de Inovação e Tecnologia - Nestlé Brasil**
- Email: innovation@nestle.com.br
- Parque de Inovação Tecnológica (PIT) - São José dos Campos, SP

---

**Desenvolvido com ❤️ para a Nestlé Brasil**


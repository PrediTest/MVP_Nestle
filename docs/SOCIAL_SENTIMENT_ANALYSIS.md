# Análise de Sentimento em Redes Sociais

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Plataformas Suportadas](#plataformas-suportadas)
5. [Banco de Dados](#banco-de-dados)
6. [API / Routers tRPC](#api--routers-trpc)
7. [Análise de Sentimento com LLM](#análise-de-sentimento-com-llm)
8. [Interface do Usuário](#interface-do-usuário)
9. [Como Usar](#como-usar)
10. [Integração com APIs Reais](#integração-com-apis-reais)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O módulo de **Análise de Sentimento em Redes Sociais** permite que a Nestlé monitore a aceitação do público em relação aos produtos que passaram por testes industriais. A solução coleta posts de múltiplas plataformas sociais e utiliza **inteligência artificial (LLM)** para analisar o sentimento, identificar palavras-chave, tópicos e emoções.

### Benefícios

- **Monitoramento em Tempo Real**: Acompanhe a reação do público imediatamente após o lançamento
- **Análise Multicanal**: Dados de Instagram, Facebook, TikTok, X (Twitter), Reclame Aqui e site da Nestlé
- **Inteligência Artificial**: Análise de sentimento precisa usando GPT-4
- **Insights Acionáveis**: Identifique problemas rapidamente e tome decisões baseadas em dados
- **Métricas Consolidadas**: Dashboard com visualizações claras e resumos executivos

---

## ⚡ Funcionalidades

### 1. Coleta de Posts

- Coleta automatizada de posts de 6 plataformas diferentes
- Filtragem por palavras-chave relacionadas ao produto
- Captura de métricas de engajamento (likes, comentários, compartilhamentos)
- Armazenamento estruturado no banco de dados

### 2. Análise de Sentimento

- Análise usando GPT-4 com prompts especializados
- Classificação em 5 níveis: Muito Positivo, Positivo, Neutro, Negativo, Muito Negativo
- Score numérico de -1 (muito negativo) a +1 (muito positivo)
- Confiança da análise (0-100%)
- Fallback para análise baseada em palavras-chave caso LLM falhe

### 3. Extração de Insights

- **Palavras-chave**: Termos mais mencionados nos posts
- **Tópicos**: Categorias identificadas (sabor, textura, embalagem, preço, qualidade)
- **Emoções**: Análise de alegria, tristeza, raiva, medo, surpresa
- **Idioma**: Detecção automática do idioma do post

### 4. Visualização de Dados

- Dashboard com métricas consolidadas
- Gráficos de distribuição de sentimentos
- Filtros por projeto e plataforma
- Lista de posts recentes com análise
- Top palavras-chave e tópicos

### 5. Resumos Agregados

- Resumos por projeto e plataforma
- Métricas históricas (diário, semanal, mensal)
- Tendências de sentimento ao longo do tempo
- Comparação entre plataformas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         SocialSentiment.tsx (Página)                 │   │
│  │  - Seleção de projeto e plataforma                   │   │
│  │  - Botão "Coletar e Analisar"                        │   │
│  │  - Dashboard de métricas                             │   │
│  │  - Gráficos de distribuição                          │   │
│  │  - Lista de posts                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + tRPC)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  sentiment Router (routers.ts)                       │   │
│  │  - listAccounts                                      │   │
│  │  - collectPosts                                      │   │
│  │  - analyzePosts                                      │   │
│  │  - collectAndAnalyzeAll                              │   │
│  │  - getSummary                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  socialMediaIntegration.ts                           │   │
│  │  - collectInstagramPosts()                           │   │
│  │  - collectFacebookPosts()                            │   │
│  │  - collectTikTokPosts()                              │   │
│  │  - collectTwitterPosts()                             │   │
│  │  - collectReclameAquiComplaints()                    │   │
│  │  - collectNestleSiteComments()                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  sentimentAnalyzer.ts                                │   │
│  │  - analyzeSentiment() → GPT-4                        │   │
│  │  - analyzeSentimentBatch()                           │   │
│  │  - calculateSentimentSummary()                       │   │
│  │  - fallbackSentimentAnalysis()                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Banco de Dados (PostgreSQL)                 │
│  - socialMediaAccounts                                       │
│  - socialMediaPosts                                          │
│  - sentimentAnalysis                                         │
│  - sentimentSummary                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Plataformas Suportadas

### 1. Instagram

- **API**: Instagram Graph API
- **Dados coletados**: Posts, Stories, Reels
- **Métricas**: Likes, Comentários, Compartilhamentos
- **Status**: Simulado (requer token de acesso para produção)

### 2. Facebook

- **API**: Facebook Graph API
- **Dados coletados**: Posts de páginas
- **Métricas**: Reações, Comentários, Compartilhamentos
- **Status**: Simulado (requer token de acesso para produção)

### 3. TikTok

- **API**: TikTok API
- **Dados coletados**: Vídeos
- **Métricas**: Likes, Comentários, Compartilhamentos
- **Status**: Simulado (requer token de acesso para produção)

### 4. X (Twitter)

- **API**: X API v2
- **Dados coletados**: Tweets, Retweets
- **Métricas**: Likes, Retweets, Respostas
- **Status**: Simulado (requer bearer token para produção)

### 5. Reclame Aqui

- **Método**: Web Scraping
- **Dados coletados**: Reclamações
- **Métricas**: Status, Resposta da empresa
- **Status**: Simulado (requer implementação de scraping)

### 6. Site Nestlé

- **Método**: Web Scraping
- **Dados coletados**: Comentários de produtos
- **Métricas**: Avaliações, Comentários
- **Status**: Simulado (requer implementação de scraping)

---

## 💾 Banco de Dados

### Tabela: `socialMediaAccounts`

Armazena contas de redes sociais monitoradas.

```sql
CREATE TABLE socialMediaAccounts (
  id VARCHAR(64) PRIMARY KEY,
  platform ENUM('instagram', 'facebook', 'tiktok', 'twitter', 'reclameaqui', 'nestle_site'),
  accountName VARCHAR(255) NOT NULL,
  accountUrl VARCHAR(500),
  isActive ENUM('yes', 'no') DEFAULT 'yes',
  lastSyncAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `socialMediaPosts`

Armazena posts coletados de redes sociais.

```sql
CREATE TABLE socialMediaPosts (
  id VARCHAR(64) PRIMARY KEY,
  accountId VARCHAR(64) NOT NULL,
  projectId VARCHAR(64),
  platform ENUM('instagram', 'facebook', 'tiktok', 'twitter', 'reclameaqui', 'nestle_site'),
  postId VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  content TEXT,
  url VARCHAR(500),
  likes VARCHAR(20),
  comments VARCHAR(20),
  shares VARCHAR(20),
  engagement VARCHAR(10),
  publishedAt TIMESTAMP,
  collectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `sentimentAnalysis`

Armazena análises de sentimento de posts.

```sql
CREATE TABLE sentimentAnalysis (
  id VARCHAR(64) PRIMARY KEY,
  postId VARCHAR(64) NOT NULL,
  projectId VARCHAR(64),
  sentiment ENUM('very_positive', 'positive', 'neutral', 'negative', 'very_negative'),
  sentimentScore VARCHAR(10),
  confidence VARCHAR(10),
  keywords TEXT,
  topics TEXT,
  emotions TEXT,
  language VARCHAR(10),
  modelVersion VARCHAR(50),
  analyzedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `sentimentSummary`

Armazena resumos agregados de sentimentos.

```sql
CREATE TABLE sentimentSummary (
  id VARCHAR(64) PRIMARY KEY,
  projectId VARCHAR(64) NOT NULL,
  platform ENUM('instagram', 'facebook', 'tiktok', 'twitter', 'reclameaqui', 'nestle_site', 'all'),
  period VARCHAR(20),
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  totalPosts VARCHAR(20),
  veryPositiveCount VARCHAR(20),
  positiveCount VARCHAR(20),
  neutralCount VARCHAR(20),
  negativeCount VARCHAR(20),
  veryNegativeCount VARCHAR(20),
  averageSentiment VARCHAR(10),
  totalEngagement VARCHAR(20),
  topKeywords TEXT,
  topTopics TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔌 API / Routers tRPC

### Router: `sentiment`

#### `listAccounts`

Lista todas as contas de redes sociais cadastradas.

```typescript
const accounts = await trpc.sentiment.listAccounts.useQuery();
```

#### `createAccount`

Cria uma nova conta de rede social para monitoramento.

```typescript
await trpc.sentiment.createAccount.mutate({
  id: "account_123",
  platform: "instagram",
  accountName: "@nestle",
  accountUrl: "https://instagram.com/nestle",
});
```

#### `collectPosts`

Coleta posts de uma plataforma específica.

```typescript
await trpc.sentiment.collectPosts.mutate({
  projectId: "project_123",
  platform: "instagram",
  accountName: "@nestle",
  keywords: ["chocolate", "leite", "Nestlé"],
  limit: 50,
});
```

#### `analyzePosts`

Analisa sentimento de posts coletados.

```typescript
await trpc.sentiment.analyzePosts.mutate({
  projectId: "project_123",
  postIds: ["post_1", "post_2"], // opcional
});
```

#### `collectAndAnalyzeAll`

Coleta e analisa posts de todas as plataformas configuradas.

```typescript
await trpc.sentiment.collectAndAnalyzeAll.mutate({
  projectId: "project_123",
  config: {
    instagram: {
      account: "nestle",
      keywords: ["chocolate", "Nestlé"],
    },
    facebook: {
      pageId: "nestle",
      keywords: ["chocolate"],
    },
    twitter: {
      query: "Nestlé chocolate",
    },
  },
  limit: 50,
});
```

#### `getSummary`

Obtém resumo de sentimentos de um projeto.

```typescript
const summary = await trpc.sentiment.getSummary.useQuery({
  projectId: "project_123",
});
```

#### `getPostsByProject`

Lista posts de um projeto.

```typescript
const posts = await trpc.sentiment.getPostsByProject.useQuery({
  projectId: "project_123",
});
```

---

## 🤖 Análise de Sentimento com LLM

### Modelo Utilizado

- **Modelo**: GPT-4 (via `invokeLLM`)
- **Prompt Especializado**: Contexto de produtos alimentícios da Nestlé
- **Formato de Resposta**: JSON estruturado com schema validado

### Estrutura da Análise

```typescript
interface SentimentResult {
  sentiment: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
  sentimentScore: number; // -1 a 1
  confidence: number; // 0 a 100
  keywords: string[];
  topics: string[];
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  language: string;
}
```

### Prompt do Sistema

```
Você é um especialista em análise de sentimento para produtos da Nestlé.
Analise o texto fornecido e retorne um JSON com:
- sentiment: classificação do sentimento
- sentimentScore: score numérico (-1 a 1)
- confidence: confiança da análise (0-100)
- keywords: palavras-chave relevantes
- topics: tópicos identificados (sabor, textura, embalagem, preço, qualidade)
- emotions: análise emocional (alegria, tristeza, raiva, medo, surpresa)
- language: código do idioma

Considere:
- Contexto de produtos alimentícios da Nestlé
- Gírias e expressões brasileiras
- Emojis e emoticons
- Sarcasmo e ironia
```

### Fallback

Caso o LLM falhe, o sistema utiliza análise baseada em palavras-chave:

- **Palavras Positivas**: ótimo, excelente, maravilhoso, delicioso, gostoso, amei, adorei
- **Palavras Negativas**: ruim, péssimo, horrível, nojento, terrível, odiei, detestei

---

## 🎨 Interface do Usuário

### Página: `SocialSentiment.tsx`

#### Seções

1. **Configuração**
   - Seletor de projeto
   - Seletor de plataforma
   - Botão "Coletar e Analisar"

2. **Resumo de Métricas**
   - Total de posts analisados
   - Sentimento médio
   - Posts positivos
   - Posts negativos

3. **Distribuição de Sentimentos**
   - Gráfico de barras horizontal
   - 5 categorias de sentimento
   - Percentuais e contagens

4. **Top Keywords e Topics**
   - Palavras-chave mais mencionadas
   - Tópicos principais identificados

5. **Lista de Posts**
   - Posts recentes com análise
   - Ícone da plataforma
   - Autor e data
   - Conteúdo do post
   - Métricas de engajamento

---

## 📖 Como Usar

### Passo 1: Selecionar Projeto

1. Acesse a página "Análise de Sentimento" no menu lateral
2. Selecione um projeto existente no dropdown

### Passo 2: Coletar e Analisar

1. Clique no botão "Coletar e Analisar"
2. O sistema irá:
   - Coletar posts de todas as plataformas
   - Analisar sentimento usando GPT-4
   - Calcular resumos e métricas
   - Salvar tudo no banco de dados

### Passo 3: Visualizar Resultados

1. Veja o resumo de métricas no topo
2. Analise a distribuição de sentimentos
3. Identifique palavras-chave e tópicos
4. Explore posts individuais

### Passo 4: Filtrar por Plataforma

1. Use o seletor de plataforma para filtrar
2. Veja apenas posts de uma plataforma específica

---

## 🔧 Integração com APIs Reais

### Instagram Graph API

1. Criar app no Facebook Developers
2. Obter token de acesso
3. Configurar permissões: `instagram_basic`, `instagram_content_publish`
4. Atualizar `collectInstagramPosts()` em `socialMediaIntegration.ts`

```typescript
export async function collectInstagramPosts(
  accountName: string,
  keywords: string[],
  limit: number = 50
): Promise<SocialMediaPost[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,timestamp,like_count,comments_count&access_token=${accessToken}`
  );
  const data = await response.json();
  // Processar e retornar posts
}
```

### Facebook Graph API

Similar ao Instagram, usar Facebook Graph API com token de acesso.

### X (Twitter) API v2

1. Criar app no Twitter Developer Portal
2. Obter bearer token
3. Configurar permissões de leitura
4. Atualizar `collectTwitterPosts()`

### Reclame Aqui (Web Scraping)

1. Usar Puppeteer ou Cheerio
2. Respeitar robots.txt
3. Implementar rate limiting
4. Tratar erros de scraping

---

## 🐛 Troubleshooting

### Problema: Posts não são coletados

**Solução:**
- Verificar se o projeto foi selecionado
- Verificar logs do servidor
- Confirmar que as APIs estão configuradas (atualmente simuladas)

### Problema: Análise de sentimento falha

**Solução:**
- Verificar se LLM está disponível
- Checar logs de erro
- Sistema usa fallback automático baseado em palavras-chave

### Problema: Métricas não aparecem

**Solução:**
- Aguardar conclusão da coleta e análise
- Recarregar a página
- Verificar se há posts no banco de dados

### Problema: Performance lenta

**Solução:**
- Reduzir limite de posts (padrão: 50)
- Analisar posts em lote menor
- Otimizar queries do banco de dados

---

## 📊 Métricas e KPIs

### Métricas Principais

- **Total de Posts**: Quantidade de posts coletados
- **Sentimento Médio**: Score médio (-1 a 1)
- **Taxa de Positividade**: % de posts positivos
- **Taxa de Negatividade**: % de posts negativos
- **Engajamento Total**: Soma de likes, comentários e compartilhamentos

### KPIs de Sucesso

- **Sentimento Médio > 0.3**: Produto bem aceito
- **Taxa de Positividade > 60%**: Boa aceitação
- **Taxa de Negatividade < 20%**: Poucos problemas
- **Confiança Média > 70%**: Análise precisa

---

## 🚀 Próximos Passos

1. **Integração Real com APIs**
   - Configurar tokens de acesso
   - Implementar autenticação OAuth
   - Testar coleta em produção

2. **Exportação de Relatórios**
   - Gerar PDF com análise completa
   - Exportar dados para Excel
   - Agendar relatórios automáticos

3. **Alertas Automáticos**
   - Notificar quando sentimento negativo > 30%
   - Alertar sobre picos de reclamações
   - Integrar com sistema de alertas existente

4. **Análise de Tendências**
   - Gráficos de linha temporal
   - Comparação entre períodos
   - Previsão de tendências

5. **Análise Competitiva**
   - Comparar com produtos concorrentes
   - Benchmarking de sentimento
   - Share of voice

---

**Versão**: 1.0.0 | **Data**: Novembro 2025 | **Status**: Implementado

Desenvolvido com ❤️ para a Nestlé Brasil


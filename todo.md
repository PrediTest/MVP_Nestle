# PrediTest AI - TODO

## ✅ Concluído

- [x] Configuração inicial do projeto
- [x] Schema do banco de dados
- [x] Routers tRPC (8 routers)
- [x] Frontend Dashboard
- [x] Página de Projetos
- [x] Sistema de autenticação OAuth
- [x] Documentação completa (README, API, ARCHITECTURE)
- [x] Guia de deployment (AWS, GCP, Azure)
- [x] Plano de UAT completo
- [x] Scripts de deployment automático

## 🔄 Em Progresso

## 📋 Pendente

### Análise de Sentimento em Redes Sociais

- [x] Atualizar schema do banco de dados com tabelas:
  - [x] socialMediaPosts (posts coletados)
  - [x] sentimentAnalysis (análises de sentimento)
  - [x] socialMediaAccounts (contas monitoradas)
  - [x] sentimentSummary (resumos agregados)
- [x] Criar funções de banco de dados em db.ts
- [x] Criar router tRPC para análise de sentimento
- [x] Implementar integração com APIs de redes sociais:
  - [x] Instagram API (simulado)
  - [x] Facebook Graph API (simulado)
  - [x] TikTok API (simulado)
  - [x] X (Twitter) API (simulado)
  - [x] Reclame Aqui scraping (simulado)
  - [x] Site Nestlé scraping (simulado)
- [x] Implementar análise de sentimento com LLM
- [x] Criar página frontend de análise de sentimento
- [x] Criar dashboard de sentimento
- [x] Adicionar gráficos de tendências
- [x] Implementar filtros por plataforma e período
- [x] Adicionar menu no DashboardLayout
- [ ] Adicionar exportação de relatórios
- [ ] Testes de integração
- [x] Documentação da nova funcionalidade



### Painel de Administração de Palavras-Chave e Tópicos

- [x] Criar tabela de keywords e topics no banco de dados
- [x] Adicionar funções de CRUD em db.ts
- [x] Criar router tRPC para gerenciamento
- [x] Criar página de administração no frontend
- [x] Implementar listagem de keywords/topics
- [x] Implementar criação de keywords/topics
- [x] Implementar edição de keywords/topics
- [x] Implementar exclusão de keywords/topics
- [x] Adicionar filtros e busca
- [x] Adicionar validação de formulários
- [x] Adicionar menu no DashboardLayout
- [ ] Documentar funcionalidade




### Sistema de Alertas de Sentimento Negativo

- [x] Criar tabela de alertas de sentimento no banco de dados
- [x] Adicionar funções de detecção de picos no db.ts
- [x] Criar serviço de monitoramento de sentimento
- [x] Implementar lógica de detecção de anomalias
- [x] Criar router tRPC para alertas
- [x] Integrar com sistema de notificações do owner
- [x] Criar página de alertas no frontend
- [x] Implementar notificações em tempo real
- [x] Adicionar configurações de threshold
- [x] Adicionar histórico de alertas
- [ ] Documentar funcionalidade




### Dashboard de Tendências de Alertas

- [x] Criar página de dashboard de alertas
- [x] Implementar gráfico de linha temporal de alertas
- [x] Adicionar gráfico de distribuição por severidade
- [x] Criar gráfico de alertas por plataforma
- [x] Implementar gráfico de alertas por tipo
- [x] Adicionar métricas agregadas (total, média, taxa de resolução)
- [x] Implementar filtros por período
- [x] Adicionar insights e recomendações automáticas
- [x] Criar visualização de tempo médio de resolução
- [x] Adicionar rota e menu no layout




### Comparação de Tendências de Sentimento entre Produtos

- [x] Criar página de comparação de produtos
- [x] Implementar seletor múltiplo de projetos (até 6 produtos)
- [x] Criar gráfico de linha comparativo de sentimento ao longo do tempo
- [x] Adicionar tabela comparativa de métricas
- [x] Implementar gráfico de barras comparativo de distribuição de sentimento
- [x] Criar visualização de palavras-chave mais mencionadas por produto
- [x] Adicionar gráfico radar multidimensional
- [x] Implementar filtros por período e plataforma
- [x] Criar exportação de relatório comparativo (CSV)
- [x] Adicionar insights automáticos da comparação
- [x] Adicionar rota e menu no layout


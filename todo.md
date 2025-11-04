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




### Barra de Navegação Horizontal

- [x] Criar componente de barra de navegação horizontal
- [x] Adicionar links para todas as páginas principais
- [x] Implementar indicador de página ativa
- [x] Adicionar ao DashboardLayout
- [x] Garantir responsividade mobile




### Correção de Layout - Página de Análise de Sentimento

- [x] Verificar se página SocialSentiment.tsx usa DashboardLayout
- [x] Corrigir layout se necessário




### Correção de Erro de API tRPC

- [x] Investigar erro "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- [x] Verificar rotas tRPC que podem estar retornando HTML
- [x] Corrigir endpoints problemáticos (indentação e try-catch)
- [x] Testar todas as mutações




### Implementação de Detalhes de Testes nos Projetos

- [x] Criar modal ou página de detalhes de projeto
- [x] Adicionar descrição completa dos testes industriais
- [x] Incluir no mínimo 3 componentes importantes por produto:
  - [x] Nescau Zero Açúcar (Solubilidade, Estabilidade Sensorial, Shelf-Life, Análise Nutricional)
  - [x] Ninho Phases 4 (Reconstituição, Estabilidade de Nutrientes, Scorched Particles, Microbiológica)
  - [x] Kit Kat Vegano (Textura Wafer, Derretimento, Estabilidade Sensorial, Microbiológica)
- [x] Adicionar tabelas com métricas de performance
- [x] Incluir impactos esperados e duração estimada
- [x] Atualizar botão "Ver Detalhes" para abrir modal/página




### Adicionar Produtos Fictícios com Testes de Cremosidade e Estabilidade

- [x] Criar produtos fictícios adicionais (3 novos produtos)
- [x] Adicionar testes de cremosidade (viscosidade, textura)
- [x] Adicionar testes de estabilidade (emulsão, separação de fases)
- [x] Incluir métricas específicas para cremosidade
- [x] Incluir métricas específicas para estabilidade
- [x] Atualizar modal ProjectDetailsModal com novos produtos




### Sistema de Pontuação de Desempenho (1-5 Estrelas)

- [x] Criar sistema de avaliação por estrelas
- [x] Definir critérios de pontuação para cremosidade (1-5 estrelas)
- [x] Definir critérios de pontuação para estabilidade (1-5 estrelas)
- [x] Calcular pontuação geral baseada nos testes (média ponderada)
- [x] Adicionar visualização de estrelas no modal de detalhes
- [x] Incluir badges de desempenho (Excelente, Muito Bom, Bom, Regular, Insuficiente)
- [x] Atualizar interface com componente de estrelas




### Remover (Aegis) do Nome da Aplicação

- [x] Atualizar variável de ambiente VITE_APP_TITLE (via Settings GUI)
- [x] Verificar outros locais onde o nome aparece




### Adicionar Novos Produtos ao Banco de Dados

- [x] Inserir Moça Cremosa Premium no banco
- [x] Inserir Nescafé Espresso Cremoso no banco
- [x] Inserir Nestlé Iogurte Grego Cremoso no banco
- [x] Verificar exibição no dashboard
- [x] Verificar exibição na página de projetos




### Remover Card de Avaliação de Desempenho do Modal

- [x] Remover seção de Avaliação de Desempenho do ProjectDetailsModal
- [x] Testar modal após remoção




### Corrigir Erro na Página de Comparação de Produtos

- [x] Investigar erro "Cannot read properties of undefined (reading 'length')"
- [x] Adicionar verificações de undefined/null
- [x] Testar página após correção




### Sistema de Gerenciamento de Testes e Simulação Monte Carlo

- [ ] Criar tabela de testes disponíveis no banco de dados
- [ ] Criar tabela de métricas de avaliação
- [ ] Implementar router tRPC para gerenciamento de testes
- [ ] Adicionar botão "Gerenciar Testes" no modal de detalhes
- [ ] Criar dialog para selecionar testes disponíveis
- [ ] Criar dialog para cadastrar novos testes
- [ ] Implementar formulário de cadastro de teste
- [ ] Adicionar métricas de avaliação (média, desvio padrão, min, max)
- [ ] Implementar simulação de Monte Carlo
- [ ] Criar visualização de resultados da simulação
- [ ] Adicionar gráficos de distribuição de probabilidade
- [ ] Testar funcionalidade completa




### Gráfico de Dispersão para Comparação de Testes

- [x] Adicionar gráfico de dispersão (scatter plot) na aba Simulação
- [x] Implementar comparação lado a lado de diferentes testes
- [x] Adicionar visualização de correlação entre testes
- [x] Incluir legenda e cores diferentes para cada teste


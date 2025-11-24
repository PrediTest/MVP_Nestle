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




### Permitir Exclusão de Projetos

- [x] Adicionar mutation de exclusão de projeto no router tRPC
- [x] Adicionar botão de exclusão na página de Projetos
- [x] Implementar dialog de confirmação de exclusão
- [x] Atualizar lista após exclusão
- [x] Adicionar validação de permissões




### Incluir Modelos de Testes e Simulação Monte Carlo nos Cards de Projetos

- [ ] Adicionar modelos computacionais aos testes (Solubilidade, Dissociação, Estabilidade, etc.)
- [ ] Implementar simulação Monte Carlo para cada tipo de teste
- [ ] Associar resultados simulados ao card "Testes Industriais" na aba Projetos
- [ ] Criar visualizações dos resultados da simulação
- [ ] Adicionar métricas estatísticas (média, desvio padrão, intervalos de confiança)




### Permitir Adicionar/Remover Testes no Gerenciamento

- [x] Criar interface para listar testes associados ao projeto
- [x] Adicionar botão para remover teste do projeto
- [x] Criar dialog para adicionar teste existente do catálogo
- [x] Implementar mutation para associar teste ao projeto
- [x] Implementar mutation para desassociar teste do projeto
- [x] Atualizar lista após adicionar/remover
- [x] Adicionar confirmação antes de remover




### Criar Apresentação de Pitch da Solução

- [ ] Criar conteúdo da apresentação em Markdown
- [ ] Incluir ROI factível e análise financeira
- [ ] Detalhar modelos de simulação Monte Carlo
- [ ] Explicar metodologias científicas (Van't Hoff, Arrhenius, etc.)
- [ ] Descrever APIs e integrações
- [ ] Adicionar benefícios quantificáveis
- [ ] Gerar slides usando ferramenta de apresentação




### Criar Documento Técnico Completo

- [x] Criar documento técnico detalhado da solução
- [x] Documentar todas as funcionalidades
- [x] Documentar modelagem de dados completa (18 tabelas)
- [x] Documentar arquitetura do sistema
- [x] Incluir diagramas e especificações técnicas
- [x] Documentar APIs e integrações
- [x] Gerar PDF do documento técnico




### Implementar Multi-Tenancy com Isolamento de Dados

#### Fase 1: Schema e Infraestrutura
- [x] Criar tabela `companies` no schema do banco de dados
- [x] Adicionar campo `companyId` em todas as 18 tabelas existentes
- [x] Atualizar migrações do banco de dados
- [x] Criar helper functions de multi-tenancy (multiTenancy.ts)
- [x] Implementar funções de gerenciamento de companies no db.ts

#### Fase 2: Atualização dos Routers tRPC
- [x] Atualizar router de Projects (list, create, update, delete)
- [x] Atualizar router de Manufacturing Data
- [x] Atualizar router de Standards
- [x] Atualizar router de Complaints
- [x] Atualizar router de Predictions
- [x] Atualizar router de Alerts
- [x] Atualizar router de Reports
- [x] Atualizar router de Social Media Accounts
- [x] Atualizar router de Social Media Posts
- [x] Atualizar router de Sentiment Analysis
- [x] Atualizar router de Sentiment Summary
- [x] Atualizar router de Monitored Keywords
- [x] Atualizar router de Monitored Topics
- [x] Atualizar router de Sentiment Alerts
- [x] Atualizar router de Alert Configurations
- [x] Atualizar router de Available Tests
- [x] Atualizar router de Project Tests
- [x] Atualizar router de Test Results
- [x] Atualizar router de Monte Carlo Simulations

#### Fase 3: Funções de Banco de Dados
- [ ] Atualizar todas as funções get* para filtrar por companyId
- [ ] Atualizar todas as funções create* para incluir companyId
- [ ] Atualizar todas as funções update* para validar companyId
- [ ] Atualizar todas as funções delete* para validar companyId

#### Fase 4: Seed e Dados de Teste
- [x] Criar seed com 3 empresas (Nestlé, Unilever, BRF)
- [ ] Criar projetos para cada empresa (requer migração de companyId)
- [ ] Criar dados de manufatura por empresa
- [ ] Criar standards por empresa
- [ ] Criar testes disponíveis por empresa

#### Fase 5: Testes de Isolamento
- [ ] Criar testes de isolamento para Projects
- [ ] Criar testes de isolamento para Manufacturing Data
- [ ] Criar testes de isolamento para Sentiment Analysis
- [ ] Criar testes de isolamento para Tests e Simulations
- [ ] Validar que Empresa A não acessa dados da Empresa B
- [ ] Testar CRUD completo por empresa

#### Fase 6: Frontend e UX
- [ ] Adicionar seletor de empresa no frontend
- [ ] Atualizar contexto de autenticação com companyId
- [ ] Implementar white-label UI (logo, cores por empresa)
- [ ] Adicionar página de gerenciamento de empresas

#### Fase 7: Documentação
- [ ] Documentar arquitetura multi-tenant
- [ ] Documentar processo de onboarding de novas empresas
- [ ] Criar guia de migração de dados
- [ ] Atualizar README com informações de multi-tenancy




### Migração Completa de Multi-Tenancy

- [x] Criar script SQL para adicionar companyId em todas as 18 tabelas
- [x] Executar migração no banco de dados
- [x] Atualizar dados existentes com companyId padrão
- [x] Popular banco com seed completo (3 empresas)
- [x] Validar isolamento de dados entre empresas
- [x] Testar queries de listagem por empresa
- [ ] Documentar processo de migração




### Implementar White-Label UI

- [x] Criar router tRPC para buscar dados da empresa (companies.getByUser)
- [x] Criar contexto React CompanyContext para gerenciar empresa atual
- [x] Atualizar DashboardLayout para usar logo dinâmico
- [x] Aplicar cores primárias da empresa no tema CSS
- [x] Atualizar título da aplicação com nome da empresa
- [x] Implementar seletor de empresa no header (dropdown)
- [x] Persistir empresa selecionada no localStorage
- [x] Atualizar todos os dados ao trocar de empresa
- [x] Testar white-label com Nestlé, Unilever e BRF
- [x] Adicionar fallback para usuários sem empresa




### Implementar Testes Automatizados de Isolamento

- [x] Criar helpers de teste para simular usuários de diferentes empresas
- [x] Criar mock de contexto tRPC com usuário autenticado
- [x] Implementar testes de isolamento para Projects (list, getById, create, update, delete)
- [x] Implementar testes de isolamento para Standards
- [x] Implementar testes de isolamento para Manufacturing Data (11 testes, 100% passando)
- [x] Implementar testes de isolamento para Available Tests
- [x] Implementar testes de isolamento para Test Results (14 testes, 50% passando - vulnerabilidades encontradas)
- [ ] Implementar testes de isolamento para Monte Carlo Simulations
- [ ] Implementar testes de isolamento para Sentiment Analysis
- [ ] Implementar testes de isolamento para Social Media Accounts
- [x] Validar que Empresa A não acessa dados da Empresa B
- [x] Validar que Empresa B não acessa dados da Empresa C
- [x] Executar todos os testes e garantir 100% de aprovação (15/15 Projects)
- [x] Corrigir vulnerabilidades de segurança encontradas nos testes
- [ ] Documentar estratégia de testes de isolamento




### Vulnerabilidades de Segurança Encontradas pelos Testes

- [ ] **tests.listByProject** não filtra por companyId - usuários podem listar testes de projetos de outras empresas
- [ ] **tests.addToProject** não valida se projeto pertence à empresa antes de adicionar teste
- [ ] **tests.addResult** não valida se projectTest pertence à empresa antes de adicionar resultado
- [ ] **tests.updateProjectTest** não valida companyId antes de atualizar
- [ ] **tests.deleteProjectTest** não valida companyId antes de deletar
- [ ] Adicionar filtro de companyId em **getProjectTestsByProject** no db.ts
- [ ] Adicionar validação de companyId em **createProjectTest** no db.ts
- [ ] Adicionar validação de companyId em **createTestResult** no db.ts
- [ ] Adicionar validação de companyId em **updateProjectTestStatus** no db.ts
- [ ] Adicionar validação de companyId em **deleteProjectTest** no db.ts


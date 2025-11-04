# Template de Execução de Testes - UAT

## 📋 Informações Gerais

| Item | Valor |
|------|-------|
| **Projeto** | PrediTest AI (Aegis) |
| **Versão** | 1.0.0 |
| **Data de Execução** | [Data] |
| **Testador** | [Nome] |
| **Ambiente** | Produção (UAT) |
| **Navegador** | [Chrome/Firefox/Safari] |
| **SO** | [Windows/Mac/Linux] |

---

## 🧪 Execução de Testes

### Módulo: Autenticação

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-AUTH-001 | Login com credenciais válidas | Usuário não autenticado | 1. Acessar login<br>2. Inserir email<br>3. Inserir senha<br>4. Clicar Entrar | Usuário autenticado, redirecionado para dashboard | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-AUTH-002 | Login com credenciais inválidas | Usuário não autenticado | 1. Acessar login<br>2. Inserir email inválido<br>3. Inserir senha inválida<br>4. Clicar Entrar | Mensagem de erro, usuário não autenticado | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-AUTH-003 | Logout | Usuário autenticado | 1. Clicar menu usuário<br>2. Clicar Sair | Sessão encerrada, redirecionado para login | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-AUTH-004 | Acesso negado sem autenticação | Usuário não autenticado | 1. Acessar URL protegida | Redirecionado para login | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Projetos

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-PROJ-001 | Criar novo projeto | Usuário autenticado | 1. Navegar Projetos<br>2. Clicar Novo<br>3. Preencher formulário<br>4. Salvar | Projeto criado, exibido na lista | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-PROJ-002 | Editar projeto | Projeto existente | 1. Navegar Projetos<br>2. Clicar projeto<br>3. Clicar Editar<br>4. Alterar dados<br>5. Salvar | Alterações salvas, dados atualizados | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-PROJ-003 | Deletar projeto | Projeto existente | 1. Navegar Projetos<br>2. Clicar projeto<br>3. Clicar Deletar<br>4. Confirmar | Projeto removido da lista | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Dashboard

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-DASH-001 | Carregar dashboard | Usuário autenticado | 1. Fazer login<br>2. Acessar dashboard | Dashboard carrega em < 2s, métricas exibidas | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-DASH-002 | Visualizar métricas | Dashboard aberto | 1. Observar cards de métricas | Todos os cards com dados corretos | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-DASH-003 | Visualizar gráficos | Dashboard aberto | 1. Observar gráficos | Gráficos renderizam corretamente | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Dados de Manufatura

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-DATA-001 | Registrar dados | Projeto ativo | 1. Navegar projeto<br>2. Clicar Adicionar<br>3. Preencher formulário<br>4. Salvar | Dados registrados, exibidos em gráficos | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-DATA-002 | Editar dados | Dados existentes | 1. Selecionar registro<br>2. Clicar Editar<br>3. Alterar valores<br>4. Salvar | Dados atualizados | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-DATA-003 | Deletar dados | Dados existentes | 1. Selecionar registro<br>2. Clicar Deletar<br>3. Confirmar | Dados removidos | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Alertas

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-ALERT-001 | Gerar alerta automático | Dados com risco | 1. Registrar dados com risco > 2% | Alerta criado automaticamente | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-ALERT-002 | Visualizar alertas | Alertas existentes | 1. Navegar Alertas<br>2. Observar lista | Todos os alertas exibidos | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-ALERT-003 | Resolver alerta | Alerta aberto | 1. Clicar alerta<br>2. Clicar Resolver<br>3. Confirmar | Alerta marcado como resolvido | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Relatórios

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-REPORT-001 | Gerar relatório | Projeto com dados | 1. Navegar Relatórios<br>2. Selecionar projeto<br>3. Clicar Gerar<br>4. Aguardar | Relatório gerado em PDF, download automático | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-REPORT-002 | Visualizar relatório | Relatório gerado | 1. Abrir PDF<br>2. Verificar conteúdo | PDF contém gráficos e métricas corretas | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Performance

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-PERF-001 | Tempo carregamento dashboard | Usuário autenticado | 1. Medir tempo de carregamento | Carrega em < 2 segundos | [Tempo: __ms] | [ ] PASS [ ] FAIL | [Notas] |
| TC-PERF-002 | Tempo carregamento projetos | Usuário autenticado | 1. Medir tempo de carregamento | Carrega em < 2 segundos | [Tempo: __ms] | [ ] PASS [ ] FAIL | [Notas] |
| TC-PERF-003 | Tempo geração relatório | Projeto com dados | 1. Medir tempo de geração | Gera em < 10 segundos | [Tempo: __s] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Segurança

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-SEC-001 | SQL Injection | Formulário de busca | 1. Inserir: ' OR '1'='1<br>2. Executar | Entrada sanitizada, sem acesso | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-SEC-002 | XSS | Campo de texto | 1. Inserir: <script>alert('XSS')</script><br>2. Salvar | Script não executado | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-SEC-003 | Acesso não autorizado | Usuário com permissão limitada | 1. Tentar acessar dados de outro usuário | Acesso negado | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

### Módulo: Usabilidade

| TC-ID | Descrição | Pré-Condição | Passos | Resultado Esperado | Resultado Observado | Status | Notas |
|-------|-----------|--------------|-------|-------------------|-------------------|--------|-------|
| TC-UX-001 | Navegação intuitiva | Usuário novo | 1. Executar tarefa comum | Completa em < 2 minutos | [Tempo: __min] | [ ] PASS [ ] FAIL | [Notas] |
| TC-UX-002 | Responsividade desktop | Desktop 1920x1080 | 1. Verificar layout | Layout adapta corretamente | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |
| TC-UX-003 | Responsividade mobile | Mobile 375x667 | 1. Verificar layout | Layout adapta corretamente | [Resultado] | [ ] PASS [ ] FAIL | [Notas] |

---

## 📊 Resumo de Resultados

### Por Módulo

| Módulo | Total | Passados | Falhados | Taxa Sucesso |
|--------|-------|----------|----------|--------------|
| Autenticação | 4 | [ ] | [ ] | [ ]% |
| Projetos | 3 | [ ] | [ ] | [ ]% |
| Dashboard | 3 | [ ] | [ ] | [ ]% |
| Dados | 3 | [ ] | [ ] | [ ]% |
| Alertas | 3 | [ ] | [ ] | [ ]% |
| Relatórios | 2 | [ ] | [ ] | [ ]% |
| Performance | 3 | [ ] | [ ] | [ ]% |
| Segurança | 3 | [ ] | [ ] | [ ]% |
| Usabilidade | 3 | [ ] | [ ] | [ ]% |
| **TOTAL** | **31** | **[ ]** | **[ ]** | **[ ]%** |

### Defeitos Encontrados

| ID | Título | Severidade | Status | Responsável |
|----|--------|-----------|--------|------------|
| [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | [ ] | [ ] | [ ] | [ ] |

---

## ✅ Checklist Final

- [ ] Todos os testes executados
- [ ] Todos os resultados documentados
- [ ] Todos os defeitos reportados
- [ ] Evidências (screenshots) anexadas
- [ ] Performance dentro dos limites
- [ ] Segurança validada
- [ ] Usabilidade aprovada
- [ ] Relatório final preparado

---

## ✍️ Assinatura

| Item | Assinatura | Data |
|------|-----------|------|
| Testador | _____________ | _______ |
| Líder Testes | _____________ | _______ |
| Gerente Projeto | _____________ | _______ |

---

**Data de Execução**: ________________
**Ambiente**: Produção (UAT)
**Navegador**: ________________
**SO**: ________________
**Observações Gerais**: ________________________________________________________________

Desenvolvido com ❤️ para a Nestlé Brasil


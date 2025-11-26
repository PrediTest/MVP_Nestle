# 🚀 CI/CD Pipeline - GitHub Actions

**Pipeline automatizado** para executar testes, linting e build a cada commit/PR no repositório PrediTest AI.

---

## 📋 Workflows Implementados

### 1. **Test Job** - Testes Automatizados
- ✅ Executa `pnpm test` em cada push/PR
- ✅ Node.js 22.x com cache pnpm
- ✅ 93 testes automatizados (multi-tenancy + companies.admin)
- ✅ Upload de coverage para Codecov (opcional)
- ✅ Variáveis de ambiente injetadas via GitHub Secrets

### 2. **Lint Job** - Qualidade de Código
- ✅ Executa `pnpm lint` (ESLint)
- ✅ Valida padrões de código TypeScript/React
- ✅ Continue-on-error (não bloqueia merge)

### 3. **Build Job** - Compilação
- ✅ Executa `pnpm build`
- ✅ Garante que o projeto compila sem erros
- ✅ Upload de artifacts (dist/) com retenção de 7 dias
- ✅ Todas as variáveis de ambiente necessárias

---

## 🔧 Configuração no GitHub

### Passo 1: Adicionar Secrets

Acesse **Settings → Secrets and variables → Actions** e adicione:

```
DATABASE_URL=mysql://...
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=owner-id
OWNER_NAME=Owner Name
VITE_APP_TITLE=PrediTest AI
VITE_APP_LOGO=https://...
BUILT_IN_FORGE_API_URL=https://...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
VITE_ANALYTICS_WEBSITE_ID=...
VITE_ANALYTICS_ENDPOINT=...
CODECOV_TOKEN=... (opcional)
```

### Passo 2: Ativar Branch Protection

Acesse **Settings → Branches → Add branch protection rule**:

**Branch name pattern:** `main`

✅ **Require a pull request before merging**
- Require approvals: 1
- Dismiss stale pull request approvals when new commits are pushed

✅ **Require status checks to pass before merging**
- Require branches to be up to date before merging
- Status checks required:
  - `test`
  - `build`
  - (opcional) `lint`

✅ **Require conversation resolution before merging**

✅ **Do not allow bypassing the above settings**

### Passo 3: Adicionar Badge no README

Adicione no topo do `README.md`:

```markdown
# PrediTest AI (Aegis)

![CI/CD Pipeline](https://github.com/SEU-USUARIO/preditest-ai/actions/workflows/ci.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-93%20passing-brightgreen)
![Coverage](https://img.shields.io/codecov/c/github/SEU-USUARIO/preditest-ai)

Sistema de análise preditiva de testes industriais para a indústria alimentícia.
```

---

## 🎯 Fluxo de Trabalho

### Desenvolvedor cria PR:
1. Push código para branch `feature/nova-funcionalidade`
2. Abre Pull Request para `main`
3. GitHub Actions executa automaticamente:
   - ✅ Test Job (93 testes)
   - ✅ Lint Job (ESLint)
   - ✅ Build Job (compilação)
4. Se **todos os jobs passarem** → PR pode ser merged
5. Se **algum job falhar** → PR bloqueado até correção

### Merge para main:
1. PR aprovado e merged
2. GitHub Actions executa novamente em `main`
3. Artifacts de build disponíveis para download
4. Coverage report enviado para Codecov

---

## 📊 Monitoramento

### Ver status dos workflows:
1. Acesse **Actions** no repositório GitHub
2. Veja histórico de execuções
3. Clique em uma execução para ver logs detalhados
4. Download de artifacts (dist/) disponível

### Badges de status:
- **CI/CD Pipeline:** Verde = todos os jobs passando
- **Tests:** Mostra número de testes passando
- **Coverage:** Percentual de cobertura de código

---

## 🐛 Troubleshooting

### Testes falhando no CI mas passando localmente:
- Verificar se todas as variáveis de ambiente estão configuradas nos Secrets
- Verificar se o banco de dados de teste está acessível
- Verificar se as dependências estão atualizadas (`pnpm install`)

### Build falhando:
- Verificar erros de TypeScript (`pnpm tsc --noEmit`)
- Verificar se todas as variáveis VITE_* estão configuradas
- Verificar logs detalhados no GitHub Actions

### Lint falhando:
- Executar `pnpm lint --fix` localmente
- Commit e push das correções
- Lint não bloqueia merge (continue-on-error: true)

---

## 🔄 Atualizações Futuras

- [ ] Adicionar job de deploy automático (staging/production)
- [ ] Adicionar job de testes E2E (Playwright/Cypress)
- [ ] Adicionar job de análise de segurança (Snyk/Dependabot)
- [ ] Adicionar job de performance testing
- [ ] Integrar com Slack/Discord para notificações

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Codecov Integration](https://docs.codecov.com/docs/quick-start)
- [pnpm CI Setup](https://pnpm.io/continuous-integration)

# Próximas Implementações - PrediTest AI

**Status Atual:** Backend companies.admin 100% implementado + 27 testes automatizados (100% aprovação)  
**Data:** 25 de novembro de 2025

---

## 📋 Tarefas Pendentes

### 1. Frontend `/admin/companies` (Prioridade ALTA)

**Objetivo:** Criar interface administrativa completa para gerenciamento de empresas.

**Arquivos a criar:**

1. `client/src/pages/admin/Companies.tsx` - Página principal
2. `client/src/components/admin/CompanyModal.tsx` - Modal de criar/editar
3. `client/src/components/admin/CompanyStatsCard.tsx` - Card de estatísticas

**Código completo disponível em:** `docs/FASE_1_1_ADMIN_PANEL.md` (linhas 70-500)

**Passos:**

```bash
# 1. Criar diretórios
mkdir -p client/src/pages/admin client/src/components/admin

# 2. Copiar código da documentação para os 3 arquivos

# 3. Adicionar rota no App.tsx
# Importar: import CompaniesAdmin from "@/pages/admin/Companies";
# Adicionar: <Route path="/admin/companies" component={CompaniesAdmin} />

# 4. Adicionar link no DashboardLayout.tsx (apenas para admins)
# {
#   name: "Empresas",
#   href: "/admin/companies",
#   icon: Building2,
#   adminOnly: true,
# }

# 5. Testar CRUD completo via interface
```

**Validação:**
- ✅ Admin pode criar empresa
- ✅ Admin pode editar empresa
- ✅ Admin pode desativar empresa (soft delete)
- ✅ Admin pode ver estatísticas
- ✅ Usuário comum NÃO vê link "Empresas" no menu

---

### 2. CI/CD Pipeline GitHub Actions (Prioridade ALTA)

**Objetivo:** Automatizar testes em cada commit e bloquear merges com falhas.

**Arquivo a criar:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [22.x]

    steps:
    - name: Checkout código
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'

    - name: Instalar pnpm
      run: npm install -g pnpm

    - name: Instalar dependências
      run: pnpm install

    - name: Executar testes
      run: pnpm test
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        JWT_SECRET: ${{ secrets.JWT_SECRET }}

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      if: success()
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        files: ./coverage/coverage-final.json
        flags: unittests
        name: codecov-umbrella

  lint:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout código
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 22.x
        cache: 'pnpm'

    - name: Instalar pnpm
      run: npm install -g pnpm

    - name: Instalar dependências
      run: pnpm install

    - name: Executar linter
      run: pnpm lint

  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout código
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 22.x
        cache: 'pnpm'

    - name: Instalar pnpm
      run: npm install -g pnpm

    - name: Instalar dependências
      run: pnpm install

    - name: Build projeto
      run: pnpm build
```

**Configuração de Branch Protection:**

1. Acessar GitHub → Settings → Branches
2. Adicionar regra para `main` e `develop`:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Selecionar checks: `test`, `lint`, `build`
   - ✅ Require pull request reviews before merging (1 aprovação)

**Badge de Status:**

Adicionar no `README.md`:

```markdown
![Tests](https://github.com/seu-usuario/preditest-ai/actions/workflows/test.yml/badge.svg)
```

---

### 3. Testes de Isolamento Multi-Tenant para Admin (Prioridade MÉDIA)

**Objetivo:** Validar que admin da Empresa A não pode modificar Empresa B/C.

**Arquivo a criar:** `server/companies.admin.isolation.test.ts`

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

/**
 * Testes de Isolamento Multi-Tenant para companies.admin
 * 
 * Valida que:
 * - Admin da Empresa A não pode modificar Empresa B
 * - Admin da Empresa A não pode deletar Empresa B
 * - Admin da Empresa A não pode ver stats da Empresa B (futuro)
 */

// Helper para criar contexto de admin da Empresa A
function createAdminCompanyA(): TrpcContext {
  return {
    user: {
      id: "admin_company_a",
      name: "Admin Empresa A",
      email: "admin@empresa-a.com",
      role: "admin",
      companyId: "company_a",
    },
    req: {} as any,
    res: {} as any,
  };
}

// Helper para criar contexto de admin da Empresa B
function createAdminCompanyB(): TrpcContext {
  return {
    user: {
      id: "admin_company_b",
      name: "Admin Empresa B",
      email: "admin@empresa-b.com",
      role: "admin",
      companyId: "company_b",
    },
    req: {} as any,
    res: {} as any,
  };
}

describe("companies.admin - Isolamento Multi-Tenant", () => {
  let companyAId: string;
  let companyBId: string;

  beforeAll(async () => {
    // Criar empresas de teste
    const callerA = appRouter.createCaller(createAdminCompanyA());
    const callerB = appRouter.createCaller(createAdminCompanyB());

    companyAId = `company_test_a_${Date.now()}`;
    companyBId = `company_test_b_${Date.now()}`;

    await callerA.companies.admin.create({
      id: companyAId,
      name: "Empresa Test A",
      industry: "food",
    });

    await callerB.companies.admin.create({
      id: companyBId,
      name: "Empresa Test B",
      industry: "beverage",
    });
  });

  it("Admin Empresa A NÃO pode atualizar Empresa B", async () => {
    const callerA = appRouter.createCaller(createAdminCompanyA());

    // Tentar atualizar empresa B com admin da empresa A
    await expect(
      callerA.companies.admin.update({
        id: companyBId,
        name: "Empresa B Hackeada",
      })
    ).rejects.toThrow("Empresa não encontrada");
  });

  it("Admin Empresa A NÃO pode deletar Empresa B", async () => {
    const callerA = appRouter.createCaller(createAdminCompanyA());

    // Tentar deletar empresa B com admin da empresa A
    await expect(
      callerA.companies.admin.delete({ id: companyBId })
    ).rejects.toThrow("Empresa não encontrada");
  });

  it("Admin Empresa A NÃO pode ver stats da Empresa B", async () => {
    const callerA = appRouter.createCaller(createAdminCompanyA());

    // Tentar ver stats da empresa B com admin da empresa A
    await expect(
      callerA.companies.admin.getStats({ companyId: companyBId })
    ).rejects.toThrow("Empresa não encontrada");
  });

  it("Admin Empresa A pode atualizar sua própria empresa", async () => {
    const callerA = appRouter.createCaller(createAdminCompanyA());

    await callerA.companies.admin.update({
      id: companyAId,
      name: "Empresa A Atualizada",
    });

    const companies = await callerA.companies.admin.listAll();
    const updated = companies.find((c) => c.id === companyAId);

    expect(updated?.name).toBe("Empresa A Atualizada");
  });

  it("Admin Empresa B pode atualizar sua própria empresa", async () => {
    const callerB = appRouter.createCaller(createAdminCompanyB());

    await callerB.companies.admin.update({
      id: companyBId,
      name: "Empresa B Atualizada",
    });

    const companies = await callerB.companies.admin.listAll();
    const updated = companies.find((c) => c.id === companyBId);

    expect(updated?.name).toBe("Empresa B Atualizada");
  });

  it("listAll() retorna apenas empresas visíveis ao admin", async () => {
    const callerA = appRouter.createCaller(createAdminCompanyA());

    const companies = await callerA.companies.admin.listAll();

    // Admin da Empresa A deve ver apenas Empresa A
    const canSeeA = companies.some((c) => c.id === companyAId);
    const canSeeB = companies.some((c) => c.id === companyBId);

    expect(canSeeA).toBe(true);
    expect(canSeeB).toBe(false); // NÃO deve ver Empresa B
  });
});
```

**IMPORTANTE:** Este teste assume que você vai modificar o router `companies.admin` para filtrar por `companyId` do admin logado. Atualmente, o router permite que qualquer admin veja todas as empresas (super admin).

**Decisão de Design:**

Você precisa decidir:
- **Opção A:** Admin vê apenas sua própria empresa (multi-tenant estrito)
- **Opção B:** Admin vê todas as empresas (super admin global)

Se escolher Opção A, modifique `companies.admin.listAll()`:

```typescript
listAll: adminProcedure.query(async ({ ctx }) => {
  const db = await getDb();
  if (!db) return [];

  // Filtrar por companyId do admin logado
  const companies = await db.getAllCompanies();
  return companies.filter((c) => c.id === ctx.user.companyId);
}),
```

---

### 4. Gerar Hash INPI para Registro de Propriedade Intelectual (Prioridade BAIXA)

**Objetivo:** Criar hash SHA-256 da plataforma para registro no INPI (Instituto Nacional da Propriedade Industrial).

**Arquivo a criar:** `scripts/generate-inpi-hash.ts`

```typescript
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

/**
 * Gera hash SHA-256 da plataforma PrediTest AI para registro INPI
 * 
 * Inclui:
 * - Código-fonte (server/, client/, shared/)
 * - Arquitetura (docs/)
 * - Schemas de banco de dados (drizzle/)
 * - Configurações (package.json, tsconfig.json)
 */

interface FileHash {
  path: string;
  hash: string;
  size: number;
}

function generateFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Ignorar node_modules, .git, dist, etc.
      if (
        !file.startsWith(".") &&
        file !== "node_modules" &&
        file !== "dist" &&
        file !== "build" &&
        file !== "coverage"
      ) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // Incluir apenas arquivos de código
      if (
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js") ||
        file.endsWith(".jsx") ||
        file.endsWith(".json") ||
        file.endsWith(".md") ||
        file.endsWith(".sql")
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function generateINPIHash() {
  const projectRoot = path.resolve(__dirname, "..");
  const timestamp = new Date().toISOString();

  console.log("🔐 Gerando Hash INPI para PrediTest AI...\n");

  // 1. Obter todos os arquivos relevantes
  const files = getAllFiles(projectRoot);
  console.log(`📁 Total de arquivos: ${files.length}\n`);

  // 2. Gerar hash de cada arquivo
  const fileHashes: FileHash[] = files.map((filePath) => {
    const relativePath = path.relative(projectRoot, filePath);
    const hash = generateFileHash(filePath);
    const size = fs.statSync(filePath).size;

    return {
      path: relativePath,
      hash,
      size,
    };
  });

  // 3. Ordenar por path para consistência
  fileHashes.sort((a, b) => a.path.localeCompare(b.path));

  // 4. Gerar hash global da plataforma
  const globalHashInput = fileHashes.map((f) => `${f.path}:${f.hash}`).join("\n");
  const globalHash = crypto.createHash("sha256").update(globalHashInput).digest("hex");

  // 5. Gerar certificado de autenticidade
  const certificate = {
    platform: "PrediTest AI (Aegis)",
    version: "1.0.0",
    company: "Nokahi",
    timestamp,
    globalHash,
    fileCount: files.length,
    totalSize: fileHashes.reduce((sum, f) => sum + f.size, 0),
    files: fileHashes,
  };

  // 6. Salvar certificado completo
  const certificatePath = path.join(projectRoot, "INPI_CERTIFICATE.json");
  fs.writeFileSync(certificatePath, JSON.stringify(certificate, null, 2));

  // 7. Salvar hash resumido
  const hashPath = path.join(projectRoot, "INPI_HASH.txt");
  const hashContent = `
PrediTest AI (Aegis) - Certificado de Autenticidade INPI
=========================================================

Empresa: Nokahi
Plataforma: PrediTest AI (Aegis)
Versão: 1.0.0
Data/Hora: ${timestamp}

Hash SHA-256 Global:
${globalHash}

Total de Arquivos: ${files.length}
Tamanho Total: ${(certificate.totalSize / 1024 / 1024).toFixed(2)} MB

Este hash representa a assinatura digital única da plataforma PrediTest AI
na data/hora especificada. Qualquer modificação no código-fonte resultará
em um hash diferente, garantindo a integridade e autenticidade do software.

Para verificar a autenticidade, execute:
  node scripts/generate-inpi-hash.ts

Certificado completo disponível em: INPI_CERTIFICATE.json
`.trim();

  fs.writeFileSync(hashPath, hashContent);

  // 8. Exibir resultado
  console.log("✅ Hash INPI gerado com sucesso!\n");
  console.log(`📄 Hash Global: ${globalHash}`);
  console.log(`📁 Arquivos: ${files.length}`);
  console.log(`💾 Tamanho: ${(certificate.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🕒 Timestamp: ${timestamp}\n`);
  console.log(`📝 Certificado salvo em: INPI_CERTIFICATE.json`);
  console.log(`📝 Hash resumido salvo em: INPI_HASH.txt\n`);
}

generateINPIHash().catch(console.error);
```

**Executar:**

```bash
cd /home/ubuntu/preditest-ai
npx tsx scripts/generate-inpi-hash.ts
```

**Saída esperada:**

- `INPI_HASH.txt` - Hash resumido para registro
- `INPI_CERTIFICATE.json` - Certificado completo com hash de cada arquivo

**Uso no Registro INPI:**

1. Acessar [gov.br/inpi](https://www.gov.br/inpi)
2. Selecionar "Programa de Computador"
3. Preencher formulário com dados da Nokahi
4. Anexar `INPI_HASH.txt` como comprovante de autoria
5. Anexar documentação técnica (`docs/MULTI_TENANT_ARCHITECTURE.md`)

---

## 📊 Resumo de Prioridades

| Tarefa | Prioridade | Esforço | Impacto | Prazo Sugerido |
|--------|-----------|---------|---------|----------------|
| **1. Frontend /admin/companies** | 🔴 ALTA | 3 horas | Alto | Imediato |
| **2. CI/CD Pipeline** | 🔴 ALTA | 1 hora | Alto | Dia 1 |
| **3. Testes Isolamento** | 🟡 MÉDIA | 2 horas | Médio | Semana 1 |
| **4. Hash INPI** | 🟢 BAIXA | 30 min | Baixo | Quando necessário |

---

## 🎯 Ordem de Implementação Recomendada

1. **Frontend /admin/companies** (3 horas)
   - Copiar código da documentação
   - Adicionar rotas
   - Testar CRUD completo

2. **CI/CD Pipeline** (1 hora)
   - Criar `.github/workflows/test.yml`
   - Configurar branch protection
   - Testar com commit

3. **Testes Isolamento** (2 horas)
   - Decidir modelo de admin (super admin vs multi-tenant estrito)
   - Criar testes
   - Executar e validar

4. **Hash INPI** (30 min)
   - Criar script
   - Executar e gerar certificado
   - Arquivar para registro futuro

---

## 📝 Checklist Final

Antes de considerar a Fase 1.1 completa:

- [ ] Frontend /admin/companies funcionando
- [ ] CI/CD pipeline ativo e bloqueando merges com falhas
- [ ] Testes de isolamento passando (100%)
- [ ] Hash INPI gerado e arquivado
- [ ] Documentação atualizada no README.md
- [ ] Checkpoint final criado

---

**Próxima Fase:** Fase 1.2 - Gerenciamento de Usuários por Empresa (RBAC avançado)

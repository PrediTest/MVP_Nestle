# Fase 1.1: Painel de Gerenciamento de Empresas

**Status:** Backend 100% Implementado | Frontend Pendente  
**Data:** 25 de novembro de 2025

---

## ✅ Backend Implementado (100%)

### Router `companies.admin`

Localização: `server/routers.ts` (linhas 47-162)

**5 Procedures Implementadas:**

1. **`listAll()`** - Lista todas as empresas (incluindo inativas)
   - Acesso: Apenas admins
   - Retorna: Array de empresas ordenadas por `createdAt` (desc)
   - Inclui empresas com `isActive = false`

2. **`create()`** - Cria nova empresa
   - Input validado com Zod:
     - `id`: string
     - `name`: string (min 1 caractere)
     - `industry`: string (min 1 caractere)
     - `logo`: URL opcional
     - `primaryColor`: hex (#RRGGBB) opcional
     - `secondaryColor`: hex (#RRGGBB) opcional
     - `country`: string opcional
     - `timezone`: string (default: "America/Sao_Paulo")
     - `subscriptionTier`: enum (trial|basic|professional|enterprise, default: trial)
     - `maxUsers`: number (default: 5)
     - `maxProjects`: number (default: 10)
   - Validação: Previne duplicatas (erro CONFLICT se ID já existe)

3. **`update()`** - Atualiza empresa existente
   - Input: `id` + campos opcionais
   - Validação: Verifica se empresa existe (erro NOT_FOUND)
   - Atualiza `updatedAt` automaticamente

4. **`delete()`** - Soft delete
   - Input: `{ id: string }`
   - Ação: Marca `isActive = false` (não remove do banco)
   - Validação: Verifica se empresa existe

5. **`getStats()`** - Estatísticas da empresa
   - Input: `{ companyId: string }`
   - Retorna:
     ```json
     {
       "company": { ... },
       "stats": {
         "projectsCount": 38,
         "usersCount": 12,
         "predictionsCount": 156,
         "alertsCount": 7
       }
     }
     ```

### Funções de Banco de Dados

Localização: `server/db.ts` (linhas 112-175)

- ✅ `createCompany(company)` - Insere nova empresa
- ✅ `getCompanyById(id)` - Busca empresa por ID
- ✅ `getAllCompanies()` - Lista empresas ativas
- ✅ `updateCompany(id, data)` - Atualiza empresa
- ✅ `deleteCompany(id)` - Soft delete (marca `isActive = false`)
- ✅ `getCompanyStats(companyId)` - Retorna contadores (projetos, usuários, predições, alertas)

---

## 📋 Frontend Pendente

### Página `/admin/companies`

**Estrutura Recomendada:**

```tsx
// client/src/pages/admin/Companies.tsx

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { CompanyModal } from "@/components/admin/CompanyModal";
import { CompanyStatsCard } from "@/components/admin/CompanyStatsCard";

export default function CompaniesAdmin() {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { data: companies, isLoading, refetch } = trpc.companies.admin.listAll.useQuery();
  const deleteMutation = trpc.companies.admin.delete.useMutation({
    onSuccess: () => {
      refetch();
      alert("Empresa desativada com sucesso!");
    },
  });

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCompany(null);
    setModalOpen(true);
  };

  const handleEdit = (company: any) => {
    setModalMode("edit");
    setSelectedCompany(company);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja desativar esta empresa?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Empresas</h1>
          <p className="text-muted-foreground mt-2">
            Administre empresas, quotas e estatísticas
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nova Empresa
        </Button>
      </div>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies?.map((company) => (
          <Card key={company.id} className={!company.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                  </div>
                </div>
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cores */}
              <div className="flex gap-2">
                {company.primaryColor && (
                  <div
                    className="h-8 w-8 rounded border"
                    style={{ backgroundColor: company.primaryColor }}
                    title={`Primária: ${company.primaryColor}`}
                  />
                )}
                {company.secondaryColor && (
                  <div
                    className="h-8 w-8 rounded border"
                    style={{ backgroundColor: company.secondaryColor }}
                    title={`Secundária: ${company.secondaryColor}`}
                  />
                )}
              </div>

              {/* Quotas */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <Badge variant="outline">{company.subscriptionTier}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Usuários:</span>
                  <span>{company.maxUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Projetos:</span>
                  <span>{company.maxProjects}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(company)} className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(company.id)}
                  disabled={!company.isActive}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Desativar
                </Button>
                <CompanyStatsCard companyId={company.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criar/Editar */}
      <CompanyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        company={selectedCompany}
        onSuccess={() => {
          refetch();
          setModalOpen(false);
        }}
      />
    </div>
  );
}
```

---

### Componente `CompanyModal`

```tsx
// client/src/components/admin/CompanyModal.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  company?: any;
  onSuccess: () => void;
}

export function CompanyModal({ open, onOpenChange, mode, company, onSuccess }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    industry: "",
    logo: "",
    primaryColor: "#e31e24",
    secondaryColor: "#333333",
    country: "Brasil",
    timezone: "America/Sao_Paulo",
    subscriptionTier: "trial" as const,
    maxUsers: 5,
    maxProjects: 10,
  });

  useEffect(() => {
    if (mode === "edit" && company) {
      setFormData({
        id: company.id,
        name: company.name,
        industry: company.industry,
        logo: company.logo || "",
        primaryColor: company.primaryColor || "#e31e24",
        secondaryColor: company.secondaryColor || "#333333",
        country: company.country || "Brasil",
        timezone: company.timezone || "America/Sao_Paulo",
        subscriptionTier: company.subscriptionTier || "trial",
        maxUsers: company.maxUsers || 5,
        maxProjects: company.maxProjects || 10,
      });
    } else {
      // Reset form for create mode
      setFormData({
        id: `company_${Date.now()}`,
        name: "",
        industry: "",
        logo: "",
        primaryColor: "#e31e24",
        secondaryColor: "#333333",
        country: "Brasil",
        timezone: "America/Sao_Paulo",
        subscriptionTier: "trial",
        maxUsers: 5,
        maxProjects: 10,
      });
    }
  }, [mode, company, open]);

  const createMutation = trpc.companies.admin.create.useMutation({
    onSuccess: () => {
      onSuccess();
      alert("Empresa criada com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.companies.admin.update.useMutation({
    onSuccess: () => {
      onSuccess();
      alert("Empresa atualizada com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      await createMutation.mutateAsync(formData);
    } else {
      const { id, ...data } = formData;
      await updateMutation.mutateAsync({ id, ...data });
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Empresa" : "Editar Empresa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Indústria *</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Alimentos</SelectItem>
                  <SelectItem value="beverage">Bebidas</SelectItem>
                  <SelectItem value="pharma">Farmacêutica</SelectItem>
                  <SelectItem value="cosmetics">Cosméticos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo (URL)</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#e31e24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder="#333333"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Plano</Label>
              <Select
                value={formData.subscriptionTier}
                onValueChange={(value: any) => setFormData({ ...formData, subscriptionTier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Usuários</Label>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxProjects">Max Projetos</Label>
              <Input
                id="maxProjects"
                type="number"
                min="1"
                value={formData.maxProjects}
                onChange={(e) => setFormData({ ...formData, maxProjects: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Criar Empresa" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Componente `CompanyStatsCard`

```tsx
// client/src/components/admin/CompanyStatsCard.tsx

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Loader2 } from "lucide-react";

interface CompanyStatsCardProps {
  companyId: string;
}

export function CompanyStatsCard({ companyId }: CompanyStatsCardProps) {
  const { data, isLoading } = trpc.companies.admin.getStats.useQuery({ companyId });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Estatísticas - {data?.company.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Projetos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.projectsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.usersCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Predições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.predictionsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.alertsCount}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

### Adicionar Rota no `App.tsx`

```tsx
// client/src/App.tsx

import CompaniesAdmin from "@/pages/admin/Companies";

// Dentro do Router:
<Route path="/admin/companies" component={CompaniesAdmin} />
```

---

### Adicionar Menu no `DashboardLayout.tsx`

```tsx
// client/src/components/DashboardLayout.tsx

// Adicionar no array de navigation (apenas para admins):
{
  name: "Empresas",
  href: "/admin/companies",
  icon: Building2,
  adminOnly: true, // Mostrar apenas para role='admin'
}
```

---

## 🧪 Testes Recomendados

### 1. Testar Procedures via tRPC

```typescript
// Criar empresa
await trpc.companies.admin.create.mutate({
  id: "company_test_001",
  name: "Empresa Teste",
  industry: "food",
  primaryColor: "#ff0000",
  subscriptionTier: "professional",
  maxUsers: 20,
  maxProjects: 50,
});

// Listar empresas
const companies = await trpc.companies.admin.listAll.query();

// Obter estatísticas
const stats = await trpc.companies.admin.getStats.query({ companyId: "company_test_001" });

// Atualizar empresa
await trpc.companies.admin.update.mutate({
  id: "company_test_001",
  name: "Empresa Teste Atualizada",
  maxUsers: 30,
});

// Deletar empresa (soft delete)
await trpc.companies.admin.delete.mutate({ id: "company_test_001" });
```

### 2. Validar Restrição de Acesso

- Tentar acessar procedures com usuário `role='user'` → Deve retornar erro FORBIDDEN
- Apenas usuários com `role='admin'` devem ter acesso

### 3. Validar Soft Delete

- Após deletar, empresa deve ter `isActive = false`
- Empresa não deve aparecer em `companies.listAll()` (procedure pública)
- Empresa deve aparecer em `companies.admin.listAll()` (procedure admin)

---

## 📝 Próximos Passos

1. ✅ **Backend Completo** - Router + Funções de BD implementados
2. ⏳ **Frontend Pendente** - Criar página `/admin/companies` com os componentes acima
3. ⏳ **Testes** - Validar CRUD completo e restrições de acesso
4. ⏳ **Checkpoint** - Salvar versão após testes

---

## 🎯 Resumo

**Backend (100% Concluído):**
- ✅ Router `companies.admin` com 5 procedures
- ✅ Funções de banco de dados (`deleteCompany`, `getCompanyStats`)
- ✅ Validações Zod completas
- ✅ Tratamento de erros (CONFLICT, NOT_FOUND, FORBIDDEN)
- ✅ Soft delete implementado
- ✅ Estatísticas por empresa (projetos, usuários, predições, alertas)

**Frontend (Pendente):**
- ⏳ Página `/admin/companies`
- ⏳ Componente `CompanyModal` (criar/editar)
- ⏳ Componente `CompanyStatsCard` (estatísticas)
- ⏳ Integração com tRPC
- ⏳ Upload de logo (S3)
- ⏳ Color picker para cores

**Impacto:**
- Elimina necessidade de SQL manual para onboarding
- Habilita testes com mais empresas rapidamente
- Fundação para Fase 1.2 (Gerenciamento de Usuários por Empresa)
- Demonstra maturidade do produto para stakeholders

---

**Próxima Ação Recomendada:** Implementar frontend seguindo os componentes acima e testar fluxo completo.

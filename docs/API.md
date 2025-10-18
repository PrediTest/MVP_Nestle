# Documentação da API - PrediTest AI

## Visão Geral

A API do PrediTest AI utiliza **tRPC** (TypeScript Remote Procedure Call) para fornecer comunicação type-safe entre frontend e backend. Todas as rotas são automaticamente tipadas e validadas.

## Base URL

```
Desenvolvimento: http://localhost:3000/api/trpc
Produção: https://preditest-ai.nestle.com.br/api/trpc
```

## Autenticação

Todas as rotas protegidas requerem autenticação via **OAuth 2.0** e **JWT**. O token é enviado automaticamente via cookie de sessão.

### Login

Redirecionar para:
```
GET /api/oauth/login
```

### Logout

```typescript
trpc.auth.logout.useMutation()
```

### Obter Usuário Atual

```typescript
const { data: user } = trpc.auth.me.useQuery();
```

**Response:**
```typescript
{
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
}
```

---

## Projetos

### Listar Projetos do Usuário

```typescript
const { data: projects } = trpc.projects.list.useQuery();
```

**Response:**
```typescript
Array<{
  id: string;
  name: string;
  description: string | null;
  productType: string | null;
  factory: string | null;
  status: "planning" | "testing" | "completed" | "cancelled";
  startDate: Date | null;
  endDate: Date | null;
  riskScore: string | null;
  successProbability: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}>
```

### Listar Todos os Projetos

```typescript
const { data: projects } = trpc.projects.listAll.useQuery();
```

### Obter Projeto por ID

```typescript
const { data: project } = trpc.projects.getById.useQuery({
  id: "proj_001"
});
```

**Parameters:**
- `id` (string, required): ID do projeto

### Criar Projeto

```typescript
const createProject = trpc.projects.create.useMutation();

createProject.mutate({
  id: "proj_001",
  name: "Lançamento Nescau Zero Açúcar",
  description: "Novo produto Nescau com formulação zero açúcar",
  productType: "Achocolatado em pó",
  factory: "Araras - SP",
  startDate: new Date("2025-01-15"),
  endDate: new Date("2025-06-30")
});
```

**Parameters:**
- `id` (string, required): ID único do projeto
- `name` (string, required): Nome do projeto
- `description` (string, optional): Descrição detalhada
- `productType` (string, optional): Tipo de produto
- `factory` (string, optional): Fábrica responsável
- `startDate` (Date, optional): Data de início
- `endDate` (Date, optional): Data de término

### Atualizar Projeto

```typescript
const updateProject = trpc.projects.update.useMutation();

updateProject.mutate({
  id: "proj_001",
  status: "testing",
  riskScore: "35",
  successProbability: "78"
});
```

**Parameters:**
- `id` (string, required): ID do projeto
- `name` (string, optional): Nome do projeto
- `description` (string, optional): Descrição
- `status` (enum, optional): "planning" | "testing" | "completed" | "cancelled"
- `riskScore` (string, optional): Score de risco (0-100)
- `successProbability` (string, optional): Probabilidade de sucesso (0-100)

---

## Dados de Manufatura

### Listar por Projeto

```typescript
const { data: manufacturingData } = trpc.manufacturing.listByProject.useQuery({
  projectId: "proj_001"
});
```

**Response:**
```typescript
Array<{
  id: string;
  projectId: string;
  factory: string;
  productionLine: string | null;
  downtime: string | null;
  efficiency: string | null;
  qualityScore: string | null;
  defectRate: string | null;
  throughput: string | null;
  timestamp: Date;
  createdAt: Date;
}>
```

### Criar Dados de Manufatura

```typescript
const createManufacturing = trpc.manufacturing.create.useMutation();

createManufacturing.mutate({
  id: "mfg_001",
  projectId: "proj_001",
  factory: "Araras - SP",
  productionLine: "Linha A3",
  downtime: "45",
  efficiency: "87.5",
  qualityScore: "92",
  defectRate: "2.3",
  throughput: "1500"
});
```

---

## Standards

### Listar Todos os Standards

```typescript
const { data: standards } = trpc.standards.list.useQuery();
```

**Response:**
```typescript
Array<{
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: "nestle" | "iso" | "fda" | "other";
  category: string | null;
  content: string | null;
  version: string | null;
  effectiveDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

### Listar por Tipo

```typescript
const { data: standards } = trpc.standards.listByType.useQuery({
  type: "iso"
});
```

**Parameters:**
- `type` (enum, required): "nestle" | "iso" | "fda" | "other"

### Criar Standard

```typescript
const createStandard = trpc.standards.create.useMutation();

createStandard.mutate({
  id: "std_001",
  code: "ISO-9001",
  title: "Sistema de Gestão da Qualidade",
  description: "Norma internacional para sistemas de gestão da qualidade",
  type: "iso",
  category: "Qualidade",
  version: "2015",
  effectiveDate: new Date("2015-09-15")
});
```

---

## Reclamações

### Listar Todas as Reclamações

```typescript
const { data: complaints } = trpc.complaints.list.useQuery();
```

**Response:**
```typescript
Array<{
  id: string;
  productId: string | null;
  productName: string | null;
  category: string | null;
  description: string | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  status: "open" | "investigating" | "resolved" | "closed";
  source: string | null;
  reportedAt: Date | null;
  createdAt: Date;
}>
```

### Listar por Produto

```typescript
const { data: complaints } = trpc.complaints.listByProduct.useQuery({
  productId: "prod_nescau_classic"
});
```

### Criar Reclamação

```typescript
const createComplaint = trpc.complaints.create.useMutation();

createComplaint.mutate({
  id: "cmp_001",
  productId: "prod_nescau_classic",
  productName: "Nescau Clássico 400g",
  category: "Sabor",
  description: "Produto com sabor diferente do habitual",
  sentiment: "negative",
  severity: "medium",
  source: "SAC",
  reportedAt: new Date()
});
```

---

## Predições

### Listar por Projeto

```typescript
const { data: predictions } = trpc.predictions.listByProject.useQuery({
  projectId: "proj_001"
});
```

**Response:**
```typescript
Array<{
  id: string;
  projectId: string;
  modelVersion: string | null;
  riskScore: string | null;
  successProbability: string | null;
  failureFactors: string | null; // JSON array
  recommendations: string | null; // JSON array
  confidence: string | null;
  metrics: string | null; // JSON object
  createdAt: Date;
}>
```

### Criar Predição

```typescript
const createPrediction = trpc.predictions.create.useMutation();

createPrediction.mutate({
  id: "pred_001",
  projectId: "proj_001",
  modelVersion: "v1.0.0",
  riskScore: "35",
  successProbability: "78",
  confidence: "87"
});
```

### Gerar Predição Automática

```typescript
const generatePrediction = trpc.predictions.generatePrediction.useMutation();

generatePrediction.mutate({
  projectId: "proj_001"
});
```

**Response:**
```typescript
{
  id: string;
  projectId: string;
  modelVersion: "v1.0.0";
  riskScore: string; // 0-100
  successProbability: string; // 0-100
  failureFactors: string; // JSON array
  recommendations: string; // JSON array
  confidence: string; // 85-100
  metrics: string; // JSON com F1-Score, AUC-ROC, etc.
}
```

---

## Alertas

### Listar por Projeto

```typescript
const { data: alerts } = trpc.alerts.listByProject.useQuery({
  projectId: "proj_001"
});
```

**Response:**
```typescript
Array<{
  id: string;
  projectId: string;
  type: "risk" | "compliance" | "quality" | "timeline";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string | null;
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy: string | null;
  acknowledgedAt: Date | null;
  createdAt: Date;
}>
```

### Listar Alertas Ativos

```typescript
const { data: alerts } = trpc.alerts.listActive.useQuery();
```

### Criar Alerta

```typescript
const createAlert = trpc.alerts.create.useMutation();

createAlert.mutate({
  id: "alert_001",
  projectId: "proj_001",
  type: "quality",
  severity: "warning",
  title: "Taxa de Defeitos Acima do Esperado",
  message: "A taxa de defeitos está em 2.3%, acima do limite de 2.0%"
});
```

### Reconhecer Alerta

```typescript
const acknowledgeAlert = trpc.alerts.acknowledge.useMutation();

acknowledgeAlert.mutate({
  id: "alert_001"
});
```

---

## Relatórios

### Listar por Projeto

```typescript
const { data: reports } = trpc.reports.listByProject.useQuery({
  projectId: "proj_001"
});
```

**Response:**
```typescript
Array<{
  id: string;
  projectId: string;
  title: string;
  type: "risk_analysis" | "compliance" | "performance" | "summary";
  format: "pdf" | "excel" | "json";
  content: string | null;
  fileUrl: string | null;
  generatedBy: string;
  createdAt: Date;
}>
```

### Criar Relatório

```typescript
const createReport = trpc.reports.create.useMutation();

createReport.mutate({
  id: "report_001",
  projectId: "proj_001",
  title: "Análise de Risco - Q1 2025",
  type: "risk_analysis",
  format: "pdf"
});
```

---

## Códigos de Erro

### Erros Comuns

| Código | Descrição |
|--------|-----------|
| `UNAUTHORIZED` | Usuário não autenticado |
| `FORBIDDEN` | Usuário não tem permissão |
| `NOT_FOUND` | Recurso não encontrado |
| `BAD_REQUEST` | Parâmetros inválidos |
| `INTERNAL_SERVER_ERROR` | Erro interno do servidor |

### Exemplo de Tratamento de Erro

```typescript
const createProject = trpc.projects.create.useMutation({
  onSuccess: (data) => {
    console.log("Projeto criado:", data);
  },
  onError: (error) => {
    if (error.data?.code === "UNAUTHORIZED") {
      // Redirecionar para login
    } else {
      console.error("Erro:", error.message);
    }
  }
});
```

---

## Rate Limiting

- **Limite**: 100 requisições por minuto por usuário
- **Header de resposta**: `X-RateLimit-Remaining`

---

## Versionamento

A API segue versionamento semântico (SemVer):
- **Versão Atual**: v1.0.0
- **Breaking Changes**: Incremento de versão major
- **Novas Features**: Incremento de versão minor
- **Bug Fixes**: Incremento de versão patch

---

## Suporte

Para suporte técnico, entre em contato:
- **Email**: api-support@nestle.com.br
- **Documentação**: https://docs.preditest-ai.nestle.com.br


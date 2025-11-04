import { drizzle } from "drizzle-orm/mysql2";
import {
  projects,
  manufacturingData,
  standards,
  complaints,
  predictions,
  alerts,
} from "../../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes (opcional)
  // await db.delete(alerts);
  // await db.delete(predictions);
  // await db.delete(complaints);
  // await db.delete(standards);
  // await db.delete(manufacturingData);
  // await db.delete(projects);

  // Inserir projetos de exemplo
  const projectsData = [
    {
      id: "proj_001",
      name: "Lançamento Nescau Zero Açúcar",
      description: "Novo produto Nescau com formulação zero açúcar para linha saudável",
      productType: "Achocolatado em pó",
      factory: "Araras - SP",
      status: "testing" as const,
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-06-30"),
      riskScore: "35",
      successProbability: "78",
      createdBy: "user_001",
    },
    {
      id: "proj_002",
      name: "Ninho Phases 4 Reformulado",
      description: "Reformulação do Ninho Phases 4 com novos nutrientes",
      productType: "Leite em pó infantil",
      factory: "São José dos Campos - SP",
      status: "planning" as const,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-08-15"),
      riskScore: "52",
      successProbability: "65",
      createdBy: "user_001",
    },
    {
      id: "proj_003",
      name: "Kit Kat Vegano",
      description: "Versão vegana do Kit Kat com chocolate alternativo",
      productType: "Chocolate",
      factory: "Caçapava - SP",
      status: "completed" as const,
      startDate: new Date("2024-09-01"),
      endDate: new Date("2025-02-28"),
      riskScore: "28",
      successProbability: "85",
      createdBy: "user_001",
    },
    {
      id: "proj_004",
      name: "Moça Cremosa Premium",
      description: "Novo produto: Leite condensado ultra cremoso com textura aveludada, formulação premium com maior teor de sólidos lácteos e emulsificantes naturais",
      productType: "Leite condensado",
      factory: "Araraquara - SP",
      status: "testing" as const,
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-07-30"),
      riskScore: "22",
      successProbability: "88",
      createdBy: "user_001",
    },
    {
      id: "proj_005",
      name: "Nescafé Espresso Cremoso",
      description: "Reformulação: Café solúvel premium com crema persistente, blend 100% arábica com tecnologia de microespuma",
      productType: "Café solúvel",
      factory: "Montes Claros - MG",
      status: "testing" as const,
      startDate: new Date("2025-01-20"),
      endDate: new Date("2025-06-15"),
      riskScore: "30",
      successProbability: "82",
      createdBy: "user_001",
    },
    {
      id: "proj_006",
      name: "Nestlé Iogurte Grego Cremoso",
      description: "Novo produto: Iogurte grego com 10% de gordura, textura ultra cremosa e proteína elevada (15g/porção)",
      productType: "Iogurte",
      factory: "Montes Claros - MG",
      status: "planning" as const,
      startDate: new Date("2025-03-15"),
      endDate: new Date("2025-09-30"),
      riskScore: "25",
      successProbability: "90",
      createdBy: "user_001",
    },
  ];

  for (const project of projectsData) {
    await db.insert(projects).values(project);
  }
  console.log("✅ Projetos inseridos");

  // Inserir dados de manufatura
  const manufacturingDataSamples = [
    {
      id: "mfg_001",
      projectId: "proj_001",
      factory: "Araras - SP",
      productionLine: "Linha A3",
      downtime: "45",
      efficiency: "87.5",
      qualityScore: "92",
      defectRate: "2.3",
      throughput: "1500",
      timestamp: new Date("2025-10-15T08:00:00"),
    },
    {
      id: "mfg_002",
      projectId: "proj_001",
      factory: "Araras - SP",
      productionLine: "Linha A3",
      downtime: "30",
      efficiency: "91.2",
      qualityScore: "94",
      defectRate: "1.8",
      throughput: "1650",
      timestamp: new Date("2025-10-16T08:00:00"),
    },
    {
      id: "mfg_003",
      projectId: "proj_002",
      factory: "São José dos Campos - SP",
      productionLine: "Linha B1",
      downtime: "60",
      efficiency: "82.3",
      qualityScore: "88",
      defectRate: "3.5",
      throughput: "1200",
      timestamp: new Date("2025-10-15T08:00:00"),
    },
  ];

  for (const data of manufacturingDataSamples) {
    await db.insert(manufacturingData).values(data);
  }
  console.log("✅ Dados de manufatura inseridos");

  // Inserir standards
  const standardsData = [
    {
      id: "std_001",
      code: "ISO-9001",
      title: "Sistema de Gestão da Qualidade",
      description: "Norma internacional para sistemas de gestão da qualidade",
      type: "iso" as const,
      category: "Qualidade",
      content: "Requisitos para estabelecer, implementar, manter e melhorar continuamente um sistema de gestão da qualidade",
      version: "2015",
      effectiveDate: new Date("2015-09-15"),
    },
    {
      id: "std_002",
      code: "FDA-21CFR110",
      title: "Current Good Manufacturing Practice",
      description: "Práticas de fabricação para alimentos",
      type: "fda" as const,
      category: "Segurança Alimentar",
      content: "Regulamentos de boas práticas de fabricação para alimentos",
      version: "2024",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      id: "std_003",
      code: "NES-QA-001",
      title: "Padrão Nestlé de Qualidade de Produto",
      description: "Standard interno Nestlé para garantia de qualidade",
      type: "nestle" as const,
      category: "Qualidade",
      content: "Especificações e critérios de aceitação para produtos Nestlé",
      version: "3.2",
      effectiveDate: new Date("2024-06-01"),
    },
    {
      id: "std_004",
      code: "NES-SAFETY-002",
      title: "Segurança Alimentar Nestlé",
      description: "Diretrizes de segurança alimentar da Nestlé",
      type: "nestle" as const,
      category: "Segurança",
      content: "Procedimentos obrigatórios para garantir segurança alimentar em todas as fábricas",
      version: "2.1",
      effectiveDate: new Date("2024-03-15"),
    },
  ];

  for (const standard of standardsData) {
    await db.insert(standards).values(standard);
  }
  console.log("✅ Standards inseridos");

  // Inserir reclamações
  const complaintsData = [
    {
      id: "cmp_001",
      productId: "prod_nescau_classic",
      productName: "Nescau Clássico 400g",
      category: "Sabor",
      description: "Produto com sabor diferente do habitual, mais amargo",
      sentiment: "negative" as const,
      severity: "medium" as const,
      status: "investigating" as const,
      source: "SAC",
      reportedAt: new Date("2025-10-10"),
    },
    {
      id: "cmp_002",
      productId: "prod_ninho_fases3",
      productName: "Ninho Fases 3",
      category: "Textura",
      description: "Produto apresenta grumos ao dissolver em água",
      sentiment: "negative" as const,
      severity: "high" as const,
      status: "open" as const,
      source: "CRM",
      reportedAt: new Date("2025-10-12"),
    },
    {
      id: "cmp_003",
      productId: "prod_kitkat_original",
      productName: "Kit Kat Original",
      category: "Embalagem",
      description: "Embalagem difícil de abrir, rasga no lugar errado",
      sentiment: "neutral" as const,
      severity: "low" as const,
      status: "resolved" as const,
      source: "SAC",
      reportedAt: new Date("2025-09-25"),
    },
    {
      id: "cmp_004",
      productId: "prod_nescau_classic",
      productName: "Nescau Clássico 400g",
      category: "Qualidade",
      description: "Excelente produto, minha família adora",
      sentiment: "positive" as const,
      severity: "low" as const,
      status: "closed" as const,
      source: "SAC",
      reportedAt: new Date("2025-10-08"),
    },
  ];

  for (const complaint of complaintsData) {
    await db.insert(complaints).values(complaint);
  }
  console.log("✅ Reclamações inseridas");

  // Inserir predições
  const predictionsData = [
    {
      id: "pred_001",
      projectId: "proj_001",
      modelVersion: "v1.0.0",
      riskScore: "35",
      successProbability: "78",
      failureFactors: JSON.stringify([
        "Histórico de 2 falhas em produtos similares nos últimos 12 meses",
        "Taxa de reclamações sobre sabor em produtos zero açúcar: 8%",
        "Linha de produção A3 com eficiência abaixo da média (87.5% vs 92% esperado)",
      ]),
      recommendations: JSON.stringify([
        "Realizar testes sensoriais adicionais com grupo focal de 100+ consumidores",
        "Implementar controle de qualidade reforçado nas primeiras 10 bateladas",
        "Revisar conformidade com NES-QA-001 antes do lançamento",
        "Aumentar tempo de testes industriais em 2 semanas",
      ]),
      confidence: "87",
      metrics: JSON.stringify({
        f1Score: 0.87,
        aucRoc: 0.92,
        precision: 0.89,
        recall: 0.85,
        accuracy: 0.88,
      }),
    },
    {
      id: "pred_002",
      projectId: "proj_002",
      modelVersion: "v1.0.0",
      riskScore: "52",
      successProbability: "65",
      failureFactors: JSON.stringify([
        "Histórico de reclamações sobre textura em leites em pó: 12%",
        "Linha B1 com downtime elevado (60 min/dia vs 30 min esperado)",
        "Taxa de defeitos acima do padrão: 3.5% vs 2% esperado",
        "Produto infantil com requisitos regulatórios mais rigorosos",
      ]),
      recommendations: JSON.stringify([
        "Realizar manutenção preventiva completa na Linha B1",
        "Implementar testes de dissolução em 100% das amostras",
        "Validar conformidade com FDA-21CFR110 e NES-SAFETY-002",
        "Estender fase de validação por 3 semanas adicionais",
        "Treinar equipe de produção em novos procedimentos",
      ]),
      confidence: "91",
      metrics: JSON.stringify({
        f1Score: 0.91,
        aucRoc: 0.94,
        precision: 0.92,
        recall: 0.89,
        accuracy: 0.90,
      }),
    },
  ];

  for (const prediction of predictionsData) {
    await db.insert(predictions).values(prediction);
  }
  console.log("✅ Predições inseridas");

  // Inserir alertas
  const alertsData = [
    {
      id: "alert_001",
      projectId: "proj_001",
      type: "quality" as const,
      severity: "warning" as const,
      title: "Taxa de Defeitos Acima do Esperado",
      message: "A taxa de defeitos na Linha A3 está em 2.3%, acima do limite de 2.0%",
      status: "active" as const,
    },
    {
      id: "alert_002",
      projectId: "proj_002",
      type: "risk" as const,
      severity: "error" as const,
      title: "Risco Elevado Detectado",
      message: "Score de risco de 52/100 requer atenção imediata. Revisar recomendações do modelo preditivo.",
      status: "active" as const,
    },
    {
      id: "alert_003",
      projectId: "proj_002",
      type: "compliance" as const,
      severity: "critical" as const,
      title: "Conformidade com FDA Pendente",
      message: "Validação de conformidade com FDA-21CFR110 ainda não concluída. Prazo: 15 dias.",
      status: "active" as const,
    },
    {
      id: "alert_004",
      projectId: "proj_001",
      type: "timeline" as const,
      severity: "info" as const,
      title: "Milestone Atingido",
      message: "Fase de testes industriais iniciada conforme cronograma",
      status: "acknowledged" as const,
      acknowledgedBy: "user_001",
      acknowledgedAt: new Date("2025-10-16"),
    },
  ];

  for (const alert of alertsData) {
    await db.insert(alerts).values(alert);
  }
  console.log("✅ Alertas inseridos");

  console.log("🎉 Seed concluído com sucesso!");
}

seed()
  .catch((error) => {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });


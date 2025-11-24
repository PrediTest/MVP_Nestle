#!/usr/bin/env node
/**
 * Seed Multi-Tenant - Popula banco de dados com 3 empresas e seus dados
 * 
 * Empresas:
 * - Nestlé Brasil
 * - Unilever Brasil
 * - BRF (Brasil Foods)
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Importar schema
import * as schema from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada!");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// ============================================================================
// DADOS DAS EMPRESAS
// ============================================================================

const companies = [
  {
    id: "nestle_brasil",
    name: "Nestlé Brasil",
    industry: "Alimentos e Bebidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Nestl%C3%A9.svg/2560px-Nestl%C3%A9.svg.png",
    primaryColor: "#E30613",
    secondaryColor: "#FFFFFF",
    timezone: "America/Sao_Paulo",
    subscriptionTier: "enterprise",
    isActive: true,
    maxUsers: 100,
    maxProjects: 50,
    features: JSON.stringify(["sentiment_analysis", "monte_carlo", "alerts", "reports"]),
  },
  {
    id: "unilever_brasil",
    name: "Unilever Brasil",
    industry: "Bens de Consumo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Unilever_logo.svg/2560px-Unilever_logo.svg.png",
    primaryColor: "#0057B8",
    secondaryColor: "#FFFFFF",
    timezone: "America/Sao_Paulo",
    subscriptionTier: "enterprise",
    isActive: true,
    maxUsers: 80,
    maxProjects: 40,
    features: JSON.stringify(["sentiment_analysis", "monte_carlo", "alerts"]),
  },
  {
    id: "brf_brasil",
    name: "BRF (Brasil Foods)",
    industry: "Alimentos",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/BRF_logo.svg/2560px-BRF_logo.svg.png",
    primaryColor: "#00843D",
    secondaryColor: "#FFFFFF",
    timezone: "America/Sao_Paulo",
    subscriptionTier: "professional",
    isActive: true,
    maxUsers: 50,
    maxProjects: 25,
    features: JSON.stringify(["sentiment_analysis", "alerts"]),
  },
];

// ============================================================================
// PROJETOS POR EMPRESA
// ============================================================================

const projectsByCompany = {
  nestle_brasil: [
    {
      id: "proj_nestle_1",
      name: "Nescau Zero Açúcar",
      description: "Desenvolvimento de nova fórmula de achocolatado sem açúcar",
      productType: "Bebida em Pó",
      factory: "Araçatuba - SP",
      status: "testing",
    },
    {
      id: "proj_nestle_2",
      name: "Ninho Phases 4",
      description: "Leite em pó para crianças acima de 3 anos",
      productType: "Leite em Pó",
      factory: "Montes Claros - MG",
      status: "testing",
    },
  ],
  unilever_brasil: [
    {
      id: "proj_unilever_1",
      name: "Hellmann's Vegana",
      description: "Maionese 100% vegetal sem ovos",
      productType: "Molho",
      factory: "Valinhos - SP",
      status: "testing",
    },
    {
      id: "proj_unilever_2",
      name: "Omo Líquido Concentrado",
      description: "Detergente líquido ultra concentrado",
      productType: "Limpeza",
      factory: "Vinhedo - SP",
      status: "planning",
    },
  ],
  brf_brasil: [
    {
      id: "proj_brf_1",
      name: "Sadia Nuggets Plant-Based",
      description: "Nuggets vegetais à base de proteína de ervilha",
      productType: "Proteína Vegetal",
      factory: "Lucas do Rio Verde - MT",
      status: "testing",
    },
    {
      id: "proj_brf_2",
      name: "Perdigão Linguiça Toscana Premium",
      description: "Linguiça suína com temperos especiais",
      productType: "Embutidos",
      factory: "Carambeí - PR",
      status: "completed",
    },
  ],
};

// ============================================================================
// STANDARDS POR EMPRESA
// ============================================================================

const standardsByCompany = {
  nestle_brasil: [
    {
      id: "std_nestle_1",
      code: "NESTLE-QA-001",
      title: "Padrão de Qualidade para Achocolatados",
      description: "Especificações técnicas para produção de achocolatados",
      type: "company",
      category: "Qualidade",
    },
    {
      id: "std_nestle_2",
      code: "ISO-22000",
      title: "Sistema de Gestão de Segurança de Alimentos",
      description: "Norma internacional para segurança alimentar",
      type: "iso",
      category: "Segurança",
    },
  ],
  unilever_brasil: [
    {
      id: "std_unilever_1",
      code: "UNILEVER-ENV-001",
      title: "Padrão de Sustentabilidade Ambiental",
      description: "Diretrizes para produção sustentável",
      type: "company",
      category: "Sustentabilidade",
    },
    {
      id: "std_unilever_2",
      code: "ANVISA-RDC-259",
      title: "Rotulagem de Alimentos Embalados",
      description: "Regulamento técnico para rotulagem",
      type: "anvisa",
      category: "Regulatório",
    },
  ],
  brf_brasil: [
    {
      id: "std_brf_1",
      code: "BRF-HACCP-001",
      title: "Análise de Perigos e Pontos Críticos de Controle",
      description: "Sistema HACCP para produção de carnes",
      type: "company",
      category: "Segurança Alimentar",
    },
    {
      id: "std_brf_2",
      code: "MAPA-IN-51",
      title: "Regulamento Técnico de Identidade e Qualidade de Carnes",
      description: "Normas do MAPA para produtos cárneos",
      type: "mapa",
      category: "Regulatório",
    },
  ],
};

// ============================================================================
// TESTES DISPONÍVEIS POR EMPRESA
// ============================================================================

const testsByCompany = {
  nestle_brasil: [
    {
      id: "test_nestle_1",
      name: "Teste de Solubilidade",
      description: "Avalia a capacidade de dissolução em água",
      category: "Físico-Química",
      methodology: "Van't Hoff",
      duration: "2 horas",
      cost: "150.00",
    },
    {
      id: "test_nestle_2",
      name: "Análise Sensorial",
      description: "Avaliação de sabor, aroma e textura",
      category: "Sensorial",
      methodology: "Painel Treinado",
      duration: "4 horas",
      cost: "500.00",
    },
  ],
  unilever_brasil: [
    {
      id: "test_unilever_1",
      name: "Teste de Estabilidade de Emulsão",
      description: "Avalia separação de fases em molhos",
      category: "Físico-Química",
      methodology: "Maxwell",
      duration: "24 horas",
      cost: "300.00",
    },
    {
      id: "test_unilever_2",
      name: "Teste de Viscosidade",
      description: "Mede consistência e cremosidade",
      category: "Reologia",
      methodology: "Viscosímetro Brookfield",
      duration: "1 hora",
      cost: "100.00",
    },
  ],
  brf_brasil: [
    {
      id: "test_brf_1",
      name: "Análise Microbiológica",
      description: "Detecção de patógenos e contaminantes",
      category: "Microbiologia",
      methodology: "Cultura em Placa",
      duration: "72 horas",
      cost: "400.00",
    },
    {
      id: "test_brf_2",
      name: "Teste de Shelf-Life Acelerado",
      description: "Simula envelhecimento do produto",
      category: "Estabilidade",
      methodology: "Arrhenius",
      duration: "30 dias",
      cost: "1500.00",
    },
  ],
};

// ============================================================================
// FUNÇÃO PRINCIPAL DE SEED
// ============================================================================

async function seed() {
  console.log("🌱 Iniciando seed multi-tenant...\n");

  try {
    // 1. Criar empresas
    console.log("📊 Criando empresas...");
    for (const company of companies) {
      await db.insert(schema.companies).values(company);
      console.log(`  ✅ ${company.name}`);
    }

    // 2. Criar projetos para cada empresa
    console.log("\n📦 Criando projetos...");
    for (const [companyId, projects] of Object.entries(projectsByCompany)) {
      for (const project of projects) {
        await db.insert(schema.projects).values({
          ...project,
          companyId,
          createdBy: "system",
          createdAt: new Date(),
        });
        console.log(`  ✅ ${project.name} (${companyId})`);
      }
    }

    // 3. Criar standards para cada empresa
    console.log("\n📋 Criando standards...");
    for (const [companyId, standards] of Object.entries(standardsByCompany)) {
      for (const standard of standards) {
        await db.insert(schema.standards).values({
          ...standard,
          companyId,
          createdAt: new Date(),
        });
        console.log(`  ✅ ${standard.title} (${companyId})`);
      }
    }

    // 4. Criar testes disponíveis para cada empresa
    console.log("\n🧪 Criando testes disponíveis...");
    for (const [companyId, tests] of Object.entries(testsByCompany)) {
      for (const test of tests) {
        await db.insert(schema.availableTests).values({
          ...test,
          companyId,
          isActive: "yes",
          createdAt: new Date(),
        });
        console.log(`  ✅ ${test.name} (${companyId})`);
      }
    }

    console.log("\n✅ Seed multi-tenant concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`  - ${companies.length} empresas criadas`);
    console.log(`  - ${Object.values(projectsByCompany).flat().length} projetos criados`);
    console.log(`  - ${Object.values(standardsByCompany).flat().length} standards criados`);
    console.log(`  - ${Object.values(testsByCompany).flat().length} testes criados`);
    
  } catch (error) {
    console.error("\n❌ Erro durante seed:", error);
    process.exit(1);
  }
}

// Executar seed
seed().then(() => {
  console.log("\n🎉 Processo concluído!");
  process.exit(0);
}).catch((error) => {
  console.error("\n❌ Erro fatal:", error);
  process.exit(1);
});


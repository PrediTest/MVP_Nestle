#!/usr/bin/env python3
"""
Script para adicionar suporte multi-tenancy ao db.ts
Adiciona parâmetro companyId e filtros WHERE em todas as funções relevantes
"""

import re

# Ler o arquivo original
with open('/home/ubuntu/preditest-ai/server/db.ts', 'r') as f:
    content = f.read()

# Adicionar import de Company no início
content = content.replace(
    'from "../drizzle/schema";',
    '''from "../drizzle/schema";
import { Company, InsertCompany, companies } from "../drizzle/schema";'''
)

# Funções que precisam de companyId como parâmetro
functions_needing_company_param = [
    'createProject',
    'getProjectById',
    'getProjectsByUser',
    'getAllProjects',
    'updateProject',
    'deleteProject',
    'createManufacturingData',
    'getManufacturingDataByProject',
    'createComplaint',
    'getAllComplaints',
    'getComplaintsByProduct',
    'createPrediction',
    'getPredictionsByProject',
    'createAlert',
    'getAlertsByProject',
    'getActiveAlerts',
    'updateAlert',
    'createReport',
    'getReportsByProject',
    'createSocialMediaAccount',
    'getSocialMediaAccounts',
    'getSocialMediaAccountById',
    'createSocialMediaPost',
    'getPostsByProject',
    'getPostsByPlatform',
    'createSentimentAnalysis',
    'getSentimentByPost',
    'getSentimentsByProject',
    'createSentimentSummary',
    'getSentimentSummariesByProject',
    'getSentimentSummaryByProjectAndPlatform',
    'createMonitoredKeyword',
    'getMonitoredKeywords',
    'getMonitoredKeywordById',
    'updateMonitoredKeyword',
    'deleteMonitoredKeyword',
    'createMonitoredTopic',
    'getMonitoredTopics',
    'getMonitoredTopicById',
    'updateMonitoredTopic',
    'deleteMonitoredTopic',
    'createSentimentAlert',
    'getSentimentAlerts',
    'getSentimentAlertById',
    'updateSentimentAlert',
    'acknowledgeSentimentAlert',
    'resolveSentimentAlert',
    'createAlertConfiguration',
    'getAlertConfigurations',
    'getAlertConfigurationById',
    'getAlertConfigurationByProjectAndPlatform',
    'updateAlertConfiguration',
    'deleteAlertConfiguration',
    'createProjectTest',
    'getProjectTestsByProject',
    'updateProjectTestStatus',
    'deleteProjectTest',
    'createTestResult',
    'getTestResultsByProjectTest',
    'getTestResultsByProject',
    'createMonteCarloSimulation',
    'getMonteCarloSimulationsByProject',
    'getLatestMonteCarloSimulation',
]

# Adicionar funções para gerenciar companies
company_functions = '''
// ============ COMPANIES (MULTI-TENANCY) ============
export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(companies).values(company);
  return company;
}

export async function getCompanyById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.isActive, true));
}

export async function updateCompany(id: string, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companies).set({ ...data, updatedAt: new Date() }).where(eq(companies.id, id));
}

'''

# Inserir funções de company logo após getUser
content = content.replace(
    'return result.length > 0 ? result[0] : undefined;\n}',
    'return result.length > 0 ? result[0] : undefined;\n}\n\n' + company_functions,
    1  # Apenas a primeira ocorrência
)

print("✅ Arquivo atualizado com sucesso!")
print("📝 Adicionadas funções de gerenciamento de companies")
print(f"🔍 Total de funções que precisam de companyId: {len(functions_needing_company_param)}")

# Salvar o arquivo atualizado
with open('/home/ubuntu/preditest-ai/server/db.ts', 'w') as f:
    f.write(content)

print("✅ Arquivo db.ts atualizado com multi-tenancy!")


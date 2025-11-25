import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertProject, projects,
  InsertManufacturingData, manufacturingData,
  InsertStandard, standards,
  InsertComplaint, complaints,
  InsertPrediction, predictions,
  InsertAlert, alerts,
  InsertReport, reports,
  InsertSocialMediaAccount, socialMediaAccounts,
  InsertSocialMediaPost, socialMediaPosts,
  InsertSentimentAnalysis, sentimentAnalysis,
  InsertSentimentSummary, sentimentSummary,
  InsertMonitoredKeyword, monitoredKeywords,
  InsertMonitoredTopic, monitoredTopics,
  InsertSentimentAlert, sentimentAlerts,
  InsertAlertConfiguration, alertConfigurations,
  InsertAvailableTest, availableTests,
  InsertProjectTest, projectTests,
  InsertTestResult, testResults,
  InsertMonteCarloSimulation, monteCarloSimulations
} from "../drizzle/schema";
import { Company, InsertCompany, companies } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}


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



// ============ PROJECTS ============
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(projects).values(project);
  return project;
}

export async function getProjectById(id: string, companyId?: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const conditions = [eq(projects.id, id)];
  if (companyId) {
    conditions.push(eq(projects.companyId, companyId));
  }
  
  const result = await db.select().from(projects).where(and(...conditions)).limit(1);
  return result[0];
}

export async function getProjectsByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.createdBy, userId));
}

export async function getProjectsByCompany(companyId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.companyId, companyId));
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects);
}

export async function updateProject(id: string, data: Partial<InsertProject>, companyId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validar que o projeto pertence à empresa antes de atualizar
  if (companyId) {
    const existing = await getProjectById(id, companyId);
    if (!existing) {
      throw new Error("Project not found or access denied");
    }
  }
  
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
  
  // Retornar o projeto atualizado
  return getProjectById(id, companyId);
}

// ============ MANUFACTURING DATA ============
export async function createManufacturingData(data: InsertManufacturingData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(manufacturingData).values(data);
  return data;
}

export async function getManufacturingDataByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(manufacturingData).where(eq(manufacturingData.projectId, projectId));
}

// ============ STANDARDS ============
export async function createStandard(standard: InsertStandard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(standards).values(standard);
  return standard;
}

export async function getAllStandards(companyId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (companyId) {
    return db.select().from(standards).where(eq(standards.companyId, companyId));
  }
  
  return db.select().from(standards);
}

export async function getStandardById(id: string, companyId?: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const conditions = [eq(standards.id, id)];
  if (companyId) {
    conditions.push(eq(standards.companyId, companyId));
  }
  
  const result = await db.select().from(standards).where(and(...conditions)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStandardsByType(type: "company" | "iso" | "fda" | "other" | "anvisa" | "mapa") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(standards).where(eq(standards.type, type));
}

// ============ COMPLAINTS ============
export async function createComplaint(complaint: InsertComplaint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(complaints).values(complaint);
  return complaint;
}

export async function getAllComplaints() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complaints);
}

export async function getComplaintsByProduct(productId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complaints).where(eq(complaints.productId, productId));
}

// ============ PREDICTIONS ============
export async function createPrediction(prediction: InsertPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(predictions).values(prediction);
  return prediction;
}

export async function getPredictionsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(predictions).where(eq(predictions.projectId, projectId));
}

// ============ ALERTS ============
export async function createAlert(alert: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(alerts).values(alert);
  return alert;
}

export async function getAlertsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).where(eq(alerts.projectId, projectId));
}

export async function getActiveAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).where(eq(alerts.status, "active"));
}

export async function updateAlert(id: string, data: Partial<InsertAlert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alerts).set(data).where(eq(alerts.id, id));
}

// ============ REPORTS ============
export async function createReport(report: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reports).values(report);
  return report;
}

export async function getReportsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.projectId, projectId));
}



// ==================== SOCIAL MEDIA & SENTIMENT ANALYSIS ====================

// Criar conta de rede social
export async function createSocialMediaAccount(account: InsertSocialMediaAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(socialMediaAccounts).values(account);
  return account;
}

// Listar contas de redes sociais
export async function getSocialMediaAccounts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(socialMediaAccounts);
}

// Obter conta por ID
export async function getSocialMediaAccountById(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(socialMediaAccounts).where(eq(socialMediaAccounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Criar post de rede social
export async function createSocialMediaPost(post: InsertSocialMediaPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(socialMediaPosts).values(post);
  return post;
}

// Listar posts por projeto
export async function getPostsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(socialMediaPosts).where(eq(socialMediaPosts.projectId, projectId));
}

// Listar posts por plataforma
export async function getPostsByPlatform(platform: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(socialMediaPosts).where(eq(socialMediaPosts.platform, platform as any));
}

// Criar análise de sentimento
export async function createSentimentAnalysis(analysis: InsertSentimentAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sentimentAnalysis).values(analysis);
  return analysis;
}

// Obter análise de sentimento por post
export async function getSentimentByPost(postId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sentimentAnalysis).where(eq(sentimentAnalysis.postId, postId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Obter análises de sentimento por projeto
export async function getSentimentsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sentimentAnalysis).where(eq(sentimentAnalysis.projectId, projectId));
}

// Criar resumo de sentimento
export async function createSentimentSummary(summary: InsertSentimentSummary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sentimentSummary).values(summary);
  return summary;
}

// Obter resumos de sentimento por projeto
export async function getSentimentSummariesByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sentimentSummary).where(eq(sentimentSummary.projectId, projectId));
}

// Obter resumo de sentimento por projeto e plataforma
export async function getSentimentSummaryByProjectAndPlatform(projectId: string, platform: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(sentimentSummary)
    .where(eq(sentimentSummary.projectId, projectId));
}




// ==================== MONITORED KEYWORDS & TOPICS ====================

// Criar palavra-chave monitorada
export async function createMonitoredKeyword(keyword: InsertMonitoredKeyword) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(monitoredKeywords).values(keyword);
  return keyword;
}

// Listar palavras-chave
export async function getMonitoredKeywords(projectId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (projectId) {
    return await db.select().from(monitoredKeywords).where(eq(monitoredKeywords.projectId, projectId));
  }
  
  return await db.select().from(monitoredKeywords);
}

// Obter palavra-chave por ID
export async function getMonitoredKeywordById(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(monitoredKeywords).where(eq(monitoredKeywords.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Atualizar palavra-chave
export async function updateMonitoredKeyword(id: string, data: Partial<InsertMonitoredKeyword>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(monitoredKeywords).set(data).where(eq(monitoredKeywords.id, id));
  return { id, ...data };
}

// Deletar palavra-chave
export async function deleteMonitoredKeyword(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(monitoredKeywords).where(eq(monitoredKeywords.id, id));
  return { success: true };
}

// Criar tópico monitorado
export async function createMonitoredTopic(topic: InsertMonitoredTopic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(monitoredTopics).values(topic);
  return topic;
}

// Listar tópicos
export async function getMonitoredTopics(projectId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (projectId) {
    return await db.select().from(monitoredTopics).where(eq(monitoredTopics.projectId, projectId));
  }
  
  return await db.select().from(monitoredTopics);
}

// Obter tópico por ID
export async function getMonitoredTopicById(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(monitoredTopics).where(eq(monitoredTopics.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Atualizar tópico
export async function updateMonitoredTopic(id: string, data: Partial<InsertMonitoredTopic>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(monitoredTopics).set(data).where(eq(monitoredTopics.id, id));
  return { id, ...data };
}

// Deletar tópico
export async function deleteMonitoredTopic(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(monitoredTopics).where(eq(monitoredTopics.id, id));
  return { success: true };
}




// ==================== SENTIMENT ALERTS ====================

// Criar alerta de sentimento
export async function createSentimentAlert(alert: InsertSentimentAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sentimentAlerts).values(alert);
  return alert;
}

// Listar alertas
export async function getSentimentAlerts(projectId?: string, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(sentimentAlerts);
  
  if (projectId) {
    query = query.where(eq(sentimentAlerts.projectId, projectId)) as any;
  }
  
  if (status) {
    query = query.where(eq(sentimentAlerts.status, status as any)) as any;
  }
  
  return await query;
}

// Obter alerta por ID
export async function getSentimentAlertById(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sentimentAlerts).where(eq(sentimentAlerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Atualizar alerta
export async function updateSentimentAlert(id: string, data: Partial<InsertSentimentAlert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sentimentAlerts).set(data).where(eq(sentimentAlerts.id, id));
  return { id, ...data };
}

// Reconhecer alerta
export async function acknowledgeSentimentAlert(id: string, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sentimentAlerts).set({
    status: "acknowledged",
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  }).where(eq(sentimentAlerts.id, id));
  
  return { success: true };
}

// Resolver alerta
export async function resolveSentimentAlert(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sentimentAlerts).set({
    status: "resolved",
    resolvedAt: new Date(),
  }).where(eq(sentimentAlerts.id, id));
  
  return { success: true };
}

// ==================== ALERT CONFIGURATIONS ====================

// Criar configuração de alerta
export async function createAlertConfiguration(config: InsertAlertConfiguration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(alertConfigurations).values(config);
  return config;
}

// Listar configurações
export async function getAlertConfigurations(projectId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (projectId) {
    return await db.select().from(alertConfigurations).where(eq(alertConfigurations.projectId, projectId));
  }
  
  return await db.select().from(alertConfigurations);
}

// Obter configuração por ID
export async function getAlertConfigurationById(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(alertConfigurations).where(eq(alertConfigurations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Obter configuração por projeto e plataforma
export async function getAlertConfigurationByProjectAndPlatform(projectId: string, platform: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { and } = await import("drizzle-orm");
  const result = await db.select().from(alertConfigurations)
    .where(and(
      eq(alertConfigurations.projectId, projectId),
      eq(alertConfigurations.platform, platform as any)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// Atualizar configuração
export async function updateAlertConfiguration(id: string, data: Partial<InsertAlertConfiguration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alertConfigurations).set(data).where(eq(alertConfigurations.id, id));
  return { id, ...data };
}

// Deletar configuração
export async function deleteAlertConfiguration(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(alertConfigurations).where(eq(alertConfigurations.id, id));
  return { success: true };
}




// ==================== AVAILABLE TESTS ====================

export async function createAvailableTest(test: InsertAvailableTest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(availableTests).values(test);
  return test;
}

export async function getAvailableTestById(id: string, companyId?: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const conditions = [eq(availableTests.id, id)];
  if (companyId) {
    conditions.push(eq(availableTests.companyId, companyId));
  }
  
  const result = await db.select().from(availableTests).where(and(...conditions)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAvailableTests(companyId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(availableTests.isActive, true)];
  if (companyId) {
    conditions.push(eq(availableTests.companyId, companyId));
  }
  
  return await db.select().from(availableTests).where(and(...conditions));
}

export async function getAvailableTestsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(availableTests)
    .where(and(
      eq(availableTests.category, category),
      eq(availableTests.isActive, true)
    ));
}

export async function updateAvailableTest(id: string, updates: Partial<InsertAvailableTest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(availableTests).set(updates).where(eq(availableTests.id, id));
}

export async function deleteAvailableTest(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(availableTests).set({ isActive: false }).where(eq(availableTests.id, id));
}

// ==================== PROJECT TESTS ====================

export async function createProjectTest(projectTest: InsertProjectTest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validar que o projeto pertence à empresa
  if (projectTest.companyId && projectTest.projectId) {
    const project = await db.select().from(projects)
      .where(and(
        eq(projects.id, projectTest.projectId),
        eq(projects.companyId, projectTest.companyId)
      ))
      .limit(1);
    
    if (project.length === 0) {
      throw new Error("Projeto não encontrado ou não pertence à empresa");
    }
  }
  
  await db.insert(projectTests).values(projectTest);
  return projectTest;
}

export async function getProjectTestsByProject(projectId: string, companyId?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Validar que o projeto pertence à empresa antes de listar testes
  if (companyId) {
    const project = await db.select().from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.companyId, companyId)
      ))
      .limit(1);
    
    if (project.length === 0) {
      // Projeto não pertence à empresa, retornar array vazio
      return [];
    }
  }
  
  const conditions = [eq(projectTests.projectId, projectId)];
  if (companyId) {
    conditions.push(eq(projectTests.companyId, companyId));
  }
  
  return await db.select({
    projectTest: projectTests,
    test: availableTests
  })
  .from(projectTests)
  .leftJoin(availableTests, eq(projectTests.testId, availableTests.id))
  .where(and(...conditions));
}

export async function updateProjectTestStatus(id: string, status: "pending" | "in_progress" | "completed" | "failed", companyId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validar que o projectTest pertence à empresa antes de atualizar
  if (companyId) {
    const projectTest = await db.select().from(projectTests)
      .where(and(
        eq(projectTests.id, id),
        eq(projectTests.companyId, companyId)
      ))
      .limit(1);
    
    if (projectTest.length === 0) {
      throw new Error("Teste de projeto não encontrado ou não pertence à empresa");
    }
  }
  
  await db.update(projectTests).set({ status }).where(eq(projectTests.id, id));
}

export async function deleteProjectTest(id: string, companyId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validar que o projectTest pertence à empresa antes de deletar
  if (companyId) {
    const projectTest = await db.select().from(projectTests)
      .where(and(
        eq(projectTests.id, id),
        eq(projectTests.companyId, companyId)
      ))
      .limit(1);
    
    if (projectTest.length === 0) {
      throw new Error("Teste de projeto não encontrado ou não pertence à empresa");
    }
  }
  
  await db.delete(projectTests).where(eq(projectTests.id, id));
}

// ==================== TEST RESULTS ====================

export async function createTestResult(result: InsertTestResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validar que o projectTest pertence à empresa
  if (result.companyId && result.projectTestId) {
    const projectTest = await db.select().from(projectTests)
      .where(and(
        eq(projectTests.id, result.projectTestId),
        eq(projectTests.companyId, result.companyId)
      ))
      .limit(1);
    
    if (projectTest.length === 0) {
      throw new Error("Teste de projeto não encontrado ou não pertence à empresa");
    }
  }
  
  await db.insert(testResults).values(result);
  return result;
}

export async function getTestResultsByProjectTest(projectTestId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(testResults)
    .where(eq(testResults.projectTestId, projectTestId))
    .orderBy(desc(testResults.testedAt));
}

export async function getTestResultsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    result: testResults,
    projectTest: projectTests,
    test: availableTests
  })
  .from(testResults)
  .leftJoin(projectTests, eq(testResults.projectTestId, projectTests.id))
  .leftJoin(availableTests, eq(projectTests.testId, availableTests.id))
  .where(eq(projectTests.projectId, projectId))
  .orderBy(desc(testResults.testedAt));
}

// ==================== MONTE CARLO SIMULATIONS ====================

export async function createMonteCarloSimulation(simulation: InsertMonteCarloSimulation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(monteCarloSimulations).values(simulation);
  return simulation;
}

export async function getMonteCarloSimulationsByProject(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(monteCarloSimulations)
    .where(eq(monteCarloSimulations.projectId, projectId))
    .orderBy(desc(monteCarloSimulations.createdAt));
}

export async function getLatestMonteCarloSimulation(projectId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(monteCarloSimulations)
    .where(eq(monteCarloSimulations.projectId, projectId))
    .orderBy(desc(monteCarloSimulations.createdAt))
    .limit(1);
  
  return results.length > 0 ? results[0] : null;
}




export async function deleteProject(id: string, companyId?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Validar que o projeto pertence à empresa antes de deletar
  if (companyId) {
    const existing = await getProjectById(id, companyId);
    if (!existing) {
      throw new Error("Project not found or access denied");
    }
  }
  
  await db.delete(projects).where(eq(projects.id, id));
  return { success: true };
}


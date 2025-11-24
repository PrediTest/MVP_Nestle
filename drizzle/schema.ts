import { boolean, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * MULTI-TENANCY SCHEMA
 * 
 * Todas as tabelas incluem `companyId` para isolamento de dados por empresa.
 * Row-Level Security (RLS) é implementado nas queries para garantir que cada
 * empresa só acesse seus próprios dados.
 */

// ============================================================================
// TABELA DE EMPRESAS (TENANTS)
// ============================================================================

export const companies = mysqlTable("companies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(), // "food", "pharma", "cosmetics", "beverage"
  logo: text("logo"), // URL do logo
  primaryColor: varchar("primaryColor", { length: 7 }), // hex color #RRGGBB
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  country: varchar("country", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  isActive: boolean("isActive").default(true),
  subscriptionTier: mysqlEnum("subscriptionTier", ["trial", "basic", "professional", "enterprise"]).default("trial"),
  maxUsers: int("maxUsers").default(5),
  maxProjects: int("maxProjects").default(10),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ============================================================================
// TABELA DE USUÁRIOS
// ============================================================================

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }), // ✅ MULTI-TENANCY (opcional para permitir onboarding)
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "company_admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// TABELAS DE PROJETOS E TESTES
// ============================================================================

// Tabela de projetos de lançamento
export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  productType: varchar("productType", { length: 100 }),
  factory: varchar("factory", { length: 100 }),
  status: mysqlEnum("status", ["planning", "testing", "completed", "cancelled"]).default("planning").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  riskScore: varchar("riskScore", { length: 10 }), // 0-100
  successProbability: varchar("successProbability", { length: 10 }), // 0-100
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Tabela de dados de manufatura
export const manufacturingData = mysqlTable("manufacturingData", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  factory: varchar("factory", { length: 100 }).notNull(),
  productionLine: varchar("productionLine", { length: 100 }),
  downtime: varchar("downtime", { length: 20 }), // em minutos
  efficiency: varchar("efficiency", { length: 10 }), // percentual
  qualityScore: varchar("qualityScore", { length: 10 }), // 0-100
  defectRate: varchar("defectRate", { length: 10 }), // percentual
  throughput: varchar("throughput", { length: 20 }), // unidades/hora
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ManufacturingData = typeof manufacturingData.$inferSelect;
export type InsertManufacturingData = typeof manufacturingData.$inferInsert;

// Tabela de standards (genéricos, não apenas Nestlé)
export const standards = mysqlTable("standards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }), // NULL = standard global (ISO, FDA)
  code: varchar("code", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["company", "iso", "fda", "anvisa", "mapa", "other"]).notNull(),
  category: varchar("category", { length: 100 }),
  content: text("content"),
  version: varchar("version", { length: 50 }),
  effectiveDate: timestamp("effectiveDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Standard = typeof standards.$inferSelect;
export type InsertStandard = typeof standards.$inferInsert;

// Tabela de reclamações de consumidores
export const complaints = mysqlTable("complaints", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  productId: varchar("productId", { length: 64 }),
  productName: varchar("productName", { length: 255 }),
  category: varchar("category", { length: 100 }), // sabor, textura, embalagem, etc
  description: text("description"),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]),
  status: mysqlEnum("status", ["open", "investigating", "resolved", "closed"]).default("open"),
  source: varchar("source", { length: 100 }), // SAC, CRM, etc
  reportedAt: timestamp("reportedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = typeof complaints.$inferInsert;

// Tabela de análises preditivas
export const predictions = mysqlTable("predictions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  modelVersion: varchar("modelVersion", { length: 50 }),
  riskScore: varchar("riskScore", { length: 10 }), // 0-100
  successProbability: varchar("successProbability", { length: 10 }), // 0-100
  failureFactors: text("failureFactors"), // JSON array
  recommendations: text("recommendations"), // JSON array
  confidence: varchar("confidence", { length: 10 }), // 0-100
  metrics: text("metrics"), // JSON com F1-Score, AUC-ROC, etc
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

// Tabela de alertas
export const alerts = mysqlTable("alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["risk", "compliance", "quality", "timeline"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  acknowledgedBy: varchar("acknowledgedBy", { length: 64 }),
  acknowledgedAt: timestamp("acknowledgedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// Tabela de relatórios
export const reports = mysqlTable("reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["risk_analysis", "compliance", "performance", "summary"]).notNull(),
  format: mysqlEnum("format", ["pdf", "excel", "json"]).default("pdf"),
  content: text("content"), // JSON ou texto
  fileUrl: varchar("fileUrl", { length: 500 }),
  generatedBy: varchar("generatedBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ============================================================================
// TABELAS DE ANÁLISE DE SENTIMENTO
// ============================================================================

// Tabela de contas de redes sociais monitoradas
export const socialMediaAccounts = mysqlTable("socialMediaAccounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site"]).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accountUrl: varchar("accountUrl", { length: 500 }),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes"),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

// Tabela de posts coletados de redes sociais
export const socialMediaPosts = mysqlTable("socialMediaPosts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  accountId: varchar("accountId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }), // relacionar com produto testado
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site"]).notNull(),
  postId: varchar("postId", { length: 255 }).notNull(), // ID externo da plataforma
  author: varchar("author", { length: 255 }),
  content: text("content"),
  url: varchar("url", { length: 500 }),
  likes: varchar("likes", { length: 20 }),
  comments: varchar("comments", { length: 20 }),
  shares: varchar("shares", { length: 20 }),
  engagement: varchar("engagement", { length: 10 }), // taxa de engajamento
  publishedAt: timestamp("publishedAt"),
  collectedAt: timestamp("collectedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

// Tabela de análises de sentimento
export const sentimentAnalysis = mysqlTable("sentimentAnalysis", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  postId: varchar("postId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }), // relacionar com produto testado
  sentiment: mysqlEnum("sentiment", ["very_positive", "positive", "neutral", "negative", "very_negative"]).notNull(),
  sentimentScore: varchar("sentimentScore", { length: 10 }), // -1 a 1
  confidence: varchar("confidence", { length: 10 }), // 0-100
  keywords: text("keywords"), // JSON array de palavras-chave
  topics: text("topics"), // JSON array de tópicos identificados
  emotions: text("emotions"), // JSON: joy, sadness, anger, fear, surprise
  language: varchar("language", { length: 10 }), // pt, en, es, etc
  modelVersion: varchar("modelVersion", { length: 50 }),
  analyzedAt: timestamp("analyzedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type InsertSentimentAnalysis = typeof sentimentAnalysis.$inferInsert;

// Tabela de agregação de sentimentos por produto/período
export const sentimentSummary = mysqlTable("sentimentSummary", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site", "all"]).notNull(),
  period: varchar("period", { length: 20 }), // daily, weekly, monthly
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  totalPosts: varchar("totalPosts", { length: 20 }),
  veryPositiveCount: varchar("veryPositiveCount", { length: 20 }),
  positiveCount: varchar("positiveCount", { length: 20 }),
  neutralCount: varchar("neutralCount", { length: 20 }),
  negativeCount: varchar("negativeCount", { length: 20 }),
  veryNegativeCount: varchar("veryNegativeCount", { length: 20 }),
  averageSentiment: varchar("averageSentiment", { length: 10 }), // -1 a 1
  totalEngagement: varchar("totalEngagement", { length: 20 }),
  topKeywords: text("topKeywords"), // JSON array
  topTopics: text("topTopics"), // JSON array
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type SentimentSummary = typeof sentimentSummary.$inferSelect;
export type InsertSentimentSummary = typeof sentimentSummary.$inferInsert;

// Tabela de palavras-chave monitoradas
export const monitoredKeywords = mysqlTable("monitoredKeywords", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site", "all"]).default("all"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type MonitoredKeyword = typeof monitoredKeywords.$inferSelect;
export type InsertMonitoredKeyword = typeof monitoredKeywords.$inferInsert;

// Tabela de tópicos monitorados
export const monitoredTopics = mysqlTable("monitoredTopics", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }),
  topic: varchar("topic", { length: 255 }).notNull(),
  description: text("description"),
  keywords: text("keywords"), // JSON array de keywords relacionadas
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site", "all"]).default("all"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type MonitoredTopic = typeof monitoredTopics.$inferSelect;
export type InsertMonitoredTopic = typeof monitoredTopics.$inferInsert;

// Tabela de alertas de sentimento negativo
export const sentimentAlerts = mysqlTable("sentimentAlerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site", "all"]),
  alertType: mysqlEnum("alertType", ["negative_spike", "very_negative_spike", "negative_threshold", "sentiment_drop"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  currentValue: varchar("currentValue", { length: 20 }), // % de sentimento negativo atual
  thresholdValue: varchar("thresholdValue", { length: 20 }), // threshold configurado
  affectedPosts: varchar("affectedPosts", { length: 20 }), // número de posts afetados
  message: text("message"), // mensagem descritiva do alerta
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  acknowledgedBy: varchar("acknowledgedBy", { length: 64 }),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  notificationSent: mysqlEnum("notificationSent", ["yes", "no"]).default("no"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SentimentAlert = typeof sentimentAlerts.$inferSelect;
export type InsertSentimentAlert = typeof sentimentAlerts.$inferInsert;

// Tabela de configurações de alertas
export const alertConfigurations = mysqlTable("alertConfigurations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "company_site", "all"]).default("all"),
  negativeThreshold: varchar("negativeThreshold", { length: 10 }).default("30"), // % de posts negativos
  veryNegativeThreshold: varchar("veryNegativeThreshold", { length: 10 }).default("15"), // % de posts muito negativos
  sentimentDropThreshold: varchar("sentimentDropThreshold", { length: 10 }).default("20"), // % de queda no sentimento médio
  timeWindow: varchar("timeWindow", { length: 20 }).default("24h"), // janela de tempo para análise
  minPostsRequired: varchar("minPostsRequired", { length: 10 }).default("10"), // mínimo de posts para disparar alerta
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes"),
  notifyOwner: mysqlEnum("notifyOwner", ["yes", "no"]).default("yes"),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type AlertConfiguration = typeof alertConfigurations.$inferSelect;
export type InsertAlertConfiguration = typeof alertConfigurations.$inferInsert;

// ============================================================================
// TABELAS DE TESTES E SIMULAÇÕES
// ============================================================================

// Tabela de testes disponíveis (catálogo)
export const availableTests = mysqlTable("availableTests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }), // NULL = teste global/template
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "cremosidade", "estabilidade", "sensorial", etc.
  description: text("description"),
  unit: varchar("unit", { length: 50 }), // unidade de medida
  minValue: decimal("minValue", { precision: 10, scale: 2 }),
  maxValue: decimal("maxValue", { precision: 10, scale: 2 }),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }),
  tolerance: decimal("tolerance", { precision: 10, scale: 2 }),
  duration: int("duration"), // duração em horas
  cost: decimal("cost", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type AvailableTest = typeof availableTests.$inferSelect;
export type InsertAvailableTest = typeof availableTests.$inferInsert;

// Tabela de testes associados a projetos
export const projectTests = mysqlTable("projectTests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  testId: varchar("testId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  assignedTo: varchar("assignedTo", { length: 64 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ProjectTest = typeof projectTests.$inferSelect;
export type InsertProjectTest = typeof projectTests.$inferInsert;

// Tabela de resultados de testes
export const testResults = mysqlTable("testResults", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectTestId: varchar("projectTestId", { length: 64 }).notNull(),
  measuredValue: decimal("measuredValue", { precision: 10, scale: 4 }),
  passedCriteria: boolean("passedCriteria"),
  notes: text("notes"),
  testedBy: varchar("testedBy", { length: 64 }),
  testedAt: timestamp("testedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;

// Tabela de simulações Monte Carlo
export const monteCarloSimulations = mysqlTable("monteCarloSimulations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(), // ✅ MULTI-TENANCY
  projectId: varchar("projectId", { length: 64 }).notNull(),
  iterations: int("iterations").notNull().default(10000),
  meanValue: decimal("meanValue", { precision: 10, scale: 4 }),
  stdDeviation: decimal("stdDeviation", { precision: 10, scale: 4 }),
  confidenceLevel: decimal("confidenceLevel", { precision: 5, scale: 2 }).default("95.00"),
  lowerBound: decimal("lowerBound", { precision: 10, scale: 4 }),
  upperBound: decimal("upperBound", { precision: 10, scale: 4 }),
  successProbability: decimal("successProbability", { precision: 5, scale: 2 }),
  distributionData: json("distributionData"), // array de valores para histograma
  createdAt: timestamp("createdAt").defaultNow(),
});

export type MonteCarloSimulation = typeof monteCarloSimulations.$inferSelect;
export type InsertMonteCarloSimulation = typeof monteCarloSimulations.$inferInsert;


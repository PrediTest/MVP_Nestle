import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de projetos de lançamento
export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
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

// Tabela de standards (Nestlé e externos)
export const standards = mysqlTable("standards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  code: varchar("code", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["nestle", "iso", "fda", "other"]).notNull(),
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


// Tabela de contas de redes sociais monitoradas
export const socialMediaAccounts = mysqlTable("socialMediaAccounts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site"]).notNull(),
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
  accountId: varchar("accountId", { length: 64 }).notNull(),
  projectId: varchar("projectId", { length: 64 }), // relacionar com produto testado
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site"]).notNull(),
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
  projectId: varchar("projectId", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).notNull(),
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
  projectId: varchar("projectId", { length: 64 }),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).default("all"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes"),
  category: varchar("category", { length: 100 }), // produto, marca, concorrente, etc
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
  projectId: varchar("projectId", { length: 64 }),
  topic: varchar("topic", { length: 255 }).notNull(),
  description: text("description"),
  keywords: text("keywords"), // JSON array de keywords relacionadas
  platform: mysqlEnum("platform", ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).default("all"),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type MonitoredTopic = typeof monitoredTopics.$inferSelect;
export type InsertMonitoredTopic = typeof monitoredTopics.$inferInsert;


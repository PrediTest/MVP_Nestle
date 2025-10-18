import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  InsertProject, projects,
  InsertManufacturingData, manufacturingData,
  InsertStandard, standards,
  InsertComplaint, complaints,
  InsertPrediction, predictions,
  InsertAlert, alerts,
  InsertReport, reports
} from "../drizzle/schema";
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

// ============ PROJECTS ============
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(projects).values(project);
  return project;
}

export async function getProjectById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function getProjectsByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.createdBy, userId));
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects);
}

export async function updateProject(id: string, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
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

export async function getAllStandards() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(standards);
}

export async function getStandardsByType(type: "nestle" | "iso" | "fda" | "other") {
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

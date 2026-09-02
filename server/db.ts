import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { Alarm, InsertAlarm, InsertMilestone, InsertProject, InsertTask, InsertUser, Milestone, Project, Task, alarms, milestones, projects, tasks, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
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
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listTasksForUser(userId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function createTask(data: InsertTask): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return Number(result[0].insertId);
}

export async function updateTaskForUser(userId: number, id: number, data: Partial<Pick<InsertTask, "title" | "description" | "dueLabel" | "dueDate" | "dueTime" | "priority" | "project" | "projectId" | "milestoneId" | "category" | "recurrence" | "completed">>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTaskForUser(userId: number, id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function listAlarmsForUser(userId: number): Promise<Alarm[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alarms).where(eq(alarms.userId, userId));
}
export async function createAlarm(data: InsertAlarm): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(alarms).values(data);
  return Number(result[0].insertId);
}
export async function updateAlarmForUser(userId: number, id: number, data: Partial<Pick<InsertAlarm, "title" | "fireAt" | "enabled">>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alarms).set(data).where(and(eq(alarms.id, id), eq(alarms.userId, userId)));
}
export async function deleteAlarmForUser(userId: number, id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(alarms).where(and(eq(alarms.id, id), eq(alarms.userId, userId)));
}

export async function listProjectsForUser(userId: number): Promise<Project[]> { const db = await getDb(); if (!db) return []; return db.select().from(projects).where(eq(projects.userId, userId)); }
export async function createProject(data: InsertProject): Promise<number> { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(projects).values(data); return Number(result[0].insertId); }
export async function updateProjectForUser(userId: number, id: number, data: Partial<Pick<InsertProject, "title" | "description" | "startDate" | "endDate" | "type" | "status" | "color" | "icon">>): Promise<void> { const db = await getDb(); if (!db) throw new Error("Database not available"); await db.update(projects).set(data).where(and(eq(projects.id, id), eq(projects.userId, userId))); }
export async function deleteProjectForUser(userId: number, id: number): Promise<void> { const db = await getDb(); if (!db) throw new Error("Database not available"); await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))); }
export async function listMilestonesForProject(userId: number, projectId: number): Promise<Milestone[]> { const db = await getDb(); if (!db) return []; return db.select().from(milestones).where(and(eq(milestones.userId, userId), eq(milestones.projectId, projectId))); }
export async function createMilestone(data: InsertMilestone): Promise<number> { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(milestones).values(data); return Number(result[0].insertId); }
export async function updateMilestoneForUser(userId: number, id: number, data: Partial<Pick<InsertMilestone, "title" | "dueDate" | "reminderAt" | "completed">>): Promise<void> { const db = await getDb(); if (!db) throw new Error("Database not available"); await db.update(milestones).set(data).where(and(eq(milestones.id, id), eq(milestones.userId, userId))); }
export async function deleteMilestoneForUser(userId: number, id: number): Promise<void> { const db = await getDb(); if (!db) throw new Error("Database not available"); await db.delete(milestones).where(and(eq(milestones.id, id), eq(milestones.userId, userId))); }

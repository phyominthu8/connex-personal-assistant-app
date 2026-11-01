import { boolean, foreignKey, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
      dueLabel: varchar("dueLabel", { length: 64 }).notNull().default("Today"),
      startDate: varchar("startDate", { length: 10 }),
      dueDate: varchar("dueDate", { length: 10 }),
  dueTime: varchar("dueTime", { length: 5 }),
  priority: mysqlEnum("priority", ["Low", "Medium", "High"]).notNull().default("Medium"),
  color: varchar("color", { length: 16 }).notNull().default("#2563EB"),
  project: varchar("project", { length: 255 }).notNull().default("Personal"),
  projectId: int("projectId"),
  milestoneId: int("milestoneId"),
  category: varchar("category", { length: 64 }).notNull().default("General"),
  recurrence: varchar("recurrence", { length: 32 }),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("tasks_user_idx").on(table.userId),
  index("tasks_project_idx").on(table.projectId),
  index("tasks_milestone_idx").on(table.milestoneId),
  index("tasks_user_project_idx").on(table.userId, table.projectId),
  index("tasks_user_milestone_idx").on(table.userId, table.milestoneId),
  foreignKey({ name: "tasks_project_fk", columns: [table.projectId], foreignColumns: [projects.id] }).onDelete("set null"),
  foreignKey({ name: "tasks_milestone_fk", columns: [table.milestoneId], foreignColumns: [milestones.id] }).onDelete("set null"),
]);
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export const alarms = mysqlTable("alarms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId"),
  projectId: int("projectId"),
  title: varchar("title", { length: 255 }).notNull(),
  fireAt: timestamp("fireAt").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("alarms_user_idx").on(table.userId),
  index("alarms_task_idx").on(table.taskId),
  index("alarms_project_idx").on(table.projectId),
  index("alarms_user_project_idx").on(table.userId, table.projectId),
  index("alarms_user_enabled_fire_idx").on(table.userId, table.enabled, table.fireAt),
  foreignKey({ name: "alarms_task_fk", columns: [table.taskId], foreignColumns: [tasks.id] }).onDelete("set null"),
  foreignKey({ name: "alarms_project_fk", columns: [table.projectId], foreignColumns: [projects.id] }).onDelete("set null"),
]);
export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = typeof alarms.$inferInsert;

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: varchar("startDate", { length: 10 }),
  endDate: varchar("endDate", { length: 10 }),
  type: mysqlEnum("type", ["personal", "work", "team", "other"]).notNull().default("personal"),
  status: mysqlEnum("status", ["active", "completed", "on_hold", "archived"]).notNull().default("active"),
  color: varchar("color", { length: 16 }).notNull().default("#4F46E5"),
  icon: varchar("icon", { length: 32 }).notNull().default("folder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("projects_user_idx").on(table.userId),
  index("projects_user_status_idx").on(table.userId, table.status),
]);
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 16 }).notNull().default("#D97706"),
  dueDate: varchar("dueDate", { length: 10 }),
  reminderAt: timestamp("reminderAt"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("milestones_user_idx").on(table.userId),
  index("milestones_project_idx").on(table.projectId),
  index("milestones_user_project_idx").on(table.userId, table.projectId),
  index("milestones_user_due_idx").on(table.userId, table.dueDate),
  foreignKey({ name: "milestones_project_fk", columns: [table.projectId], foreignColumns: [projects.id] }).onDelete("cascade"),
]);
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

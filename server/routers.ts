import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { isValidDateKey, isValidTime } from "../lib/task-date";
import { assertTaskRelationshipIntegrity } from "../lib/task-relationships";
import { transcribeAudio } from "./_core/voiceTranscription";

async function validateAlarmRelationships(userId: number, taskId: number | null | undefined, projectId: number | null | undefined) {
  if (taskId != null && projectId != null) throw new Error("An alarm can reference a task or project, not both");
  if (taskId != null && !(await db.getTaskForUser(userId, taskId))) throw new Error("Task not found");
  if (projectId != null && !(await db.getProjectForUser(userId, projectId))) throw new Error("Project not found");
}

async function validateTaskRelationships(userId: number, projectId: number | null | undefined, milestoneId: number | null | undefined) {
  const project = projectId == null ? undefined : await db.getProjectForUser(userId, projectId);
  const milestone = milestoneId == null ? undefined : await db.getMilestoneForUser(userId, milestoneId);
  assertTaskRelationshipIntegrity({ projectId, milestoneId, ownedProjectId: project?.id, ownedMilestoneProjectId: milestone?.projectId });
  return project;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  voice: router({
    transcribe: publicProcedure
      .input(z.object({ audioBase64: z.string().min(1).max(23_000_000), mimeType: z.string().max(64).default("audio/mp4"), language: z.string().max(16).optional() }))
      .mutation(({ input }) => transcribeAudio({ audioBase64: input.audioBase64, mimeType: input.mimeType, language: input.language })),
  }),

  tasks: router({
    list: protectedProcedure.query(({ ctx }) => db.listTasksForUser(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(1).max(255),
        description: z.string().max(5000).optional(),
        dueLabel: z.string().trim().min(1).max(64).default("Today"),
        startDate: z.string().refine((value) => isValidDateKey(value), "Invalid start date").optional(),
        dueDate: z.string().refine((value) => isValidDateKey(value), "Invalid date"),
        dueTime: z.string().refine((value) => isValidTime(value), "Invalid time").optional(),
        priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
        project: z.string().trim().min(1).max(255).default("Personal"),
        projectId: z.number().int().positive().optional(),
        milestoneId: z.number().int().positive().optional(),
        category: z.string().trim().min(1).max(64).default("General"),
      }))
      .mutation(async ({ ctx, input }) => { const project = await validateTaskRelationships(ctx.user.id, input.projectId, input.milestoneId); return db.createTask({ ...input, project: project?.title || input.project, userId: ctx.user.id }); }),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().trim().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        dueLabel: z.string().trim().min(1).max(64).optional(),
        startDate: z.string().refine((value) => isValidDateKey(value), "Invalid start date").nullable().optional(),
        dueDate: z.string().refine((value) => isValidDateKey(value), "Invalid date").optional(),
        dueTime: z.string().refine((value) => isValidTime(value), "Invalid time").optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
        project: z.string().trim().min(1).max(255).optional(),
        projectId: z.number().int().positive().nullable().optional(),
        milestoneId: z.number().int().positive().nullable().optional(),
        category: z.string().trim().min(1).max(64).optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => { const existing = await db.getTaskForUser(ctx.user.id, input.id); if (!existing) throw new Error("Task not found"); const projectId = input.projectId !== undefined ? input.projectId : existing.projectId; const milestoneId = input.milestoneId !== undefined ? input.milestoneId : existing.milestoneId; const project = await validateTaskRelationships(ctx.user.id, projectId, milestoneId); const { id, ...data } = input; return db.updateTaskForUser(ctx.user.id, id, { ...data, ...(project ? { project: project.title } : {}) }); }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ ctx, input }) => db.deleteTaskForUser(ctx.user.id, input.id)),
  }),
  projects: router({
    list: protectedProcedure.query(({ ctx }) => db.listProjectsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(1).max(255), description: z.string().max(5000).optional(), startDate: z.string().optional(), endDate: z.string().optional(), type: z.enum(["personal", "work", "team", "other"]).default("personal"), status: z.enum(["active", "completed", "on_hold", "archived"]).default("active"), color: z.string().max(16).default("#4F46E5"), icon: z.string().max(32).default("folder") })).mutation(({ ctx, input }) => db.createProject({ ...input, userId: ctx.user.id })),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(1).max(255).optional(), description: z.string().max(5000).optional(), startDate: z.string().optional(), endDate: z.string().optional(), type: z.enum(["personal", "work", "team", "other"]).optional(), status: z.enum(["active", "completed", "on_hold", "archived"]).optional(), color: z.string().max(16).optional(), icon: z.string().max(32).optional() })).mutation(({ ctx, input }) => { const { id, ...data } = input; return db.updateProjectForUser(ctx.user.id, id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteProjectForUser(ctx.user.id, input.id)),
    milestones: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).query(({ ctx, input }) => db.listMilestonesForProject(ctx.user.id, input.projectId)),
    createMilestone: protectedProcedure.input(z.object({ projectId: z.number().int().positive(), title: z.string().trim().min(1).max(255), description: z.string().max(5000).optional(), dueDate: z.string().optional(), reminderAt: z.coerce.date().optional(), completed: z.boolean().default(false) })).mutation(async ({ ctx, input }) => { const project = await db.getProjectForUser(ctx.user.id, input.projectId); if (!project) throw new Error("Project not found"); return db.createMilestone({ ...input, userId: ctx.user.id }); }),
    updateMilestone: protectedProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(1).max(255).optional(), description: z.string().max(5000).optional(), dueDate: z.string().optional(), reminderAt: z.coerce.date().optional(), completed: z.boolean().optional() })).mutation(({ ctx, input }) => { const { id, ...data } = input; return db.updateMilestoneForUser(ctx.user.id, id, data); }),
    deleteMilestone: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteMilestoneForUser(ctx.user.id, input.id)),
  }),
  alarms: router({
    list: protectedProcedure.query(({ ctx }) => db.listAlarmsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(1).max(255), taskId: z.number().int().positive().optional(), projectId: z.number().int().positive().optional(), fireAt: z.coerce.date(), enabled: z.boolean().default(true) })).mutation(async ({ ctx, input }) => { await validateAlarmRelationships(ctx.user.id, input.taskId, input.projectId); return db.createAlarm({ ...input, userId: ctx.user.id }); }),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(1).max(255).optional(), taskId: z.number().int().positive().nullable().optional(), projectId: z.number().int().positive().nullable().optional(), fireAt: z.coerce.date().optional(), enabled: z.boolean().optional() })).mutation(async ({ ctx, input }) => { const existing = await db.getAlarmForUser(ctx.user.id, input.id); if (!existing) throw new Error("Alarm not found"); const taskId = input.taskId !== undefined ? input.taskId : existing.taskId; const projectId = input.projectId !== undefined ? input.projectId : existing.projectId; await validateAlarmRelationships(ctx.user.id, taskId, projectId); const { id, ...data } = input; return db.updateAlarmForUser(ctx.user.id, id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteAlarmForUser(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

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

  tasks: router({
    list: protectedProcedure.query(({ ctx }) => db.listTasksForUser(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(1).max(255),
        description: z.string().max(5000).optional(),
        dueLabel: z.string().trim().min(1).max(64).default("Today"),
        priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
        project: z.string().trim().min(1).max(255).default("Personal"),
      }))
      .mutation(({ ctx, input }) => db.createTask({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().trim().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        dueLabel: z.string().trim().min(1).max(64).optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
        project: z.string().trim().min(1).max(255).optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateTaskForUser(ctx.user.id, id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ ctx, input }) => db.deleteTaskForUser(ctx.user.id, input.id)),
  }),
});

export type AppRouter = typeof appRouter;

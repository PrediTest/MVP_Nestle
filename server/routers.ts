import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Routers de funcionalidades
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await import("./db");
      return db.getProjectsByUser(ctx.user.id);
    }),
    listAll: protectedProcedure.query(async () => {
      const db = await import("./db");
      return db.getAllProjects();
    }),
    getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const db = await import("./db");
      return db.getProjectById(input.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          productType: z.string().optional(),
          factory: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db");
        return db.createProject({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["planning", "testing", "completed", "cancelled"]).optional(),
          riskScore: z.string().optional(),
          successProbability: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        const { id, ...data } = input;
        return db.updateProject(id, data);
      }),
  }),

  manufacturing: router({
    listByProject: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ input }) => {
      const db = await import("./db");
      return db.getManufacturingDataByProject(input.projectId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          projectId: z.string(),
          factory: z.string(),
          productionLine: z.string().optional(),
          downtime: z.string().optional(),
          efficiency: z.string().optional(),
          qualityScore: z.string().optional(),
          defectRate: z.string().optional(),
          throughput: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.createManufacturingData(input);
      }),
  }),

  standards: router({
    list: protectedProcedure.query(async () => {
      const db = await import("./db");
      return db.getAllStandards();
    }),
    listByType: protectedProcedure
      .input(z.object({ type: z.enum(["nestle", "iso", "fda", "other"]) }))
      .query(async ({ input }) => {
        const db = await import("./db");
        return db.getStandardsByType(input.type);
      }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          code: z.string(),
          title: z.string(),
          description: z.string().optional(),
          type: z.enum(["nestle", "iso", "fda", "other"]),
          category: z.string().optional(),
          content: z.string().optional(),
          version: z.string().optional(),
          effectiveDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.createStandard(input);
      }),
  }),

  complaints: router({
    list: protectedProcedure.query(async () => {
      const db = await import("./db");
      return db.getAllComplaints();
    }),
    listByProduct: protectedProcedure.input(z.object({ productId: z.string() })).query(async ({ input }) => {
      const db = await import("./db");
      return db.getComplaintsByProduct(input.productId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          productId: z.string().optional(),
          productName: z.string().optional(),
          category: z.string().optional(),
          description: z.string().optional(),
          sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
          severity: z.enum(["low", "medium", "high", "critical"]).optional(),
          source: z.string().optional(),
          reportedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.createComplaint(input);
      }),
  }),

  predictions: router({
    listByProject: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ input }) => {
      const db = await import("./db");
      return db.getPredictionsByProject(input.projectId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          projectId: z.string(),
          modelVersion: z.string().optional(),
          riskScore: z.string().optional(),
          successProbability: z.string().optional(),
          failureFactors: z.string().optional(),
          recommendations: z.string().optional(),
          confidence: z.string().optional(),
          metrics: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.createPrediction(input);
      }),
    generatePrediction: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(async ({ input }) => {
        // Simulação de predição com ML
        const riskScore = Math.floor(Math.random() * 100).toString();
        const successProbability = (100 - parseInt(riskScore)).toString();
        const confidence = (85 + Math.floor(Math.random() * 15)).toString();
        
        const failureFactors = JSON.stringify([
          "Histórico de falhas em linha de produção similar",
          "Reclamações de consumidores sobre produtos relacionados",
          "Desvios em standards de qualidade"
        ]);
        
        const recommendations = JSON.stringify([
          "Realizar testes adicionais na linha de produção",
          "Revisar conformidade com standards ISO 9001",
          "Aumentar inspeção de qualidade em 20%"
        ]);
        
        const metrics = JSON.stringify({
          f1Score: 0.87,
          aucRoc: 0.92,
          precision: 0.89,
          recall: 0.85
        });
        
        const db = await import("./db");
        return db.createPrediction({
          id: `pred_${Date.now()}`,
          projectId: input.projectId,
          modelVersion: "v1.0.0",
          riskScore,
          successProbability,
          failureFactors,
          recommendations,
          confidence,
          metrics,
        });
      }),
  }),

  alerts: router({
    listByProject: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ input }) => {
      const db = await import("./db");
      return db.getAlertsByProject(input.projectId);
    }),
    listActive: protectedProcedure.query(async () => {
      const db = await import("./db");
      return db.getActiveAlerts();
    }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          projectId: z.string(),
          type: z.enum(["risk", "compliance", "quality", "timeline"]),
          severity: z.enum(["info", "warning", "error", "critical"]),
          title: z.string(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.createAlert(input);
      }),
    acknowledge: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db");
        return db.updateAlert(input.id, {
          status: "acknowledged",
          acknowledgedBy: ctx.user.id,
          acknowledgedAt: new Date(),
        });
      }),
  }),

  reports: router({
    listByProject: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ input }) => {
      const db = await import("./db");
      return db.getReportsByProject(input.projectId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          projectId: z.string(),
          title: z.string(),
          type: z.enum(["risk_analysis", "compliance", "performance", "summary"]),
          format: z.enum(["pdf", "excel", "json"]).optional(),
          content: z.string().optional(),
          fileUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db");
        return db.createReport({
          ...input,
          generatedBy: ctx.user.id,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;

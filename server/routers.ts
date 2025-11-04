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

  // Router de Análise de Sentimento em Redes Sociais
  sentiment: router({
    // Listar contas de redes sociais
    listAccounts: protectedProcedure.query(async () => {
      const db = await import("./db");
      return db.getSocialMediaAccounts();
    }),
    
    // Criar conta de rede social
    createAccount: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site"]),
          accountName: z.string(),
          accountUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.createSocialMediaAccount({
          ...input,
          isActive: "yes",
        });
      }),
    
    // Coletar posts de uma plataforma
    collectPosts: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site"]),
          accountName: z.string(),
          keywords: z.array(z.string()),
          limit: z.number().default(50),
        })
      )
      .mutation(async ({ input }) => {
        const socialMedia = await import("./socialMediaIntegration");
        const db = await import("./db");
        
        let posts: any[] = [];
        
        // Coletar posts baseado na plataforma
        switch (input.platform) {
          case "instagram":
            posts = await socialMedia.collectInstagramPosts(input.accountName, input.keywords, input.limit);
            break;
          case "facebook":
            posts = await socialMedia.collectFacebookPosts(input.accountName, input.keywords, input.limit);
            break;
          case "tiktok":
            posts = await socialMedia.collectTikTokPosts(input.accountName, input.keywords, input.limit);
            break;
          case "twitter":
            posts = await socialMedia.collectTwitterPosts(input.keywords.join(" "), input.limit);
            break;
          case "reclameaqui":
            posts = await socialMedia.collectReclameAquiComplaints(input.accountName, input.limit);
            break;
          case "nestle_site":
            posts = await socialMedia.collectNestleSiteComments(input.accountName, input.limit);
            break;
        }
        
        // Salvar posts no banco
        const savedPosts = [];
        for (const post of posts) {
          const engagement = socialMedia.calculateEngagement(post);
          const saved = await db.createSocialMediaPost({
            id: post.postId,
            accountId: input.accountName,
            projectId: input.projectId,
            platform: input.platform,
            postId: post.postId,
            author: post.author,
            content: post.content,
            url: post.url,
            likes: post.likes.toString(),
            comments: post.comments.toString(),
            shares: post.shares.toString(),
            engagement: engagement.toFixed(2),
            publishedAt: post.publishedAt,
          });
          savedPosts.push(saved);
        }
        
        return {
          success: true,
          postsCollected: savedPosts.length,
          posts: savedPosts,
        };
      }),
    
    // Analisar sentimento de posts
    analyzePosts: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          postIds: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        const analyzer = await import("./sentimentAnalyzer");
        
        // Obter posts
        let posts;
        if (input.postIds && input.postIds.length > 0) {
          // Analisar posts específicos
          posts = await Promise.all(
            input.postIds.map(id => db.getPostsByProject(input.projectId))
          );
          posts = posts.flat().filter(p => input.postIds!.includes(p.id));
        } else {
          // Analisar todos os posts do projeto
          posts = await db.getPostsByProject(input.projectId);
        }
        
        // Analisar sentimento de cada post
        const analyses = [];
        for (const post of posts) {
          const analysis = await analyzer.analyzeSentiment(post.content || "");
          
          const saved = await db.createSentimentAnalysis({
            id: `sentiment_${post.id}_${Date.now()}`,
            postId: post.id,
            projectId: input.projectId,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore.toString(),
            confidence: analysis.confidence.toString(),
            keywords: JSON.stringify(analysis.keywords),
            topics: JSON.stringify(analysis.topics),
            emotions: JSON.stringify(analysis.emotions),
            language: analysis.language,
            modelVersion: "gpt-4o",
          });
          
          analyses.push(saved);
        }
        
        // Calcular resumo
        const summary = analyzer.calculateSentimentSummary(
          analyses.map(a => ({
            sentiment: a.sentiment,
            sentimentScore: parseFloat(a.sentimentScore || "0"),
            confidence: parseFloat(a.confidence || "0"),
            keywords: JSON.parse(a.keywords || "[]"),
            topics: JSON.parse(a.topics || "[]"),
            emotions: JSON.parse(a.emotions || "{}"),
            language: a.language || "pt",
          }))
        );
        
        return {
          success: true,
          analyzed: analyses.length,
          summary,
        };
      }),
    
    // Obter análises de sentimento por projeto
    getByProject: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        const db = await import("./db");
        return db.getSentimentsByProject(input.projectId);
      }),
    
    // Obter resumo de sentimento por projeto
    getSummary: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        const db = await import("./db");
        const analyses = await db.getSentimentsByProject(input.projectId);
        const analyzer = await import("./sentimentAnalyzer");
        
        return analyzer.calculateSentimentSummary(
          analyses.map(a => ({
            sentiment: a.sentiment,
            sentimentScore: parseFloat(a.sentimentScore || "0"),
            confidence: parseFloat(a.confidence || "0"),
            keywords: JSON.parse(a.keywords || "[]"),
            topics: JSON.parse(a.topics || "[]"),
            emotions: JSON.parse(a.emotions || "{}"),
            language: a.language || "pt",
          }))
        );
      }),
    
    // Obter posts por projeto
    getPostsByProject: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        const db = await import("./db");
        return db.getPostsByProject(input.projectId);
      }),
    
    // Obter posts por plataforma
    getPostsByPlatform: protectedProcedure
      .input(
        z.object({
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site"]),
        })
      )
      .query(async ({ input }) => {
        const db = await import("./db");
        return db.getPostsByPlatform(input.platform);
      }),
    
    // Coletar e analisar de todas as plataformas
    collectAndAnalyzeAll: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          config: z.object({
            instagram: z.object({ account: z.string(), keywords: z.array(z.string()) }).optional(),
            facebook: z.object({ pageId: z.string(), keywords: z.array(z.string()) }).optional(),
            tiktok: z.object({ username: z.string(), keywords: z.array(z.string()) }).optional(),
            twitter: z.object({ query: z.string() }).optional(),
            reclameaqui: z.object({ company: z.string() }).optional(),
            nestleSite: z.object({ productUrl: z.string() }).optional(),
          }),
          limit: z.number().default(50),
        })
      )
      .mutation(async ({ input }) => {
        const socialMedia = await import("./socialMediaIntegration");
        const db = await import("./db");
        const analyzer = await import("./sentimentAnalyzer");
        
        // Coletar posts de todas as plataformas
        const allPosts = await socialMedia.collectAllPlatforms(input.config, input.limit);
        
        // Salvar posts no banco
        const savedPosts = [];
        for (const post of allPosts) {
          const engagement = socialMedia.calculateEngagement(post);
          const saved = await db.createSocialMediaPost({
            id: post.postId,
            accountId: post.author,
            projectId: input.projectId,
            platform: post.platform,
            postId: post.postId,
            author: post.author,
            content: post.content,
            url: post.url,
            likes: post.likes.toString(),
            comments: post.comments.toString(),
            shares: post.shares.toString(),
            engagement: engagement.toFixed(2),
            publishedAt: post.publishedAt,
          });
          savedPosts.push(saved);
        }
        
        // Analisar sentimento de todos os posts
        const analyses = [];
        for (const post of savedPosts) {
          const analysis = await analyzer.analyzeSentiment(post.content || "");
          
          const saved = await db.createSentimentAnalysis({
            id: `sentiment_${post.id}_${Date.now()}`,
            postId: post.id,
            projectId: input.projectId,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore.toString(),
            confidence: analysis.confidence.toString(),
            keywords: JSON.stringify(analysis.keywords),
            topics: JSON.stringify(analysis.topics),
            emotions: JSON.stringify(analysis.emotions),
            language: analysis.language,
            modelVersion: "gpt-4o",
          });
          
          analyses.push(saved);
        }
        
        // Calcular resumo
        const summary = analyzer.calculateSentimentSummary(
          analyses.map(a => ({
            sentiment: a.sentiment,
            sentimentScore: parseFloat(a.sentimentScore || "0"),
            confidence: parseFloat(a.confidence || "0"),
            keywords: JSON.parse(a.keywords || "[]"),
            topics: JSON.parse(a.topics || "[]"),
            emotions: JSON.parse(a.emotions || "{}"),
            language: a.language || "pt",
          }))
        );
        
        // Salvar resumo no banco
        const platforms = ["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site"] as const;
        for (const platform of platforms) {
          const platformPosts = savedPosts.filter(p => p.platform === platform);
          if (platformPosts.length > 0) {
            const platformAnalyses = analyses.filter(a => 
              platformPosts.some(p => p.id === a.postId)
            );
            
            const platformSummary = analyzer.calculateSentimentSummary(
              platformAnalyses.map(a => ({
                sentiment: a.sentiment,
                sentimentScore: parseFloat(a.sentimentScore || "0"),
                confidence: parseFloat(a.confidence || "0"),
                keywords: JSON.parse(a.keywords || "[]"),
                topics: JSON.parse(a.topics || "[]"),
                emotions: JSON.parse(a.emotions || "{}"),
                language: a.language || "pt",
              }))
            );
            
            await db.createSentimentSummary({
              id: `summary_${input.projectId}_${platform}_${Date.now()}`,
              projectId: input.projectId,
              platform,
              period: "monthly",
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              endDate: new Date(),
              totalPosts: platformSummary.totalPosts.toString(),
              veryPositiveCount: platformSummary.veryPositiveCount.toString(),
              positiveCount: platformSummary.positiveCount.toString(),
              neutralCount: platformSummary.neutralCount.toString(),
              negativeCount: platformSummary.negativeCount.toString(),
              veryNegativeCount: platformSummary.veryNegativeCount.toString(),
              averageSentiment: platformSummary.averageSentiment.toFixed(2),
              totalEngagement: platformPosts.reduce((sum, p) => sum + parseFloat(p.engagement || "0"), 0).toString(),
              topKeywords: JSON.stringify(platformSummary.topKeywords),
              topTopics: JSON.stringify(platformSummary.topTopics),
            });
          }
        }
        
        return {
          success: true,
          postsCollected: savedPosts.length,
          analyzed: analyses.length,
          summary,
        };
      }),
  }),

  // Router de Administração de Keywords e Topics
  admin: router({
    // ==================== KEYWORDS ====================
    
    // Listar keywords
    listKeywords: protectedProcedure
      .input(z.object({ projectId: z.string().optional() }))
      .query(async ({ input }) => {
        const db = await import("./db");
        return db.getMonitoredKeywords(input.projectId);
      }),
    
    // Criar keyword
    createKeyword: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          projectId: z.string().optional(),
          keyword: z.string(),
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).default("all"),
          category: z.string().optional(),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db");
        return db.createMonitoredKeyword({
          ...input,
          isActive: "yes",
          createdBy: ctx.user.id,
        });
      }),
    
    // Atualizar keyword
    updateKeyword: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          keyword: z.string().optional(),
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).optional(),
          isActive: z.enum(["yes", "no"]).optional(),
          category: z.string().optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        const { id, ...data } = input;
        return db.updateMonitoredKeyword(id, data);
      }),
    
    // Deletar keyword
    deleteKeyword: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.deleteMonitoredKeyword(input.id);
      }),
    
    // ==================== TOPICS ====================
    
    // Listar topics
    listTopics: protectedProcedure
      .input(z.object({ projectId: z.string().optional() }))
      .query(async ({ input }) => {
        const db = await import("./db");
        return db.getMonitoredTopics(input.projectId);
      }),
    
    // Criar topic
    createTopic: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          projectId: z.string().optional(),
          topic: z.string(),
          description: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).default("all"),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db");
        const { keywords, ...rest } = input;
        return db.createMonitoredTopic({
          ...rest,
          keywords: keywords ? JSON.stringify(keywords) : null,
          isActive: "yes",
          createdBy: ctx.user.id,
        });
      }),
    
    // Atualizar topic
    updateTopic: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          topic: z.string().optional(),
          description: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          platform: z.enum(["instagram", "facebook", "tiktok", "twitter", "reclameaqui", "nestle_site", "all"]).optional(),
          isActive: z.enum(["yes", "no"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await import("./db");
        const { id, keywords, ...data } = input;
        return db.updateMonitoredTopic(id, {
          ...data,
          keywords: keywords ? JSON.stringify(keywords) : undefined,
        });
      }),
    
    // Deletar topic
    deleteTopic: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const db = await import("./db");
        return db.deleteMonitoredTopic(input.id);
      }),
  }),



});

export type AppRouter = typeof appRouter;


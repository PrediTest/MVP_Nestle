import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../../routers";
import {
  createNestleUser,
  createUnileverUser,
  createBRFUser,
  createMockContext,
  TEST_RESOURCES,
} from "../helpers/testHelpers";

describe("Projects - Isolamento de Dados Multi-Tenant", () => {
  const nestleUser = createNestleUser();
  const unileverUser = createUnileverUser();
  const brfUser = createBRFUser();

  describe("projects.list - Listar projetos", () => {
    it("Usuário Nestlé deve ver apenas projetos da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const projects = await caller.projects.list();

      // Todos os projetos devem ser da Nestlé
      expect(projects.length).toBeGreaterThan(0);
      projects.forEach((project) => {
        expect(project.companyId).toBe("nestle_brasil");
      });
    });

    it("Usuário Unilever deve ver apenas projetos da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const projects = await caller.projects.list();

      // Todos os projetos devem ser da Unilever
      expect(projects.length).toBeGreaterThan(0);
      projects.forEach((project) => {
        expect(project.companyId).toBe("unilever_brasil");
      });
    });

    it("Usuário BRF deve ver apenas projetos da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));
      const projects = await caller.projects.list();

      // Todos os projetos devem ser da BRF
      expect(projects.length).toBeGreaterThan(0);
      projects.forEach((project) => {
        expect(project.companyId).toBe("brf_brasil");
      });
    });

    it("Usuário Nestlé NÃO deve ver projetos da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const projects = await caller.projects.list();

      const unileverProjects = projects.filter(
        (p) => p.companyId === "unilever_brasil"
      );
      expect(unileverProjects.length).toBe(0);
    });

    it("Usuário Unilever NÃO deve ver projetos da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const projects = await caller.projects.list();

      const brfProjects = projects.filter((p) => p.companyId === "brf_brasil");
      expect(brfProjects.length).toBe(0);
    });
  });

  describe("projects.getById - Buscar projeto específico", () => {
    it("Usuário Nestlé pode acessar projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const project = await caller.projects.getById({
        id: TEST_RESOURCES.nestle.projectId,
      });

      expect(project).toBeDefined();
      expect(project?.companyId).toBe("nestle_brasil");
    });

    it("Usuário Nestlé NÃO pode acessar projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const project = await caller.projects.getById({
        id: TEST_RESOURCES.unilever.projectId,
      });

      // Deve retornar undefined ou null (não encontrado)
      expect(project).toBeUndefined();
    });

    it("Usuário Unilever NÃO pode acessar projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const project = await caller.projects.getById({
        id: TEST_RESOURCES.brf.projectId,
      });

      expect(project).toBeUndefined();
    });

    it("Usuário BRF NÃO pode acessar projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));
      const project = await caller.projects.getById({
        id: TEST_RESOURCES.nestle.projectId,
      });

      expect(project).toBeUndefined();
    });
  });

  describe("projects.create - Criar novo projeto", () => {
    it("Projeto criado por Nestlé deve ter companyId da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const newProject = await caller.projects.create({
        id: `proj_nestle_test_${Date.now()}`,
        name: "Projeto Teste Nestlé",
        description: "Teste de isolamento",
        productType: "Teste",
        factory: "Teste Factory",
      });

      expect(newProject.companyId).toBe("nestle_brasil");
    });

    it("Projeto criado por Unilever deve ter companyId da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const newProject = await caller.projects.create({
        id: `proj_unilever_test_${Date.now()}`,
        name: "Projeto Teste Unilever",
        description: "Teste de isolamento",
        productType: "Teste",
        factory: "Teste Factory",
      });

      expect(newProject.companyId).toBe("unilever_brasil");
    });
  });

  describe("projects.update - Atualizar projeto", () => {
    it("Usuário Nestlé pode atualizar projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      
      // Primeiro buscar um projeto existente
      const projects = await caller.projects.list();
      const nestleProject = projects[0];

      if (nestleProject) {
        const updated = await caller.projects.update({
          id: nestleProject.id,
          name: "Projeto Atualizado",
        });

        expect(updated.name).toBe("Projeto Atualizado");
        expect(updated.companyId).toBe("nestle_brasil");
      }
    });

    it("Usuário Nestlé NÃO pode atualizar projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      // Tentar atualizar projeto da Unilever deve falhar
      await expect(
        caller.projects.update({
          id: TEST_RESOURCES.unilever.projectId,
          name: "Tentativa de Hack",
        })
      ).rejects.toThrow();
    });
  });

  describe("projects.delete - Deletar projeto", () => {
    it("Usuário Nestlé NÃO pode deletar projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      // Tentar deletar projeto da Unilever deve falhar
      await expect(
        caller.projects.delete({
          id: TEST_RESOURCES.unilever.projectId,
        })
      ).rejects.toThrow();
    });

    it("Usuário Unilever NÃO pode deletar projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      await expect(
        caller.projects.delete({
          id: TEST_RESOURCES.brf.projectId,
        })
      ).rejects.toThrow();
    });
  });
});


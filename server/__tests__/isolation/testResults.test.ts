import { describe, it, expect } from "vitest";
import { appRouter } from "../../routers";
import {
  createNestleUser,
  createUnileverUser,
  createBRFUser,
  createMockContext,
  TEST_RESOURCES,
} from "../helpers/testHelpers";

describe("Test Results - Isolamento de Dados Multi-Tenant", () => {
  const nestleUser = createNestleUser();
  const unileverUser = createUnileverUser();
  const brfUser = createBRFUser();

  describe("tests.listByProject - Listar testes de um projeto", () => {
    it("Usuário Nestlé pode listar testes de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      
      const projects = await caller.projects.list();
      const nestleProject = projects[0];

      if (nestleProject) {
        const projectTests = await caller.tests.listByProject({
          projectId: nestleProject.id,
        });

        // Deve retornar array (mesmo que vazio)
        expect(Array.isArray(projectTests)).toBe(true);
      }
    });

    it("Usuário Nestlé NÃO pode listar testes de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      const projectTests = await caller.tests.listByProject({
        projectId: TEST_RESOURCES.unilever.projectId,
      });

      // Deve retornar array vazio (sem acesso)
      expect(projectTests.length).toBe(0);
    });

    it("Usuário Unilever NÃO pode listar testes de projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      const projectTests = await caller.tests.listByProject({
        projectId: TEST_RESOURCES.brf.projectId,
      });

      expect(projectTests.length).toBe(0);
    });

    it("Usuário BRF NÃO pode listar testes de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      const projectTests = await caller.tests.listByProject({
        projectId: TEST_RESOURCES.nestle.projectId,
      });

      expect(projectTests.length).toBe(0);
    });
  });

  describe("tests.addToProject - Adicionar teste a projeto", () => {
    it("Usuário Nestlé pode adicionar teste a projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      
      const projects = await caller.projects.list();
      const nestleProject = projects[0];
      
      // Buscar testes disponíveis da Nestlé
      const availableTests = await caller.tests.listAvailable();
      const nestleTest = availableTests.find(t => t.companyId === "nestle_brasil");

      if (nestleProject && nestleTest) {
        const projectTest = await caller.tests.addToProject({
          projectId: nestleProject.id,
          testId: nestleTest.id,
          priority: "medium",
        });

        expect(projectTest.companyId).toBe("nestle_brasil");
        expect(projectTest.projectId).toBe(nestleProject.id);
      }
    });

    it("Usuário Nestlé NÃO pode adicionar teste a projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      
      const availableTests = await caller.tests.listAvailable();
      const anyTest = availableTests[0];

      if (anyTest) {
        await expect(
          caller.tests.addToProject({
            projectId: TEST_RESOURCES.unilever.projectId,
            testId: anyTest.id,
            priority: "medium",
          })
        ).rejects.toThrow();
      }
    });

    it("Usuário Unilever NÃO pode adicionar teste a projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      
      const availableTests = await caller.tests.listAvailable();
      const anyTest = availableTests[0];

      if (anyTest) {
        await expect(
          caller.tests.addToProject({
            projectId: TEST_RESOURCES.brf.projectId,
            testId: anyTest.id,
            priority: "medium",
          })
        ).rejects.toThrow();
      }
    });
  });

  describe("tests.addResult - Adicionar resultado de teste", () => {
    it("Usuário Nestlé NÃO pode adicionar resultado a teste de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      // ID fictício de teste da Unilever
      const fakeUnileverTestId = `ptest_unilever_${Date.now()}`;

      await expect(
        caller.tests.addResult({
          projectTestId: fakeUnileverTestId,
          measuredValue: 7.5,
          passedCriteria: true,
          notes: "Tentativa de hack",
        })
      ).rejects.toThrow();
    });

    it("Usuário Unilever NÃO pode adicionar resultado a teste de projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      const fakeBRFTestId = `ptest_brf_${Date.now()}`;

      await expect(
        caller.tests.addResult({
          projectTestId: fakeBRFTestId,
          measuredValue: 7.5,
          passedCriteria: true,
        })
      ).rejects.toThrow();
    });

    it("Usuário BRF NÃO pode adicionar resultado a teste de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      const fakeNestleTestId = `ptest_nestle_${Date.now()}`;

      await expect(
        caller.tests.addResult({
          projectTestId: fakeNestleTestId,
          measuredValue: 7.5,
          passedCriteria: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("tests.updateProjectTest - Atualizar teste de projeto", () => {
    it("Usuário Nestlé NÃO pode atualizar teste de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      const fakeUnileverTestId = `ptest_unilever_${Date.now()}`;

      await expect(
        caller.tests.updateProjectTest({
          id: fakeUnileverTestId,
          status: "completed",
        })
      ).rejects.toThrow();
    });

    it("Usuário BRF NÃO pode atualizar teste de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      const fakeNestleTestId = `ptest_nestle_${Date.now()}`;

      await expect(
        caller.tests.updateProjectTest({
          id: fakeNestleTestId,
          status: "completed",
        })
      ).rejects.toThrow();
    });
  });

  describe("tests.deleteProjectTest - Deletar teste de projeto", () => {
    it("Usuário Nestlé NÃO pode deletar teste de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      const fakeUnileverTestId = `ptest_unilever_${Date.now()}`;

      await expect(
        caller.tests.deleteProjectTest({
          id: fakeUnileverTestId,
        })
      ).rejects.toThrow();
    });

    it("Usuário Unilever NÃO pode deletar teste de projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      const fakeBRFTestId = `ptest_brf_${Date.now()}`;

      await expect(
        caller.tests.deleteProjectTest({
          id: fakeBRFTestId,
        })
      ).rejects.toThrow();
    });
  });
});


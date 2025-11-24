import { describe, it, expect } from "vitest";
import { appRouter } from "../../routers";
import {
  createNestleUser,
  createUnileverUser,
  createBRFUser,
  createMockContext,
  TEST_RESOURCES,
} from "../helpers/testHelpers";

describe("Available Tests - Isolamento de Dados Multi-Tenant", () => {
  const nestleUser = createNestleUser();
  const unileverUser = createUnileverUser();
  const brfUser = createBRFUser();

  describe("availableTests.list - Listar testes disponíveis", () => {
    it("Usuário Nestlé deve ver apenas testes da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const tests = await caller.availableTests.list();

      expect(tests.length).toBeGreaterThan(0);
      tests.forEach((test) => {
        expect(test.companyId).toBe("nestle_brasil");
      });
    });

    it("Usuário Unilever deve ver apenas testes da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const tests = await caller.availableTests.list();

      expect(tests.length).toBeGreaterThan(0);
      tests.forEach((test) => {
        expect(test.companyId).toBe("unilever_brasil");
      });
    });

    it("Usuário BRF deve ver apenas testes da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));
      const tests = await caller.availableTests.list();

      expect(tests.length).toBeGreaterThan(0);
      tests.forEach((test) => {
        expect(test.companyId).toBe("brf_brasil");
      });
    });

    it("Usuário Nestlé NÃO deve ver testes da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const tests = await caller.availableTests.list();

      const unileverTests = tests.filter(
        (t) => t.companyId === "unilever_brasil"
      );
      expect(unileverTests.length).toBe(0);
    });
  });

  describe("availableTests.getById - Buscar teste específico", () => {
    it("Usuário Nestlé pode acessar teste da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const test = await caller.availableTests.getById({
        id: TEST_RESOURCES.nestle.testId,
      });

      expect(test).toBeDefined();
      expect(test?.companyId).toBe("nestle_brasil");
    });

    it("Usuário Nestlé NÃO pode acessar teste da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const test = await caller.availableTests.getById({
        id: TEST_RESOURCES.unilever.testId,
      });

      expect(test).toBeUndefined();
    });

    it("Usuário Unilever NÃO pode acessar teste da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const test = await caller.availableTests.getById({
        id: TEST_RESOURCES.brf.testId,
      });

      expect(test).toBeUndefined();
    });
  });

  describe("availableTests.create - Criar novo teste", () => {
    it("Teste criado por Nestlé deve ter companyId da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const newTest = await caller.availableTests.create({
        id: `test_nestle_test_${Date.now()}`,
        name: "Teste Isolamento Nestlé",
        category: "Teste",
        description: "Teste de isolamento",
        duration: 1,
        cost: "100.00",
      });

      expect(newTest.companyId).toBe("nestle_brasil");
    });

    it("Teste criado por BRF deve ter companyId da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));
      const newTest = await caller.availableTests.create({
        id: `test_brf_test_${Date.now()}`,
        name: "Teste Isolamento BRF",
        category: "Teste",
        description: "Teste de isolamento",
        duration: 1,
        cost: "100.00",
      });

      expect(newTest.companyId).toBe("brf_brasil");
    });
  });

  describe("availableTests.update - Atualizar teste", () => {
    it("Usuário Nestlé NÃO pode atualizar teste da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      await expect(
        caller.availableTests.update({
          id: TEST_RESOURCES.unilever.testId,
          name: "Tentativa de Hack",
        })
      ).rejects.toThrow();
    });

    it("Usuário BRF NÃO pode atualizar teste da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      await expect(
        caller.availableTests.update({
          id: TEST_RESOURCES.nestle.testId,
          name: "Tentativa de Hack",
        })
      ).rejects.toThrow();
    });
  });

  describe("availableTests.delete - Deletar teste", () => {
    it("Usuário Unilever NÃO pode deletar teste da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      await expect(
        caller.availableTests.delete({
          id: TEST_RESOURCES.brf.testId,
        })
      ).rejects.toThrow();
    });

    it("Usuário Nestlé NÃO pode deletar teste da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      await expect(
        caller.availableTests.delete({
          id: TEST_RESOURCES.unilever.testId,
        })
      ).rejects.toThrow();
    });
  });
});


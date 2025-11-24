import { describe, it, expect } from "vitest";
import { appRouter } from "../../routers";
import {
  createNestleUser,
  createUnileverUser,
  createBRFUser,
  createMockContext,
  TEST_RESOURCES,
} from "../helpers/testHelpers";

describe("Standards - Isolamento de Dados Multi-Tenant", () => {
  const nestleUser = createNestleUser();
  const unileverUser = createUnileverUser();
  const brfUser = createBRFUser();

  describe("standards.list - Listar standards", () => {
    it("Usuário Nestlé deve ver apenas standards da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const standards = await caller.standards.list();

      expect(standards.length).toBeGreaterThan(0);
      standards.forEach((standard) => {
        expect(standard.companyId).toBe("nestle_brasil");
      });
    });

    it("Usuário Unilever deve ver apenas standards da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const standards = await caller.standards.list();

      expect(standards.length).toBeGreaterThan(0);
      standards.forEach((standard) => {
        expect(standard.companyId).toBe("unilever_brasil");
      });
    });

    it("Usuário BRF deve ver apenas standards da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));
      const standards = await caller.standards.list();

      expect(standards.length).toBeGreaterThan(0);
      standards.forEach((standard) => {
        expect(standard.companyId).toBe("brf_brasil");
      });
    });

    it("Usuário Nestlé NÃO deve ver standards da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const standards = await caller.standards.list();

      const unileverStandards = standards.filter(
        (s) => s.companyId === "unilever_brasil"
      );
      expect(unileverStandards.length).toBe(0);
    });
  });

  describe("standards.getById - Buscar standard específico", () => {
    it("Usuário Nestlé pode acessar standard da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const standard = await caller.standards.getById({
        id: TEST_RESOURCES.nestle.standardId,
      });

      expect(standard).toBeDefined();
      expect(standard?.companyId).toBe("nestle_brasil");
    });

    it("Usuário Nestlé NÃO pode acessar standard da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const standard = await caller.standards.getById({
        id: TEST_RESOURCES.unilever.standardId,
      });

      expect(standard).toBeUndefined();
    });

    it("Usuário Unilever NÃO pode acessar standard da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const standard = await caller.standards.getById({
        id: TEST_RESOURCES.brf.standardId,
      });

      expect(standard).toBeUndefined();
    });
  });

  describe("standards.create - Criar novo standard", () => {
    it("Standard criado por Nestlé deve ter companyId da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      const newStandard = await caller.standards.create({
        id: `std_nestle_test_${Date.now()}`,
        code: "TEST-001",
        title: "Standard Teste Nestlé",
        description: "Teste de isolamento",
        type: "company",
        category: "Teste",
      });

      expect(newStandard.companyId).toBe("nestle_brasil");
    });

    it("Standard criado por Unilever deve ter companyId da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));
      const newStandard = await caller.standards.create({
        id: `std_unilever_test_${Date.now()}`,
        code: "TEST-002",
        title: "Standard Teste Unilever",
        description: "Teste de isolamento",
        type: "company",
        category: "Teste",
      });

      expect(newStandard.companyId).toBe("unilever_brasil");
    });
  });

  describe("standards.update - Atualizar standard", () => {
    it("Usuário Nestlé NÃO pode atualizar standard da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      await expect(
        caller.standards.update({
          id: TEST_RESOURCES.unilever.standardId,
          title: "Tentativa de Hack",
        })
      ).rejects.toThrow();
    });

    it("Usuário Unilever NÃO pode atualizar standard da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      await expect(
        caller.standards.update({
          id: TEST_RESOURCES.brf.standardId,
          title: "Tentativa de Hack",
        })
      ).rejects.toThrow();
    });
  });

  describe("standards.delete - Deletar standard", () => {
    it("Usuário Nestlé NÃO pode deletar standard da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      await expect(
        caller.standards.delete({
          id: TEST_RESOURCES.unilever.standardId,
        })
      ).rejects.toThrow();
    });

    it("Usuário BRF NÃO pode deletar standard da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      await expect(
        caller.standards.delete({
          id: TEST_RESOURCES.nestle.standardId,
        })
      ).rejects.toThrow();
    });
  });
});


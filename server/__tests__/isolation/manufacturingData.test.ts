import { describe, it, expect } from "vitest";
import { appRouter } from "../../routers";
import {
  createNestleUser,
  createUnileverUser,
  createBRFUser,
  createMockContext,
  TEST_RESOURCES,
} from "../helpers/testHelpers";

describe("Manufacturing Data - Isolamento de Dados Multi-Tenant", () => {
  const nestleUser = createNestleUser();
  const unileverUser = createUnileverUser();
  const brfUser = createBRFUser();

  describe("manufacturing.listByProject - Listar dados de manufatura por projeto", () => {
    it("Usuário Nestlé pode listar dados de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      
      // Primeiro, buscar um projeto da Nestlé
      const projects = await caller.projects.list();
      const nestleProject = projects[0];

      if (nestleProject) {
        const manufacturingData = await caller.manufacturing.listByProject({
          projectId: nestleProject.id,
        });

        // Deve retornar dados (mesmo que vazio)
        expect(Array.isArray(manufacturingData)).toBe(true);
      }
    });

    it("Usuário Nestlé NÃO pode listar dados de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      // Tentar acessar dados de projeto da Unilever
      const manufacturingData = await caller.manufacturing.listByProject({
        projectId: TEST_RESOURCES.unilever.projectId,
      });

      // Deve retornar array vazio (sem acesso)
      expect(manufacturingData.length).toBe(0);
    });

    it("Usuário Unilever NÃO pode listar dados de projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      const manufacturingData = await caller.manufacturing.listByProject({
        projectId: TEST_RESOURCES.brf.projectId,
      });

      expect(manufacturingData.length).toBe(0);
    });

    it("Usuário BRF NÃO pode listar dados de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      const manufacturingData = await caller.manufacturing.listByProject({
        projectId: TEST_RESOURCES.nestle.projectId,
      });

      expect(manufacturingData.length).toBe(0);
    });
  });

  describe("manufacturing.create - Criar dados de manufatura", () => {
    it("Dados criados para projeto da Nestlé devem ter companyId da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));
      
      const projects = await caller.projects.list();
      const nestleProject = projects[0];

      if (nestleProject) {
        const newData = await caller.manufacturing.create({
          id: `mfg_nestle_test_${Date.now()}`,
          projectId: nestleProject.id,
          batchNumber: "BATCH-TEST-001",
          productionDate: new Date().toISOString(),
          factory: "Araçatuba - SP",
          temperature: "25.5",
          humidity: "60.0",
          ph: "7.0",
          viscosity: "1500",
        });

        expect(newData.companyId).toBe("nestle_brasil");
        expect(newData.projectId).toBe(nestleProject.id);
      }
    });

    it("Usuário Nestlé NÃO pode criar dados para projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      // Tentar criar dados para projeto da Unilever deve falhar
      await expect(
        caller.manufacturing.create({
          id: `mfg_hack_test_${Date.now()}`,
          projectId: TEST_RESOURCES.unilever.projectId,
          batchNumber: "HACK-001",
          productionDate: new Date().toISOString(),
          temperature: "25.5",
          humidity: "60.0",
          ph: "7.0",
          viscosity: "1500",
        })
      ).rejects.toThrow();
    });

    it("Usuário Unilever NÃO pode criar dados para projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      await expect(
        caller.manufacturing.create({
          id: `mfg_hack_test_${Date.now()}`,
          projectId: TEST_RESOURCES.brf.projectId,
          batchNumber: "HACK-002",
          productionDate: new Date().toISOString(),
          temperature: "25.5",
          humidity: "60.0",
          ph: "7.0",
          viscosity: "1500",
        })
      ).rejects.toThrow();
    });
  });

  describe("manufacturing.update - Atualizar dados de manufatura", () => {
    it("Usuário Nestlé NÃO pode atualizar dados de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      // Criar ID fictício de dados da Unilever
      const fakeUnileverDataId = `mfg_unilever_${Date.now()}`;

      await expect(
        caller.manufacturing.update({
          id: fakeUnileverDataId,
          temperature: "99.9",
        })
      ).rejects.toThrow();
    });

    it("Usuário BRF NÃO pode atualizar dados de projeto da Nestlé", async () => {
      const caller = appRouter.createCaller(createMockContext(brfUser));

      const fakeNestleDataId = `mfg_nestle_${Date.now()}`;

      await expect(
        caller.manufacturing.update({
          id: fakeNestleDataId,
          temperature: "99.9",
        })
      ).rejects.toThrow();
    });
  });

  describe("manufacturing.delete - Deletar dados de manufatura", () => {
    it("Usuário Nestlé NÃO pode deletar dados de projeto da Unilever", async () => {
      const caller = appRouter.createCaller(createMockContext(nestleUser));

      const fakeUnileverDataId = `mfg_unilever_${Date.now()}`;

      await expect(
        caller.manufacturing.delete({
          id: fakeUnileverDataId,
        })
      ).rejects.toThrow();
    });

    it("Usuário Unilever NÃO pode deletar dados de projeto da BRF", async () => {
      const caller = appRouter.createCaller(createMockContext(unileverUser));

      const fakeBRFDataId = `mfg_brf_${Date.now()}`;

      await expect(
        caller.manufacturing.delete({
          id: fakeBRFDataId,
        })
      ).rejects.toThrow();
    });
  });
});


import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

/**
 * Testes do router companies.admin
 * 
 * Valida:
 * - Restrições de acesso (apenas admins)
 * - CRUD completo (Create, Read, Update, Delete)
 * - Validações de input
 * - Soft delete
 * - Estatísticas por empresa
 */

// Helper para criar contexto de admin
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: "admin_test_001",
      name: "Admin Test",
      email: "admin@test.com",
      role: "admin",
      companyId: "company_nestle",
    },
    req: {} as any,
    res: {} as any,
  };
}

// Helper para criar contexto de usuário comum
function createUserContext(): TrpcContext {
  return {
    user: {
      id: "user_test_001",
      name: "User Test",
      email: "user@test.com",
      role: "user",
      companyId: "company_nestle",
    },
    req: {} as any,
    res: {} as any,
  };
}

// Helper para criar contexto sem autenticação
function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {} as any,
    res: {} as any,
  };
}

describe("companies.admin - Restrições de Acesso", () => {
  it("deve bloquear acesso de usuários não autenticados", async () => {
    const caller = appRouter.createCaller(createUnauthContext());

    await expect(caller.companies.admin.listAll()).rejects.toThrow();
  });

  it("deve bloquear acesso de usuários comuns (role=user)", async () => {
    const caller = appRouter.createCaller(createUserContext());

    await expect(caller.companies.admin.listAll()).rejects.toThrow("permission");
  });

  it("deve permitir acesso de admins (role=admin)", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const companies = await caller.companies.admin.listAll();
    expect(Array.isArray(companies)).toBe(true);
  });
});

describe("companies.admin.listAll", () => {
  it("deve listar todas as empresas (incluindo inativas)", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const companies = await caller.companies.admin.listAll();

    expect(Array.isArray(companies)).toBe(true);
    expect(companies.length).toBeGreaterThan(0);

    // Verificar estrutura de uma empresa
    const company = companies[0];
    expect(company).toHaveProperty("id");
    expect(company).toHaveProperty("name");
    expect(company).toHaveProperty("industry");
    expect(company).toHaveProperty("isActive");
  });

  it("deve incluir empresas inativas na listagem", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    // Criar e deletar uma empresa para testar
    const testCompany = {
      id: `company_test_inactive_${Date.now()}`,
      name: "Empresa Inativa Test",
      industry: "food",
    };

    await caller.companies.admin.create(testCompany);
    await caller.companies.admin.delete({ id: testCompany.id });

    const companies = await caller.companies.admin.listAll();
    const inactiveCompany = companies.find((c) => c.id === testCompany.id);

    expect(inactiveCompany).toBeDefined();
    expect(inactiveCompany?.isActive).toBe(false);
  });

  it("deve ordenar empresas por data de criação (mais recentes primeiro)", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const companies = await caller.companies.admin.listAll();

    // Verificar que as datas estão em ordem decrescente
    for (let i = 0; i < companies.length - 1; i++) {
      const current = new Date(companies[i].createdAt!).getTime();
      const next = new Date(companies[i + 1].createdAt!).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });
});

describe("companies.admin.create", () => {
  it("deve criar empresa com campos obrigatórios", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const newCompany = {
      id: `company_test_${Date.now()}`,
      name: "Empresa Test",
      industry: "food",
    };

    const result = await caller.companies.admin.create(newCompany);

    expect(result).toHaveProperty("id", newCompany.id);
    expect(result).toHaveProperty("name", newCompany.name);
    expect(result).toHaveProperty("industry", newCompany.industry);
  });

  it("deve criar empresa com todos os campos opcionais", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const newCompany = {
      id: `company_test_full_${Date.now()}`,
      name: "Empresa Test Completa",
      industry: "beverage",
      logo: "https://example.com/logo.png",
      primaryColor: "#ff0000",
      secondaryColor: "#0000ff",
      country: "Brasil",
      timezone: "America/Sao_Paulo",
      subscriptionTier: "professional" as const,
      maxUsers: 20,
      maxProjects: 50,
    };

    const result = await caller.companies.admin.create(newCompany);

    expect(result).toMatchObject(newCompany);
  });

  it("deve prevenir criação de empresa com ID duplicado", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const companyId = `company_test_duplicate_${Date.now()}`;
    const newCompany = {
      id: companyId,
      name: "Empresa Test Duplicada",
      industry: "food",
    };

    // Criar primeira vez
    await caller.companies.admin.create(newCompany);

    // Tentar criar novamente com mesmo ID
    await expect(
      caller.companies.admin.create(newCompany)
    ).rejects.toThrow("Empresa com este ID já existe");
  });

  it("deve validar campo 'name' obrigatório", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const invalidCompany = {
      id: `company_test_invalid_${Date.now()}`,
      name: "", // Nome vazio
      industry: "food",
    };

    await expect(
      caller.companies.admin.create(invalidCompany as any)
    ).rejects.toThrow();
  });

  it("deve validar campo 'industry' obrigatório", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const invalidCompany = {
      id: `company_test_invalid_${Date.now()}`,
      name: "Empresa Test",
      industry: "", // Indústria vazia
    };

    await expect(
      caller.companies.admin.create(invalidCompany as any)
    ).rejects.toThrow();
  });

  it("deve validar formato de cor primária (hexadecimal)", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const invalidCompany = {
      id: `company_test_invalid_color_${Date.now()}`,
      name: "Empresa Test",
      industry: "food",
      primaryColor: "red", // Não é hexadecimal
    };

    await expect(
      caller.companies.admin.create(invalidCompany as any)
    ).rejects.toThrow();
  });

  it("deve validar formato de cor secundária (hexadecimal)", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const invalidCompany = {
      id: `company_test_invalid_color2_${Date.now()}`,
      name: "Empresa Test",
      industry: "food",
      secondaryColor: "#ff00", // Hexadecimal incompleto
    };

    await expect(
      caller.companies.admin.create(invalidCompany as any)
    ).rejects.toThrow();
  });

  it("deve aplicar valores padrão para campos opcionais", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const testId = `company_test_defaults_${Date.now()}`;
    const newCompany = {
      id: testId,
      name: "Empresa Test Defaults",
      industry: "food",
    };

    await caller.companies.admin.create(newCompany);

    // Buscar empresa criada para verificar defaults
    const companies = await caller.companies.admin.listAll();
    const result = companies.find((c) => c.id === testId);

    // Verificar defaults aplicados no schema
    expect(result?.subscriptionTier).toBe("trial");
    expect(result?.maxUsers).toBe(5);
    expect(result?.maxProjects).toBe(10);
    expect(result?.timezone).toBe("America/Sao_Paulo");
    expect(result?.isActive).toBe(true);
  });
});

describe("companies.admin.update", () => {
  let testCompanyId: string;

  beforeAll(async () => {
    const caller = appRouter.createCaller(createAdminContext());
    testCompanyId = `company_test_update_${Date.now()}`;

    await caller.companies.admin.create({
      id: testCompanyId,
      name: "Empresa Test Update",
      industry: "food",
    });
  });

  it("deve atualizar nome da empresa", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    await caller.companies.admin.update({
      id: testCompanyId,
      name: "Empresa Test Update - Atualizada",
    });

    const companies = await caller.companies.admin.listAll();
    const updated = companies.find((c) => c.id === testCompanyId);

    expect(updated?.name).toBe("Empresa Test Update - Atualizada");
  });

  it("deve atualizar múltiplos campos simultaneamente", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    await caller.companies.admin.update({
      id: testCompanyId,
      name: "Empresa Test Multi Update",
      industry: "pharma",
      primaryColor: "#00ff00",
      maxUsers: 30,
    });

    const companies = await caller.companies.admin.listAll();
    const updated = companies.find((c) => c.id === testCompanyId);

    expect(updated?.name).toBe("Empresa Test Multi Update");
    expect(updated?.industry).toBe("pharma");
    expect(updated?.primaryColor).toBe("#00ff00");
    expect(updated?.maxUsers).toBe(30);
  });

  it("deve rejeitar atualização de empresa inexistente", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    await expect(
      caller.companies.admin.update({
        id: "company_nonexistent_999",
        name: "Empresa Inexistente",
      })
    ).rejects.toThrow("Empresa não encontrada");
  });

  it("deve atualizar campo updatedAt automaticamente", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const companiesBefore = await caller.companies.admin.listAll();
    const before = companiesBefore.find((c) => c.id === testCompanyId);
    const updatedAtBefore = new Date(before!.updatedAt!).getTime();

    // Aguardar 1 segundo para garantir diferença no timestamp
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await caller.companies.admin.update({
      id: testCompanyId,
      name: "Empresa Test Timestamp",
    });

    const companiesAfter = await caller.companies.admin.listAll();
    const after = companiesAfter.find((c) => c.id === testCompanyId);
    const updatedAtAfter = new Date(after!.updatedAt!).getTime();

    expect(updatedAtAfter).toBeGreaterThan(updatedAtBefore);
  });
});

describe("companies.admin.delete", () => {
  it("deve fazer soft delete da empresa (isActive = false)", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const testCompanyId = `company_test_delete_${Date.now()}`;
    await caller.companies.admin.create({
      id: testCompanyId,
      name: "Empresa Test Delete",
      industry: "food",
    });

    await caller.companies.admin.delete({ id: testCompanyId });

    const companies = await caller.companies.admin.listAll();
    const deleted = companies.find((c) => c.id === testCompanyId);

    expect(deleted).toBeDefined();
    expect(deleted?.isActive).toBe(false);
  });

  it("deve rejeitar deleção de empresa inexistente", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    await expect(
      caller.companies.admin.delete({ id: "company_nonexistent_999" })
    ).rejects.toThrow("Empresa não encontrada");
  });

  it("não deve remover empresa fisicamente do banco", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const testCompanyId = `company_test_physical_delete_${Date.now()}`;
    await caller.companies.admin.create({
      id: testCompanyId,
      name: "Empresa Test Physical Delete",
      industry: "food",
    });

    await caller.companies.admin.delete({ id: testCompanyId });

    // Verificar que empresa ainda existe no banco (via listAll admin)
    const companies = await caller.companies.admin.listAll();
    const exists = companies.some((c) => c.id === testCompanyId);

    expect(exists).toBe(true);
  });

  it("empresa deletada não deve aparecer em listagem pública", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const testCompanyId = `company_test_public_list_${Date.now()}`;
    await caller.companies.admin.create({
      id: testCompanyId,
      name: "Empresa Test Public List",
      industry: "food",
    });

    await caller.companies.admin.delete({ id: testCompanyId });

    // Listar via procedure pública (companies.listAll)
    const publicCompanies = await caller.companies.listAll();
    const existsInPublic = publicCompanies.some((c) => c.id === testCompanyId);

    expect(existsInPublic).toBe(false);
  });
});

describe("companies.admin.getStats", () => {
  let testCompanyId: string;

  beforeAll(async () => {
    const caller = appRouter.createCaller(createAdminContext());
    testCompanyId = `company_test_stats_${Date.now()}`;

    await caller.companies.admin.create({
      id: testCompanyId,
      name: "Empresa Test Stats",
      industry: "food",
    });
  });

  it("deve retornar estatísticas da empresa", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.companies.admin.getStats({ companyId: testCompanyId });

    expect(result).toHaveProperty("company");
    expect(result).toHaveProperty("stats");
    expect(result.company.id).toBe(testCompanyId);
  });

  it("deve retornar contadores corretos", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const result = await caller.companies.admin.getStats({ companyId: testCompanyId });

    expect(result.stats).toHaveProperty("projectsCount");
    expect(result.stats).toHaveProperty("usersCount");
    expect(result.stats).toHaveProperty("predictionsCount");
    expect(result.stats).toHaveProperty("alertsCount");

    expect(typeof result.stats.projectsCount).toBe("number");
    expect(typeof result.stats.usersCount).toBe("number");
    expect(typeof result.stats.predictionsCount).toBe("number");
    expect(typeof result.stats.alertsCount).toBe("number");

    expect(result.stats.projectsCount).toBeGreaterThanOrEqual(0);
    expect(result.stats.usersCount).toBeGreaterThanOrEqual(0);
    expect(result.stats.predictionsCount).toBeGreaterThanOrEqual(0);
    expect(result.stats.alertsCount).toBeGreaterThanOrEqual(0);
  });

  it("deve rejeitar estatísticas de empresa inexistente", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    await expect(
      caller.companies.admin.getStats({ companyId: "company_nonexistent_999" })
    ).rejects.toThrow("Empresa não encontrada");
  });

  it("deve retornar estatísticas para empresa existente", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    // Buscar primeira empresa ativa
    const companies = await caller.companies.admin.listAll();
    const activeCompany = companies.find((c) => c.isActive);

    if (activeCompany) {
      const result = await caller.companies.admin.getStats({ companyId: activeCompany.id });

      expect(result.company.id).toBe(activeCompany.id);
      expect(result.stats.projectsCount).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("companies.admin - Testes de Integração", () => {
  it("deve executar fluxo completo: criar -> atualizar -> obter stats -> deletar", async () => {
    const caller = appRouter.createCaller(createAdminContext());

    const testCompanyId = `company_test_flow_${Date.now()}`;

    // 1. Criar
    await caller.companies.admin.create({
      id: testCompanyId,
      name: "Empresa Test Flow",
      industry: "food",
      primaryColor: "#ff0000",
    });

    // 2. Atualizar
    await caller.companies.admin.update({
      id: testCompanyId,
      name: "Empresa Test Flow - Atualizada",
      maxUsers: 15,
    });

    // 3. Obter stats
    const stats = await caller.companies.admin.getStats({ companyId: testCompanyId });
    expect(stats.company.name).toBe("Empresa Test Flow - Atualizada");
    expect(stats.company.maxUsers).toBe(15);

    // 4. Deletar
    await caller.companies.admin.delete({ id: testCompanyId });

    // 5. Verificar soft delete
    const companies = await caller.companies.admin.listAll();
    const deleted = companies.find((c) => c.id === testCompanyId);
    expect(deleted?.isActive).toBe(false);
  });
});

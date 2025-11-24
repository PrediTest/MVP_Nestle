import { inferAsyncReturnType } from "@trpc/server";
import type { User } from "../../../drizzle/schema";

/**
 * Mock de usuário para testes
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: overrides.id || "test_user_1",
    name: overrides.name || "Test User",
    email: overrides.email || "test@example.com",
    loginMethod: overrides.loginMethod || "oauth",
    role: overrides.role || "user",
    companyId: overrides.companyId || null,
    createdAt: overrides.createdAt || new Date(),
    lastSignedIn: overrides.lastSignedIn || new Date(),
  };
}

/**
 * Cria usuário da Nestlé para testes
 */
export function createNestleUser(): User {
  return createMockUser({
    id: "user_nestle_test",
    name: "João Silva",
    email: "joao.silva@nestle.com.br",
    companyId: "nestle_brasil",
    role: "admin",
  });
}

/**
 * Cria usuário da Unilever para testes
 */
export function createUnileverUser(): User {
  return createMockUser({
    id: "user_unilever_test",
    name: "Maria Santos",
    email: "maria.santos@unilever.com.br",
    companyId: "unilever_brasil",
    role: "admin",
  });
}

/**
 * Cria usuário da BRF para testes
 */
export function createBRFUser(): User {
  return createMockUser({
    id: "user_brf_test",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@brf.com.br",
    companyId: "brf_brasil",
    role: "admin",
  });
}

/**
 * Mock de contexto tRPC para testes
 */
export function createMockContext(user: User | null = null) {
  return {
    user,
    req: {} as any,
    res: {} as any,
  };
}

/**
 * IDs de recursos de teste para cada empresa
 */
export const TEST_RESOURCES = {
  nestle: {
    projectId: "proj_nestle_1",
    standardId: "std_nestle_1",
    testId: "test_nestle_1",
  },
  unilever: {
    projectId: "proj_unilever_1",
    standardId: "std_unilever_1",
    testId: "test_unilever_1",
  },
  brf: {
    projectId: "proj_brf_1",
    standardId: "std_brf_1",
    testId: "test_brf_1",
  },
};


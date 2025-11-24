/**
 * Multi-Tenancy Helper Functions
 * 
 * Provides utilities for Row-Level Security (RLS) and company isolation
 */

import { TRPCError } from "@trpc/server";

/**
 * Validates that the user belongs to the specified company
 * Throws FORBIDDEN error if validation fails
 */
export function validateCompanyAccess(userCompanyId: string, resourceCompanyId: string) {
  if (userCompanyId !== resourceCompanyId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Access denied: You do not have permission to access this resource",
    });
  }
}

/**
 * Validates that the user belongs to the same company as the resource
 * Returns true if valid, false otherwise (for non-throwing validation)
 */
export function hasCompanyAccess(userCompanyId: string, resourceCompanyId: string): boolean {
  return userCompanyId === resourceCompanyId;
}

/**
 * Extracts companyId from user context
 * Throws UNAUTHORIZED if user is not authenticated
 */
export function getCompanyIdFromUser(user: { companyId: string } | undefined): string {
  if (!user || !user.companyId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return user.companyId;
}

/**
 * Middleware helper to ensure company isolation
 * Use this in tRPC procedures to automatically filter by companyId
 */
export function ensureCompanyIsolation<T extends { companyId: string }>(
  items: T[],
  userCompanyId: string
): T[] {
  return items.filter(item => item.companyId === userCompanyId);
}

/**
 * Validates that a resource belongs to the user's company
 * Throws FORBIDDEN if the resource doesn't exist or belongs to another company
 */
export function validateResourceOwnership<T extends { companyId: string } | undefined>(
  resource: T,
  userCompanyId: string,
  resourceName: string = "Resource"
): asserts resource is NonNullable<T> {
  if (!resource) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `${resourceName} not found`,
    });
  }
  
  if (resource.companyId !== userCompanyId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Access denied: ${resourceName} belongs to another company`,
    });
  }
}


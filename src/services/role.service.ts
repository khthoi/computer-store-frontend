import type { VaiTro, NhanVienVaiTro } from "@/src/types/role.types";
import { MOCK_ROLES } from "@/src/app/(dashboard)/roles/_mock";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetRolesResult {
  data: VaiTro[];
  total: number;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Fetch all roles.
 * Mock — replace with GET /admin/roles
 */
export async function getRoles(): Promise<GetRolesResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return { data: MOCK_ROLES, total: MOCK_ROLES.length };
}

/**
 * Fetch a single role by ID.
 * Mock — replace with GET /admin/roles/:id
 */
export async function getRoleById(id: string): Promise<VaiTro | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return MOCK_ROLES.find((r) => r.id === id) ?? null;
}

/**
 * Create a new role.
 * Mock — replace with POST /admin/roles
 */
export async function createRole(payload: CreateRolePayload): Promise<VaiTro> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const newRole: VaiTro = {
    id: `role-${Date.now()}`,
    name: payload.name,
    description: payload.description,
    permissions: payload.permissions,
    employeeCount: 0,
    assignments: [],
    createdAt: new Date().toISOString(),
  };
  return newRole;
}

/**
 * Update an existing role.
 * Mock — replace with PATCH /admin/roles/:id
 */
export async function updateRole(id: string, payload: UpdateRolePayload): Promise<VaiTro> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const existing = MOCK_ROLES.find((r) => r.id === id);
  if (!existing) throw new Error(`Role ${id} not found`);
  return { ...existing, ...payload };
}

/**
 * Delete a role by ID.
 * Mock — replace with DELETE /admin/roles/:id
 */
export async function deleteRole(_id: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * Bulk delete roles.
 * Mock — replace with DELETE /admin/roles/bulk
 */
export async function bulkDeleteRoles(ids: string[]): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  void ids;
}

/**
 * Assign a role to an employee.
 * Mock — replace with POST /admin/roles/:roleId/assignments
 */
export async function assignRole(
  roleId: string,
  employeeId: string,
  employeeName: string,
  employeeEmail: string
): Promise<NhanVienVaiTro> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return {
    id: `assign-${Date.now()}`,
    employeeId,
    employeeName,
    employeeEmail,
    roleId,
    assignedAt: new Date().toISOString(),
  };
}

/**
 * Remove a role assignment.
 * Mock — replace with DELETE /admin/roles/:roleId/assignments/:assignmentId
 */
export async function removeAssignment(_assignmentId: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

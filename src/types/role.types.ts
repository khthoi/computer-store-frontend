// ─── Role domain types ────────────────────────────────────────────────────────

export interface NhanVienVaiTro {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  roleId: string;
  assignedAt: string; // ISO date string
}

export interface VaiTro {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  /** Derived count — number of employees currently assigned this role */
  employeeCount: number;
  assignments: NhanVienVaiTro[];
  createdAt: string; // ISO date string
}

export type RoleRow = VaiTro & Record<string, unknown>;

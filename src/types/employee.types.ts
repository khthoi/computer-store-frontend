// ─── Employee domain types ────────────────────────────────────────────────────

export type GenderType = "male" | "female" | "other";

export interface NhanVien {
  id: string;
  /** e.g. "NV-001" */
  code: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null; // ISO date "YYYY-MM-DD"
  roleIds: string[];
  /** Denormalised for display — kept in sync with roles */
  roleNames: string[];
  status: "active" | "inactive" | "suspended";
  hireDate: string;   // ISO date string
  lastLoginAt?: string; // ISO date string
  createdAt: string;  // ISO date string
}

export type EmployeeRow = NhanVien & Record<string, unknown>;
export type EmployeeStatus = NhanVien["status"];

// ─── Audit log ────────────────────────────────────────────────────────────────

export type AuditActionType =
  | "login"
  | "logout"
  | "role_assign"
  | "role_remove"
  | "profile_edit"
  | "report_view";

export interface AuditLogEntry {
  id: string;
  action: AuditActionType;
  details: string;
  ipAddress: string;
  createdAt: string; // ISO date-time string
}

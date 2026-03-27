// ─── Customer domain types ────────────────────────────────────────────────────

export type GenderType = "male" | "female" | "other";

export interface DiaChiGiaoHang {
  id: string;
  customerId: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
  createdAt: string; // ISO date string
}

export interface KhachHang {
  id: string;
  /** e.g. "KH-001" */
  code: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null; // ISO date "YYYY-MM-DD"
  status: "active" | "inactive" | "banned";
  totalOrders: number;
  /** Raw VND amount */
  totalSpent: number;
  registeredAt: string;  // ISO date string
  lastOrderAt?: string;  // ISO date string
  shippingAddresses: DiaChiGiaoHang[];
}

export type CustomerRow = KhachHang & Record<string, unknown>;
export type CustomerStatus = KhachHang["status"];
export type AddressRow = DiaChiGiaoHang & Record<string, unknown>;

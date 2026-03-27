import type { KhachHang, DiaChiGiaoHang, CustomerStatus, GenderType } from "@/src/types/customer.types";
import { MOCK_CUSTOMERS } from "@/src/app/(dashboard)/customers/_mock";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetCustomersResult {
  data: KhachHang[];
  total: number;
}

export interface CreateCustomerPayload {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

export interface UpdateCustomerPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export interface UpdateAddressPayload {
  recipientName?: string;
  phone?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Fetch all customers.
 * Mock — replace with GET /admin/customers
 */
export async function getCustomers(): Promise<GetCustomersResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return { data: MOCK_CUSTOMERS, total: MOCK_CUSTOMERS.length };
}

/**
 * Fetch a single customer by ID.
 * Mock — replace with GET /admin/customers/:id
 */
export async function getCustomerById(id: string): Promise<KhachHang | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return MOCK_CUSTOMERS.find((c) => c.id === id) ?? null;
}

/**
 * Create a new customer.
 * Mock — replace with POST /admin/customers
 */
export async function createCustomer(payload: CreateCustomerPayload): Promise<KhachHang> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return {
    id: `kh-${Date.now()}`,
    totalOrders: 0,
    totalSpent: 0,
    registeredAt: new Date().toISOString(),
    shippingAddresses: [],
    ...payload,
  };
}

/**
 * Update a customer.
 * Mock — replace with PATCH /admin/customers/:id
 */
export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<KhachHang> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const existing = MOCK_CUSTOMERS.find((c) => c.id === id);
  if (!existing) throw new Error(`Customer ${id} not found`);
  return { ...existing, ...payload };
}

/**
 * Delete a customer.
 * Mock — replace with DELETE /admin/customers/:id
 */
export async function deleteCustomer(_id: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * Bulk update customer status.
 * Mock — replace with PATCH /admin/customers/bulk
 */
export async function bulkUpdateCustomerStatus(
  ids: string[],
  status: CustomerStatus
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  void ids; void status;
}

/**
 * Add a shipping address to a customer.
 * Mock — replace with POST /admin/customers/:id/addresses
 */
export async function addAddress(
  customerId: string,
  payload: CreateAddressPayload
): Promise<DiaChiGiaoHang> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return {
    id: `addr-${Date.now()}`,
    customerId,
    createdAt: new Date().toISOString(),
    ...payload,
  };
}

/**
 * Update a shipping address.
 * Mock — replace with PATCH /admin/customers/:id/addresses/:addressId
 */
export async function updateAddress(
  customerId: string,
  addressId: string,
  payload: UpdateAddressPayload
): Promise<DiaChiGiaoHang> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId);
  const existing = customer?.shippingAddresses.find((a) => a.id === addressId);
  if (!existing) throw new Error(`Address ${addressId} not found`);
  return { ...existing, ...payload };
}

/**
 * Delete a shipping address.
 * Mock — replace with DELETE /admin/customers/:id/addresses/:addressId
 */
export async function deleteAddress(_customerId: string, _addressId: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * Set a shipping address as default.
 * Mock — replace with PATCH /admin/customers/:id/addresses/:addressId/set-default
 */
export async function setDefaultAddress(_customerId: string, _addressId: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

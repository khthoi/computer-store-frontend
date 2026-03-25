"use client";

import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { CustomerOrderHistoryList } from "./CustomerOrderHistoryList";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  joinedAt: string;
  lastLoginAt?: string;
  orderCount: number;
  totalSpend: number;
  addresses: { id: string; label: string; full: string }[];
}

interface OrderRow {
  id: string;
  date: string;
  status: string;
  itemCount: number;
  total: number;
}

interface UserDetailPanelProps {
  user: AdminUserProfile;
  orders: OrderRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
      <p className="text-xs font-medium text-secondary-500 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-secondary-800">{value}</p>
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { value: "overview", label: "Tổng quan" },
  { value: "orders", label: "Đơn hàng" },
  { value: "addresses", label: "Địa chỉ" },
  { value: "activity", label: "Nhật ký hoạt động" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function UserDetailPanel({ user, orders }: UserDetailPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
      {/* ── User header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start gap-4 p-5 border-b border-secondary-100">
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          size="xl"
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-secondary-900">{user.name}</h2>
            <Badge variant="primary" size="sm">
              {user.role}
            </Badge>
          </div>
          <p className="text-secondary-500 mt-0.5">{user.email}</p>
          {user.phone && (
            <p className="text-secondary-500 text-sm">{user.phone}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-3">
            <span className="text-xs text-secondary-400">
              Tham gia: {user.joinedAt}
            </span>
            {user.lastLoginAt && (
              <span className="text-xs text-secondary-400">
                Đăng nhập lần cuối: {user.lastLoginAt}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="p-5">
        <Tabs tabs={TABS} defaultValue="overview">
          {/* Tổng quan */}
          <TabPanel value="overview">
            <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
              <StatChip label="Tổng đơn hàng" value={user.orderCount} />
              <StatChip label="Tổng chi tiêu" value={formatVND(user.totalSpend)} />
              <StatChip label="Thành viên từ" value={user.joinedAt} />
              <StatChip
                label="Đăng nhập lần cuối"
                value={user.lastLoginAt ?? "—"}
              />
            </div>
          </TabPanel>

          {/* Đơn hàng */}
          <TabPanel value="orders">
            <div className="pt-3">
              <CustomerOrderHistoryList orders={orders} />
            </div>
          </TabPanel>

          {/* Địa chỉ */}
          <TabPanel value="addresses">
            {user.addresses.length === 0 ? (
              <p className="text-sm text-secondary-400 py-8 text-center">
                Chưa có địa chỉ nào.
              </p>
            ) : (
              <ul className="space-y-3 pt-3">
                {user.addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3"
                  >
                    <p className="font-semibold text-sm text-secondary-800">{addr.label}</p>
                    <p className="text-sm text-secondary-600 mt-0.5">{addr.full}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>

          {/* Nhật ký hoạt động */}
          <TabPanel value="activity">
            <p className="text-secondary-400 text-sm py-8 text-center">
              Nhật ký hoạt động sẽ hiển thị ở đây.
            </p>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

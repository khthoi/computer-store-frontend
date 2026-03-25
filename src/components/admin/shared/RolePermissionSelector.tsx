"use client";

import { useState } from "react";
import { Toggle } from "@/src/components/ui/Toggle";
import { Badge } from "@/src/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminRole = "admin" | "manager" | "staff" | "support";

export interface PermissionDomain {
  domain: string;
  label: string;
  permissions: { key: string; label: string }[];
}

export interface RolePermissions {
  role: AdminRole;
  overrides: string[];
}

export interface RolePermissionSelectorProps {
  value: RolePermissions;
  onChange: (v: RolePermissions) => void;
  readOnly?: boolean;
  className?: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ROLE_META: Record<AdminRole, { label: string; description: string }> = {
  admin: {
    label: "Admin",
    description: "Toàn quyền hệ thống",
  },
  manager: {
    label: "Manager",
    description: "Quản lý hầu hết tính năng",
  },
  staff: {
    label: "Staff",
    description: "Sản phẩm, đơn hàng, khuyến mãi",
  },
  support: {
    label: "Support",
    description: "CSKH và hoàn trả",
  },
};

const ALL_ROLES: AdminRole[] = ["admin", "manager", "staff", "support"];

const PERMISSION_DOMAINS: PermissionDomain[] = [
  {
    domain: "products",
    label: "Sản phẩm",
    permissions: [
      { key: "products.view", label: "Xem" },
      { key: "products.create", label: "Tạo mới" },
      { key: "products.edit", label: "Chỉnh sửa" },
      { key: "products.delete", label: "Xóa" },
    ],
  },
  {
    domain: "orders",
    label: "Đơn hàng",
    permissions: [
      { key: "orders.view", label: "Xem" },
      { key: "orders.update_status", label: "Cập nhật trạng thái" },
      { key: "orders.refund", label: "Hoàn tiền" },
      { key: "orders.export", label: "Xuất dữ liệu" },
    ],
  },
  {
    domain: "users",
    label: "Khách hàng",
    permissions: [
      { key: "users.view", label: "Xem" },
      { key: "users.create", label: "Tạo mới" },
      { key: "users.edit", label: "Chỉnh sửa" },
      { key: "users.ban", label: "Khóa tài khoản" },
    ],
  },
  {
    domain: "inventory",
    label: "Kho hàng",
    permissions: [
      { key: "inventory.view", label: "Xem" },
      { key: "inventory.edit", label: "Chỉnh sửa" },
    ],
  },
  {
    domain: "promotions",
    label: "Khuyến mãi",
    permissions: [
      { key: "promotions.view", label: "Xem" },
      { key: "promotions.create", label: "Tạo mới" },
      { key: "promotions.edit", label: "Chỉnh sửa" },
    ],
  },
  {
    domain: "reports",
    label: "Báo cáo",
    permissions: [
      { key: "reports.view", label: "Xem" },
      { key: "reports.export", label: "Xuất" },
    ],
  },
  {
    domain: "support",
    label: "Hỗ trợ",
    permissions: [
      { key: "support.view", label: "Xem" },
      { key: "support.reply", label: "Phản hồi" },
      { key: "support.close", label: "Đóng ticket" },
      { key: "support.assign", label: "Phân công" },
    ],
  },
  {
    domain: "settings",
    label: "Cài đặt",
    permissions: [
      { key: "settings.view", label: "Xem" },
      { key: "settings.edit", label: "Chỉnh sửa" },
    ],
  },
];

/** Base inherited permissions per role (cannot be removed) */
const BASE_PERMISSIONS: Record<AdminRole, string[]> = {
  admin: PERMISSION_DOMAINS.flatMap((d) => d.permissions.map((p) => p.key)),
  manager: [
    "products.view", "products.create", "products.edit",
    "orders.view", "orders.update_status", "orders.refund", "orders.export",
    "users.view", "users.edit",
    "inventory.view", "inventory.edit",
    "promotions.view", "promotions.create", "promotions.edit",
    "reports.view", "reports.export",
    "support.view", "support.reply", "support.close", "support.assign",
    "settings.view",
  ],
  staff: [
    "products.view", "products.create", "products.edit",
    "orders.view", "orders.update_status",
    "promotions.view", "promotions.create", "promotions.edit",
    "inventory.view",
  ],
  support: [
    "orders.view",
    "users.view",
    "support.view", "support.reply", "support.close",
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RolePermissionSelector — two-column role + permission manager.
 *
 * Left column: clickable role list.
 * Right column: grouped permission toggles for the active role.
 * Inherited permissions are shown as locked "hệ thống" labels.
 * Custom overrides are togglable.
 */
export function RolePermissionSelector({
  value,
  onChange,
  readOnly = false,
  className = "",
}: RolePermissionSelectorProps) {
  const [activeRole, setActiveRole] = useState<AdminRole>(value.role);

  const basePerms = new Set(BASE_PERMISSIONS[activeRole]);
  const overrides = new Set(value.role === activeRole ? value.overrides : []);

  const isPermEnabled = (key: string) => basePerms.has(key) || overrides.has(key);

  const handleToggle = (key: string, checked: boolean) => {
    if (readOnly) return;
    // Base permissions cannot be toggled off
    if (basePerms.has(key)) return;

    const newOverrides = checked
      ? [...value.overrides, key]
      : value.overrides.filter((o) => o !== key);

    onChange({ role: value.role, overrides: newOverrides });
  };

  const handleRoleSelect = (role: AdminRole) => {
    setActiveRole(role);
  };

  return (
    <div className={`flex gap-0 rounded-xl border border-secondary-200 overflow-hidden ${className}`}>
      {/* Left — role list */}
      <div className="w-44 shrink-0 border-r border-secondary-200 bg-secondary-50">
        <div className="border-b border-secondary-200 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
            Vai trò
          </p>
        </div>
        <ul>
          {ALL_ROLES.map((role) => {
            const meta = ROLE_META[role];
            const isActive = activeRole === role;
            const isCurrentValue = value.role === role;

            return (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={[
                    "w-full border-l-2 px-3 py-3 text-left transition-colors focus:outline-none",
                    isActive
                      ? "border-primary-500 bg-primary-50"
                      : "border-transparent hover:bg-secondary-100",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-primary-700" : "text-secondary-700"
                      }`}
                    >
                      {meta.label}
                    </span>
                    {isCurrentValue && (
                      <Badge variant="primary" size="sm">
                        hiện tại
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-secondary-400 leading-tight">
                    {meta.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right — permissions for active role */}
      <div className="flex-1 overflow-y-auto max-h-96">
        <div className="border-b border-secondary-200 px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
            Quyền — {ROLE_META[activeRole].label}
          </p>
        </div>
        <div className="divide-y divide-secondary-100">
          {PERMISSION_DOMAINS.map((domain) => (
            <div key={domain.domain} className="px-4 py-3">
              <p className="mb-2 text-xs font-semibold text-secondary-600">
                {domain.label}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {domain.permissions.map((perm) => {
                  const isBase = basePerms.has(perm.key);
                  const isEnabled = isPermEnabled(perm.key);

                  return (
                    <div key={perm.key} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-secondary-700 truncate">
                          {perm.label}
                        </span>
                        {isBase && (
                          <Badge variant="default" size="sm">
                            hệ thống
                          </Badge>
                        )}
                      </div>
                      <Toggle
                        size="sm"
                        checked={isEnabled}
                        disabled={isBase || readOnly}
                        onChange={(e) => handleToggle(perm.key, e.target.checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

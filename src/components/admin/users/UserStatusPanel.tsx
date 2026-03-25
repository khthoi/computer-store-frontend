"use client";

import { useState } from "react";
import {
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountStatus = "active" | "suspended" | "pending_verification";
type StatusAction = "suspend" | "reactivate" | "reset_password" | "delete";

interface UserStatusPanelProps {
  userId: string;
  status: AccountStatus;
  lastStatusChange?: {
    reason: string;
    date: string;
    by: string;
  };
  onStatusChange: (action: StatusAction) => void;
  isSaving?: boolean;
}

type DialogConfig = {
  open: boolean;
  action: StatusAction | null;
  title: string;
  description: string;
  confirmLabel: string;
  variant: "danger" | "warning" | "info";
  requiredPhrase?: string;
};

const DEFAULT_DIALOG: DialogConfig = {
  open: false,
  action: null,
  title: "",
  description: "",
  confirmLabel: "Xác nhận",
  variant: "danger",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(status: AccountStatus) {
  if (status === "active") return "active" as const;
  if (status === "suspended") return "suspended" as const;
  return "pending" as const;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserStatusPanel({
  userId: _userId,
  status,
  lastStatusChange,
  onStatusChange,
  isSaving = false,
}: UserStatusPanelProps) {
  const [dialog, setDialog] = useState<DialogConfig>(DEFAULT_DIALOG);

  function openDialog(config: Omit<DialogConfig, "open">) {
    setDialog({ ...config, open: true });
  }

  function closeDialog() {
    setDialog(DEFAULT_DIALOG);
  }

  function handleConfirm() {
    if (!dialog.action) return;
    onStatusChange(dialog.action);
    closeDialog();
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-4 space-y-4">
      <h3 className="text-sm font-semibold text-secondary-900">Trạng thái tài khoản</h3>

      {/* Current status */}
      <div className="space-y-1.5">
        <StatusBadge status={mapStatus(status)} />
        {lastStatusChange && (
          <p className="text-xs text-secondary-400">
            Thay đổi lần cuối: {lastStatusChange.date} bởi {lastStatusChange.by} —{" "}
            {lastStatusChange.reason}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {/* Suspend / Reactivate */}
        {status === "active" || status === "pending_verification" ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() =>
              openDialog({
                action: "suspend",
                title: "Tạm khóa tài khoản",
                description:
                  "Tài khoản này sẽ bị khóa. Người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt lại.",
                confirmLabel: "Khóa tài khoản",
                variant: "danger",
              })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-2.5 text-sm font-medium text-error-700 hover:bg-error-100 disabled:opacity-50 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
          >
            <LockClosedIcon className="w-4 h-4" aria-hidden="true" />
            Tạm khóa tài khoản
          </button>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={() =>
              openDialog({
                action: "reactivate",
                title: "Kích hoạt lại tài khoản",
                description: "Tài khoản này sẽ được mở khóa và người dùng có thể đăng nhập lại.",
                confirmLabel: "Kích hoạt lại",
                variant: "info",
              })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-2.5 text-sm font-medium text-success-700 hover:bg-success-100 disabled:opacity-50 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500"
          >
            <LockOpenIcon className="w-4 h-4" aria-hidden="true" />
            Kích hoạt lại
          </button>
        )}

        {/* Reset password */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            openDialog({
              action: "reset_password",
              title: "Đặt lại mật khẩu",
              description:
                "Một email đặt lại mật khẩu sẽ được gửi đến địa chỉ email của người dùng.",
              confirmLabel: "Gửi email đặt lại",
              variant: "warning",
            })
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100 disabled:opacity-50 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
        >
          <KeyIcon className="w-4 h-4" aria-hidden="true" />
          Đặt lại mật khẩu
        </button>

        {/* Delete account */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            openDialog({
              action: "delete",
              title: "Xóa tài khoản",
              description:
                'Hành động này không thể hoàn tác. Toàn bộ dữ liệu tài khoản sẽ bị xóa vĩnh viễn. Gõ "DELETE" để xác nhận.',
              confirmLabel: "Xóa tài khoản",
              variant: "danger",
              requiredPhrase: "DELETE",
            })
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-error-300 bg-error-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-700 disabled:opacity-50 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
        >
          <TrashIcon className="w-4 h-4" aria-hidden="true" />
          Xóa tài khoản
        </button>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={dialog.open}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title={dialog.title}
        description={dialog.description}
        confirmLabel={dialog.confirmLabel}
        cancelLabel="Hủy"
        variant={dialog.variant}
        requiredPhrase={dialog.requiredPhrase}
        isConfirming={isSaving}
      />
    </div>
  );
}

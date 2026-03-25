"use client";

import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeneralSettings {
  storeName: string;
  currency: string;
  language: string;
  timezone: string;
  supportEmail: string;
  supportPhone: string;
}

interface GeneralSettingsFormProps {
  value: GeneralSettings;
  onChange: (v: GeneralSettings) => void;
  onSave: () => void;
  isSaving?: boolean;
  lastSavedAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCY_OPTIONS = [
  { value: "VND", label: "VND — Đồng Việt Nam" },
  { value: "USD", label: "USD — US Dollar" },
];

const LANGUAGE_OPTIONS = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho Chi Minh (UTC+7)" },
  { value: "UTC", label: "UTC" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GeneralSettingsForm — form for editing core store settings.
 */
export function GeneralSettingsForm({
  value,
  onChange,
  onSave,
  isSaving = false,
  lastSavedAt,
}: GeneralSettingsFormProps) {
  function set<K extends keyof GeneralSettings>(
    key: K,
    val: GeneralSettings[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
      {/* Card title */}
      <h2 className="text-base font-semibold text-secondary-900 mb-5">
        Thông tin cửa hàng
      </h2>

      <div className="space-y-5">
        {/* Store name — full width */}
        <Input
          label="Tên cửa hàng"
          required
          value={value.storeName}
          onChange={(e) => set("storeName", e.target.value)}
          placeholder="Nhập tên cửa hàng..."
        />

        {/* 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Tiền tệ"
            options={CURRENCY_OPTIONS}
            value={value.currency}
            onChange={(v) => set("currency", v as string)}
          />

          <Select
            label="Ngôn ngữ"
            options={LANGUAGE_OPTIONS}
            value={value.language}
            onChange={(v) => set("language", v as string)}
          />

          <Select
            label="Múi giờ"
            options={TIMEZONE_OPTIONS}
            value={value.timezone}
            onChange={(v) => set("timezone", v as string)}
          />

          <Input
            label="Email hỗ trợ"
            type="email"
            value={value.supportEmail}
            onChange={(e) => set("supportEmail", e.target.value)}
            placeholder="support@example.com"
          />

          <Input
            label="Số điện thoại hỗ trợ"
            value={value.supportPhone}
            onChange={(e) => set("supportPhone", e.target.value)}
            placeholder="0900 000 000"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-100">
        <div>
          {lastSavedAt && (
            <p className="text-xs text-secondary-400 italic">
              Đã lưu lúc {formatSavedAt(lastSavedAt)}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving}
        >
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}

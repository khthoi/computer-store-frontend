"use client";

import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { AdminSearchBar } from "@/src/components/admin/shared/AdminSearchBar";
import { AdminDateRangePicker } from "@/src/components/admin/shared/AdminDateRangePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketFilters {
  search: string;
  status: string;
  priority: string;
  assignedTo: string;
  dateRange: { from: Date | null; to: Date | null };
  myTicketsOnly: boolean;
}

interface TicketListToolbarProps {
  value: TicketFilters;
  onChange: (v: TicketFilters) => void;
  staffOptions?: { value: string; label: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "open", label: "Mở" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã giải quyết" },
  { value: "closed", label: "Đóng" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn" },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketListToolbar — filter bar for the support ticket list.
 */
export function TicketListToolbar({
  value,
  onChange,
  staffOptions = [],
}: TicketListToolbarProps) {
  function set(partial: Partial<TicketFilters>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-secondary-100 px-4 py-3 shadow-sm">
      {/* Search */}
      <AdminSearchBar
        value={value.search}
        onChange={(s) => set({ search: s })}
        placeholder="Tìm theo chủ đề, khách hàng..."
        className="w-64"
      />

      {/* Status */}
      <Select
        label=""
        placeholder="Trạng thái: Tất cả"
        options={STATUS_OPTIONS}
        value={value.status}
        onChange={(v) => set({ status: v as string })}
        size="sm"
      />

      {/* Priority */}
      <Select
        label=""
        placeholder="Ưu tiên: Tất cả"
        options={PRIORITY_OPTIONS}
        value={value.priority}
        onChange={(v) => set({ priority: v as string })}
        size="sm"
      />

      {/* Assigned to */}
      <Select
        label=""
        placeholder="Phụ trách"
        options={staffOptions}
        value={value.assignedTo}
        onChange={(v) => set({ assignedTo: v as string })}
        searchable
        clearable
        size="sm"
      />

      {/* Date range */}
      <AdminDateRangePicker
        value={value.dateRange}
        onChange={(range) => set({ dateRange: range })}
      />

      {/* My tickets toggle */}
      <Toggle
        label="Của tôi"
        size="sm"
        checked={value.myTicketsOnly}
        onChange={(e) => set({ myTicketsOnly: e.target.checked })}
      />
    </div>
  );
}

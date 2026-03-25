"use client";

import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BulkAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

export interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BulkActionBar — appears when one or more table rows are selected.
 * Shows a count label, action buttons, and a clear-selection button.
 */
export function BulkActionBar({
  selectedCount,
  actions,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5",
        "transition-all duration-200 translate-y-0 opacity-100",
      ].join(" ")}
    >
      {/* Count label */}
      <span className="text-sm font-medium text-primary-700">
        {selectedCount} đã chọn
      </span>

      {/* Divider */}
      <span className="text-secondary-300 select-none">|</span>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
              action.variant === "danger"
                ? "text-error-600 hover:bg-error-50 focus:ring-error-400"
                : "text-secondary-700 hover:bg-secondary-100",
            ].join(" ")}
          >
            {action.icon && (
              <span className="flex h-4 w-4 shrink-0 items-center" aria-hidden="true">
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clear selection button */}
      <button
        type="button"
        aria-label="Bỏ chọn tất cả"
        onClick={onClearSelection}
        className="flex h-6 w-6 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="text-base leading-none select-none" aria-hidden="true">
          ×
        </span>
      </button>
    </div>
  );
}

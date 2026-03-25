"use client";

import type { ReactNode } from "react";
import { AdminSearchBar } from "./AdminSearchBar";
import { BulkActionBar, type BulkAction } from "./BulkActionBar";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableToolbarProps {
  /** Current search input value */
  searchValue: string;
  /** Search change handler */
  onSearchChange: (v: string) => void;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Middle slot — FilterDropdown instances or other filter controls */
  filters?: ReactNode;
  /** Right slot — action buttons like "New Product", ExportButton, etc. */
  actions?: ReactNode;
  /** Number of currently selected rows */
  selectedCount?: number;
  /** Bulk action definitions — shown when selectedCount > 0 */
  bulkActions?: BulkAction[];
  /** Called when the user clears the current selection */
  onClearSelection?: () => void;
  /** Shows a loading spinner in the search bar */
  isLoading?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TableToolbar — standard toolbar above admin DataTable.
 *
 * Layout:
 *  [SearchBar]  [filters…]  [actions | BulkActionBar]
 *
 * When `selectedCount > 0` the BulkActionBar replaces the `actions` slot.
 */
export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
  selectedCount = 0,
  bulkActions = [],
  onClearSelection,
  isLoading = false,
  className = "",
}: TableToolbarProps) {
  const hasBulkSelection = selectedCount > 0;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Left — search input */}
      <AdminSearchBar
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        isLoading={isLoading}
        className="flex-1 min-w-[200px] max-w-xs"
      />

      {/* Middle — filter slot */}
      {filters}

      {/* Right — bulk bar when rows selected, otherwise normal actions */}
      {hasBulkSelection ? (
        <BulkActionBar
          selectedCount={selectedCount}
          actions={bulkActions}
          onClearSelection={onClearSelection ?? (() => {})}
        />
      ) : (
        actions
      )}
    </div>
  );
}

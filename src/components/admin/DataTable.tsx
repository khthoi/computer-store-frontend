"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InboxIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface ColumnDef<T = Record<string, unknown>> {
  /** Maps to a key in the data row for default rendering. Can be a dot-path-free field name. */
  key: string;
  header: string;
  /** Custom cell renderer. Receives the raw cell value and the full row. */
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  /** Tailwind width class (e.g. "w-48", "w-24") */
  width?: string;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  isDanger?: boolean;
  /** Receives the array of selected row key strings */
  onClick: (selectedKeys: string[]) => void;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  /**
   * Field name whose value uniquely identifies each row (e.g. "id").
   * Values must be string-coercible.
   */
  keyField: keyof T & string;

  // ── Selection ──────────────────────────────────────────────────────────────
  selectable?: boolean;
  /** Called whenever the selection changes */
  onSelectionChange?: (selectedKeys: string[]) => void;

  // ── Bulk actions ──────────────────────────────────────────────────────────
  bulkActions?: BulkAction[];

  // ── Sort (server-side — parent owns data) ─────────────────────────────────
  sortKey?: string;
  sortDir?: SortDir;
  onSortChange?: (key: string, dir: SortDir) => void;

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;

  // ── Toolbar ───────────────────────────────────────────────────────────────
  /** Slot for filter dropdowns, action buttons, etc. */
  toolbarActions?: ReactNode;

  // ── Pagination ────────────────────────────────────────────────────────────
  page: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  /** CTA rendered beneath empty state message */
  emptyAction?: ReactNode;

  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;

const ALIGN: Record<string, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

function cellValue<T extends Record<string, unknown>>(
  row: T,
  key: string
): unknown {
  return (row as Record<string, unknown>)[key];
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({
  colCount,
  selectable,
}: {
  colCount: number;
  selectable: boolean;
}) {
  return (
    <tr aria-hidden="true">
      {selectable && (
        <td className="w-10 px-4 py-3">
          <div className="h-4 w-4 rounded animate-pulse bg-secondary-200" />
        </td>
      )}
      {Array.from({ length: colCount }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded animate-pulse bg-secondary-200"
            style={{ width: `${60 + ((i * 37) % 30)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DataTable — full-featured admin data table.
 *
 * Features: sortable columns (server-side), row selection + bulk actions,
 * debounced search, toolbar slot, pagination with page-size selector,
 * loading skeleton, empty state, responsive horizontal scroll.
 *
 * ```tsx
 * <DataTable
 *   data={products}
 *   keyField="id"
 *   columns={[
 *     { key: "name",     header: "Product",  sortable: true },
 *     { key: "price",    header: "Price",    sortable: true, align: "right",
 *       render: (v) => formatVND(v as number) },
 *     { key: "status",   header: "Status",
 *       render: (v) => <StatusBadge status={v as AdminStatus} /> },
 *   ]}
 *   selectable
 *   bulkActions={[{ id: "delete", label: "Delete", isDanger: true, onClick: handleBulkDelete }]}
 *   sortKey={sort.key}  sortDir={sort.dir}  onSortChange={setSort}
 *   searchQuery={search}  onSearchChange={setSearch}
 *   page={page}  pageSize={pageSize}  totalRows={total}
 *   onPageChange={setPage}  onPageSizeChange={setPageSize}
 *   isLoading={isLoading}
 *   toolbarActions={<FilterDropdown ... />}
 * />
 * ```
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  selectable = false,
  onSelectionChange,
  bulkActions = [],
  sortKey,
  sortDir,
  onSortChange,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  toolbarActions,
  page,
  pageSize,
  totalRows,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  emptyMessage = "No results found.",
  emptyIcon,
  emptyAction,
  className = "",
}: DataTableProps<T>) {
  const searchId = useId();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allKeys = data.map((row) => String(cellValue(row, keyField)));
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selected.has(k));
  const selectedKeys = Array.from(selected);

  // ── Selection handlers ────────────────────────────────────────────────────

  const handleSelectAll = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = new Set(e.target.checked ? allKeys : []);
      setSelected(next);
      onSelectionChange?.(Array.from(next));
    },
    [allKeys, onSelectionChange]
  );

  const handleSelectRow = useCallback(
    (key: string, checked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        checked ? next.add(key) : next.delete(key);
        onSelectionChange?.(Array.from(next));
        return next;
      });
    },
    [onSelectionChange]
  );

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange?.(val), DEBOUNCE_MS);
    },
    [onSearchChange]
  );

  const clearSearch = useCallback(() => {
    setLocalSearch("");
    onSearchChange?.("");
  }, [onSearchChange]);

  // ── Sort ──────────────────────────────────────────────────────────────────

  const handleSortClick = useCallback(
    (key: string) => {
      if (!onSortChange) return;
      if (sortKey === key) {
        onSortChange(key, sortDir === "asc" ? "desc" : "asc");
      } else {
        onSortChange(key, "asc");
      }
    },
    [onSortChange, sortDir, sortKey]
  );

  // ── Pagination ────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const pageStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, totalRows);

  const goTo = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(totalPages, p));
      if (clamped !== page) onPageChange(clamped);
    },
    [page, totalPages, onPageChange]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={[
        "flex flex-col rounded-xl border border-secondary-200 bg-white overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-4 py-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-secondary-200 bg-white py-2 pl-9 pr-8 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {localSearch && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-700 focus-visible:outline-none"
            >
              <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Right-side actions */}
        {toolbarActions && (
          <div className="flex flex-wrap items-center gap-2">
            {toolbarActions}
          </div>
        )}
      </div>

      {/* ── Bulk action bar ── */}
      {selectable && selectedKeys.length > 0 && (
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-3 border-b border-primary-200 bg-primary-50 px-4 py-2.5"
        >
          <span className="text-sm font-medium text-primary-700">
            {selectedKeys.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => action.onClick(selectedKeys)}
                className={[
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  action.isDanger
                    ? "border-error-300 bg-white text-error-600 hover:bg-error-50"
                    : "border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                ].join(" ")}
              >
                {action.icon && (
                  <span className="w-3.5 h-3.5" aria-hidden="true">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(new Set());
              onSelectionChange?.([]);
            }}
            className="ml-auto text-xs text-secondary-500 hover:text-secondary-800 focus-visible:outline-none"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          {/* Header */}
          <thead className="bg-secondary-50">
            <tr className="border-b border-secondary-200">
              {/* Select-all */}
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary-500",
                    ALIGN[col.align ?? "left"],
                    col.width ?? "",
                    col.sortable && onSortChange ? "cursor-pointer select-none hover:text-secondary-800" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={col.sortable ? () => handleSortClick(col.key) : undefined}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : col.sortable
                      ? "none"
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-secondary-400" aria-hidden="true">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ChevronUpDownIcon className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-secondary-100">
            {isLoading ? (
              <>
                {Array.from({ length: pageSize > 10 ? 10 : pageSize }, (_, i) => (
                  <SkeletonRow
                    key={i}
                    colCount={columns.length}
                    selectable={selectable}
                  />
                ))}
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="sr-only"
                    aria-busy="true"
                  >
                    Loading…
                  </td>
                </tr>
              </>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-secondary-300" aria-hidden="true">
                      {emptyIcon ?? <InboxIcon className="w-12 h-12" />}
                    </span>
                    <p className="text-sm font-medium text-secondary-500">
                      {emptyMessage}
                    </p>
                    {emptyAction && <div className="mt-1">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const key = String(cellValue(row, keyField));
                const isSelected = selected.has(key);

                return (
                  <tr
                    key={key}
                    className={[
                      "transition-colors",
                      isSelected
                        ? "bg-primary-50"
                        : "hover:bg-secondary-50/70",
                    ].join(" ")}
                  >
                    {selectable && (
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select row ${key}`}
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(key, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const raw = cellValue(row, col.key);
                      const display = col.render
                        ? col.render(raw, row)
                        : raw == null
                        ? "—"
                        : String(raw);

                      return (
                        <td
                          key={col.key}
                          className={[
                            "px-4 py-3 text-secondary-700",
                            ALIGN[col.align ?? "left"],
                          ].join(" ")}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: pagination ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-secondary-200 px-4 py-3">
        {/* Row count info */}
        <p className="text-xs text-secondary-500">
          {totalRows === 0
            ? "No results"
            : `Showing ${pageStart}–${pageEnd} of ${totalRows.toLocaleString()} rows`}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Page size */}
          <div className="flex items-center gap-2 text-xs text-secondary-600">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
              className="rounded border border-secondary-200 bg-white py-1 pl-2 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Page nav */}
          <nav aria-label="Table pagination" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1 || isLoading}
              onClick={() => goTo(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ChevronUpIcon className="w-4 h-4 -rotate-90" aria-hidden="true" />
            </button>

            <span className="min-w-[5rem] text-center text-xs text-secondary-600">
              {isLoading ? (
                <ArrowPathIcon
                  className="inline w-4 h-4 animate-spin text-secondary-400"
                  aria-hidden="true"
                />
              ) : (
                <>
                  Page{" "}
                  <span className="font-semibold text-secondary-900">{page}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-secondary-900">{totalPages}</span>
                </>
              )}
            </span>

            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || isLoading}
              onClick={() => goTo(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ChevronDownIcon className="w-4 h-4 -rotate-90" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name               Type                              Default   Description
 * ──────────────────────────────────────────────────────────────────────────────
 * data               T[]                               required  Row data
 * columns            ColumnDef<T>[]                    required  Column definitions
 * keyField           keyof T & string                  required  Unique row identifier field
 * selectable         boolean                           false     Show row checkboxes
 * onSelectionChange  (keys: string[]) => void          —         Selection change callback
 * bulkActions        BulkAction[]                      []        Actions shown when rows selected
 * sortKey            string                            —         Currently sorted column key
 * sortDir            "asc"|"desc"                      —         Current sort direction
 * onSortChange       (key, dir) => void                —         Sort change callback
 * searchQuery        string                            ""        Controlled search value
 * onSearchChange     (query: string) => void           —         Search change callback (300ms debounce)
 * searchPlaceholder  string                            "Search…" Input placeholder
 * toolbarActions     ReactNode                         —         Filter dropdowns / action buttons
 * page               number                            required  Current page (1-based)
 * pageSize           number                            required  Rows per page
 * totalRows          number                            required  Total row count for pagination
 * pageSizeOptions    number[]                          [10,25,50,100] Page size choices
 * onPageChange       (page: number) => void            required  Page change callback
 * onPageSizeChange   (size: number) => void            required  Page size change callback
 * isLoading          boolean                           false     Show skeleton rows
 * emptyMessage       string                            "No results found." Empty state label
 * emptyIcon          ReactNode                         InboxIcon Empty state icon
 * emptyAction        ReactNode                         —         CTA beneath empty message
 * className          string                            ""        Extra classes on root div
 */

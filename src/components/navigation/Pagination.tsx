"use client";

import { useCallback, useId, type ChangeEvent, type KeyboardEvent } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaginationSizeOption = 10 | 20 | 50 | 100 | number;
export type PaginationSize = "default" | "sm";

export interface PaginationProps {
  /**
   * Visual size of the pagination controls.
   * @default "default"
   */
  size?: PaginationSize;
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when the user navigates to a new page */
  onPageChange: (page: number) => void;
  /**
   * Show the "items per page" selector.
   * @default false
   */
  showPageSize?: boolean;
  /** Current page size */
  pageSize?: number;
  /** Available page size options */
  pageSizeOptions?: PaginationSizeOption[];
  /** Called when the user changes the page size */
  onPageSizeChange?: (size: number) => void;
  /**
   * Show the "Go to page" input.
   * @default false
   */
  showJumpTo?: boolean;
  /**
   * Maximum page buttons shown (including ellipsis slots).
   * @default 7
   */
  siblingCount?: number;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPageRange(page: number, total: number, siblingCount: number): Array<number | "…"> {
  if (total <= siblingCount) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, page - Math.floor((siblingCount - 3) / 2));
  const right = Math.min(total - 1, page + Math.ceil((siblingCount - 3) / 2));

  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const pages: Array<number | "…"> = [1];
  if (showLeftEllipsis) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (showRightEllipsis) pages.push("…");
  pages.push(total);

  return pages;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageButton({
  pageNum,
  current,
  disabled,
  onClick,
  size = "default",
}: {
  pageNum: number;
  current: boolean;
  disabled?: boolean;
  onClick: () => void;
  size?: PaginationSize;
}) {
  const isSm = size === "sm";
  return (
    <button
      type="button"
      aria-label={`Page ${pageNum}`}
      aria-current={current ? "page" : undefined}
      disabled={disabled || current}
      onClick={onClick}
      className={[
        "flex items-center justify-center rounded font-medium transition-colors",
        isSm
          ? "h-7 min-w-[1.75rem] px-1.5 text-xs"
          : "h-9 min-w-[2.25rem] px-2 text-sm",
        current
          ? "bg-primary-600 text-white"
          : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
      ].join(" ")}
    >
      {pageNum}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Pagination — page controls with optional page size selector and jump-to input.
 *
 * ```tsx
 * <Pagination
 *   page={currentPage}
 *   totalPages={Math.ceil(total / pageSize)}
 *   onPageChange={setCurrentPage}
 *   showPageSize
 *   pageSize={pageSize}
 *   pageSizeOptions={[10, 20, 50]}
 *   onPageSizeChange={setPageSize}
 *   showJumpTo
 * />
 * ```
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  showPageSize = false,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  showJumpTo = false,
  siblingCount = 7,
  size = "default",
  className = "",
}: PaginationProps) {
  const jumpId = useId();
  const isSm = size === "sm";

  const goTo = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(totalPages, p));
      if (clamped !== page) onPageChange(clamped);
    },
    [page, totalPages, onPageChange]
  );

  const handleJumpKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val)) {
          goTo(val);
          (e.target as HTMLInputElement).value = "";
        }
      }
    },
    [goTo]
  );

  const handlePageSizeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onPageSizeChange?.(val);
    },
    [onPageSizeChange]
  );

  if (totalPages <= 0) return null;

  const pages = buildPageRange(page, totalPages, siblingCount);
  const isFirst = page === 1;
  const isLast = page === totalPages;

  const navBtnClass = [
    "flex items-center justify-center rounded text-secondary-500 transition-colors",
    isSm ? "h-7 w-7" : "h-9 w-9",
    "hover:bg-secondary-100 hover:text-secondary-800",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
  ].join(" ");

  const iconClass = isSm ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div
      className={[
        "flex flex-wrap items-center",
        isSm ? "gap-1.5" : "gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Page size selector */}
      {showPageSize && (
        <div className={["flex items-center gap-2 text-secondary-600", isSm ? "text-xs" : "text-sm"].join(" ")}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className={["rounded border border-secondary-200 bg-white py-1 pl-2 pr-6 text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500", isSm ? "text-xs" : "text-sm"].join(" ")}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nav controls */}
      <nav aria-label="Pagination" className="flex items-center gap-0.5">
        {/* First page */}
        <button
          type="button"
          aria-label="First page"
          disabled={isFirst}
          onClick={() => goTo(1)}
          className={navBtnClass}
        >
          <ChevronDoubleLeftIcon className={iconClass} aria-hidden="true" />
        </button>

        {/* Previous page */}
        <button
          type="button"
          aria-label="Previous page"
          disabled={isFirst}
          onClick={() => goTo(page - 1)}
          className={navBtnClass}
        >
          <ChevronLeftIcon className={iconClass} aria-hidden="true" />
        </button>

        {/* Page buttons */}
        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              aria-hidden="true"
              className={[
                "flex w-6 items-end justify-center text-secondary-400 select-none",
                isSm ? "h-7 pb-1 text-xs" : "h-9 pb-1.5 text-sm",
              ].join(" ")}
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              pageNum={p}
              current={p === page}
              onClick={() => goTo(p)}
              size={size}
            />
          )
        )}

        {/* Next page */}
        <button
          type="button"
          aria-label="Next page"
          disabled={isLast}
          onClick={() => goTo(page + 1)}
          className={navBtnClass}
        >
          <ChevronRightIcon className={iconClass} aria-hidden="true" />
        </button>

        {/* Last page */}
        <button
          type="button"
          aria-label="Last page"
          disabled={isLast}
          onClick={() => goTo(totalPages)}
          className={navBtnClass}
        >
          <ChevronDoubleRightIcon className={iconClass} aria-hidden="true" />
        </button>
      </nav>

      {/* Jump to page */}
      {showJumpTo && (
        <div className={["flex items-center gap-2 text-secondary-600", isSm ? "text-xs" : "text-sm"].join(" ")}>
          <label htmlFor={jumpId}>Go to:</label>
          <input
            id={jumpId}
            type="number"
            min={1}
            max={totalPages}
            placeholder={String(page)}
            onKeyDown={handleJumpKeyDown}
            className={["rounded border border-secondary-200 bg-white py-1 px-2 text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none", isSm ? "w-14 text-xs" : "w-16 text-sm"].join(" ")}
          />
        </div>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name               Type                    Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * page               number                  required Current page (1-based)
 * totalPages         number                  required Total page count
 * onPageChange       (page: number) => void  required Page change callback
 * showPageSize       boolean                 false    Show rows-per-page selector
 * pageSize           number                  —        Current page size value
 * pageSizeOptions    number[]                [10,20,50,100] Size options
 * onPageSizeChange   (size: number) => void  —        Size change callback
 * showJumpTo         boolean                 false    Show "Go to page" input
 * siblingCount       number                  7        Max visible page buttons
 * size               "default"|"sm"          "default" Visual size of controls
 * className          string                  ""       Extra classes on root div
 */

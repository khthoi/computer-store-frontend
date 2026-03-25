"use client";

import {
  useCallback,
  useState,
  type ReactNode,
} from "react";
import {
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveFilter {
  /** Unique key for this active filter */
  key: string;
  /** Human-readable label shown on the chip */
  label: string;
  /** Optional group label (e.g. "Brand", "Price") shown before the value */
  group?: string;
}

export interface FilterBarProps {
  /** Currently active filters */
  filters: ActiveFilter[];
  /** Called when a single filter chip is removed */
  onRemove: (key: string) => void;
  /** Called when the "Clear all" button is clicked */
  onClearAll: () => void;
  /**
   * Extra action slot rendered on the right (e.g. a sort dropdown or filter button).
   */
  actions?: ReactNode;
  /**
   * On mobile, collapse chips into a compact "N filters" badge.
   * @default true
   */
  collapseOnMobile?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FilterBar — horizontal strip of active-filter chips with clear controls.
 *
 * ```tsx
 * <FilterBar
 *   filters={[
 *     { key: "brand-amd",  label: "AMD",    group: "Brand" },
 *     { key: "price-high", label: "≥ $500", group: "Price" },
 *   ]}
 *   onRemove={(key) => dispatch({ type: "REMOVE_FILTER", key })}
 *   onClearAll={() => dispatch({ type: "CLEAR_FILTERS" })}
 *   actions={<SortDropdown />}
 * />
 * ```
 */
export function FilterBar({
  filters,
  onRemove,
  onClearAll,
  actions,
  collapseOnMobile = true,
  className = "",
}: FilterBarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const handleClearAll = useCallback(() => {
    onClearAll();
    setMobileExpanded(false);
  }, [onClearAll]);

  const count = filters.length;
  if (count === 0 && !actions) return null;

  return (
    <div
      className={[
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Filter icon label */}
      {count > 0 && (
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-secondary-500">
          <FunnelIcon className="w-4 h-4" aria-hidden="true" />
          Filters:
        </span>
      )}

      {/* ── Mobile: collapse toggle ── */}
      {collapseOnMobile && count > 0 && (
        <button
          type="button"
          onClick={() => setMobileExpanded((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 text-sm font-medium text-secondary-700 sm:hidden"
        >
          <span>{count} active</span>
          <ChevronDownIcon
            className={[
              "w-4 h-4 text-secondary-400 transition-transform duration-150",
              mobileExpanded ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
      )}

      {/* ── Filter chips ── */}
      <div
        className={[
          "flex flex-wrap gap-2",
          // On mobile: hidden unless expanded (when collapseOnMobile is true)
          collapseOnMobile ? "hidden sm:flex" : "flex",
          collapseOnMobile && mobileExpanded ? "!flex" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {filters.map((filter) => (
          <span
            key={filter.key}
            className="inline-flex items-center gap-1 rounded-full border border-secondary-200 bg-white py-1 pl-3 pr-1.5 text-sm text-secondary-700 shadow-sm"
          >
            {filter.group && (
              <span className="text-secondary-400">{filter.group}:</span>
            )}
            <span className="font-medium">{filter.label}</span>
            <button
              type="button"
              aria-label={`Remove ${filter.group ? filter.group + ": " : ""}${filter.label} filter`}
              onClick={() => onRemove(filter.key)}
              className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <XMarkIcon className="w-3 h-3" aria-hidden="true" />
            </button>
          </span>
        ))}

        {/* Clear all */}
        {count > 1 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 rounded-full border border-error-200 bg-error-50 py-1 pl-2.5 pr-3 text-sm font-medium text-error-600 transition-colors hover:bg-error-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-400"
          >
            <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      {/* Spacer + actions slot */}
      {actions && (
        <div className="ml-auto flex shrink-0 items-center">{actions}</div>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name              Type                      Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * filters           ActiveFilter[]            required Active filter chips
 * onRemove          (key: string) => void     required Remove a single filter
 * onClearAll        () => void                required Clear all filters
 * actions           ReactNode                 —        Right-side slot (sort, etc.)
 * collapseOnMobile  boolean                   true     Collapse chips on small screens
 * className         string                    ""       Extra classes on root div
 *
 * ─── ActiveFilter ─────────────────────────────────────────────────────────────
 *
 * Name   Type    Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * key    string  yes       Unique identifier for this active filter
 * label  string  yes       Value displayed on the chip
 * group  string  no        Category label (e.g. "Brand", "Price")
 */

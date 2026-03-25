"use client";

import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminSearchBar — controlled search input for admin table toolbars.
 *
 * - Left: magnifying-glass icon
 * - Right: clear button (when value non-empty) or spinner (when isLoading)
 * - No internal debounce — fully controlled by parent
 */
export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm…",
  isLoading = false,
  className = "",
}: AdminSearchBarProps) {
  const showClear = value.length > 0 && !isLoading;
  const showSpinner = isLoading;

  return (
    <div className={`relative ${className}`}>
      {/* Left — search icon */}
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <MagnifyingGlassIcon className="h-4 w-4 text-secondary-400" aria-hidden="true" />
      </span>

      {/* Input */}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full rounded-lg border border-secondary-200 bg-white py-2 pl-9 pr-8 text-sm",
          "placeholder:text-secondary-400",
          "focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/15",
          "disabled:cursor-not-allowed disabled:bg-secondary-100",
        ].join(" ")}
      />

      {/* Right — clear button or spinner */}
      {(showClear || showSpinner) && (
        <span className="absolute inset-y-0 right-2 flex items-center">
          {showSpinner ? (
            <ArrowPathIcon
              className="h-4 w-4 animate-spin text-secondary-400"
              aria-hidden="true"
            />
          ) : (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={() => onChange("")}
              className="flex h-5 w-5 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </span>
      )}
    </div>
  );
}

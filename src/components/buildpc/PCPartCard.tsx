"use client";

import { useCallback } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import {
  ExclamationCircleIcon,
  PlusCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { formatVND } from "@/src/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompatibilityStatus =
  | "compatible"
  | "incompatible"
  | "warning"
  | "unchecked";

export interface PCPartCardProps {
  id: string;
  name: string;
  brand: string;
  thumbnail: string;
  thumbnailAlt?: string;
  price: number;
  /** Compatibility relative to the current build */
  compatibilityStatus?: CompatibilityStatus;
  /** Short compatibility note (e.g. "Requires DDR5 socket") */
  compatibilityNote?: string;
  /** Whether this part is the currently selected option */
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  /** Optional product detail link */
  href?: string;
  className?: string;
}

// ─── Compatibility indicator ──────────────────────────────────────────────────

function CompatibilityIndicator({
  status,
  note,
}: {
  status: CompatibilityStatus;
  note?: string;
}) {
  const config = {
    compatible:   { icon: <CheckCircleIcon className="w-4 h-4 text-success-500" aria-hidden="true" />,       label: "Compatible" },
    incompatible: { icon: <XCircleIcon className="w-4 h-4 text-error-500" aria-hidden="true" />,             label: "Incompatible" },
    warning:      { icon: <ExclamationCircleIcon className="w-4 h-4 text-warning-500" aria-hidden="true" />, label: "Check compatibility" },
    unchecked:    { icon: <QuestionMarkCircleIcon className="w-4 h-4 text-secondary-400" aria-hidden="true" />, label: "Compatibility unknown" },
  }[status];

  return (
    <span
      title={note ?? config.label}
      aria-label={note ?? config.label}
      className="shrink-0"
    >
      {config.icon}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PCPartCard — compact part card for the Build PC part picker list.
 *
 * Displays a horizontal layout with thumbnail, name/brand, price,
 * compatibility indicator, and a select button.
 *
 * ```tsx
 * <PCPartCard
 *   id="cpu-001"
 *   name="Intel Core i9-14900K"
 *   brand="Intel"
 *   thumbnail="/images/i9.jpg"
 *   price={12900000}
 *   compatibilityStatus="compatible"
 *   isSelected={selectedCpuId === "cpu-001"}
 *   onSelect={(id) => selectPart("cpu", id)}
 * />
 * ```
 */
export function PCPartCard({
  id,
  name,
  brand,
  thumbnail,
  thumbnailAlt,
  price,
  compatibilityStatus = "unchecked",
  compatibilityNote,
  isSelected = false,
  onSelect,
  href,
  className = "",
}: PCPartCardProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(id);
  }, [id, onSelect]);

  const isIncompatible = compatibilityStatus === "incompatible";

  return (
    <article
      className={[
        "flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all duration-150",
        isSelected
          ? "border-primary-500 bg-primary-50/30 ring-1 ring-primary-400"
          : isIncompatible
          ? "border-error-200 bg-error-50/20 opacity-70"
          : "border-secondary-200 hover:border-secondary-300 hover:shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Thumbnail */}
      {href ? (
        <a href={href} tabIndex={-1} aria-hidden="true" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={thumbnailAlt ?? name}
            className="h-14 w-14 rounded-lg border border-secondary-100 object-contain bg-secondary-50 p-1"
            loading="lazy"
          />
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={thumbnailAlt ?? name}
          className="h-14 w-14 shrink-0 rounded-lg border border-secondary-100 object-contain bg-secondary-50 p-1"
          loading="lazy"
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">
          {brand}
        </p>
        {href ? (
          <a
            href={href}
            className="block truncate text-sm font-medium text-secondary-900 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            {name}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-secondary-900">
            {name}
          </p>
        )}
        <p className="mt-0.5 text-sm font-bold text-primary-700">
          {formatVND(price)}
        </p>
      </div>

      {/* Compatibility */}
      <CompatibilityIndicator status={compatibilityStatus} note={compatibilityNote} />

      {/* Select / selected button */}
      <button
        type="button"
        disabled={isIncompatible}
        onClick={handleSelect}
        aria-label={isSelected ? `${name} selected` : `Select ${name}`}
        aria-pressed={isSelected}
        className={[
          "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
          isSelected
            ? "bg-primary-600 text-white"
            : isIncompatible
            ? "cursor-not-allowed bg-secondary-100 text-secondary-400"
            : "border border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        ].join(" ")}
      >
        {isSelected ? (
          <>
            <CheckIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Selected
          </>
        ) : (
          <>
            <PlusCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Select
          </>
        )}
      </button>
    </article>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name                 Type                                       Default      Description
 * ──────────────────────────────────────────────────────────────────────────────
 * id                   string                                     required     Part identifier
 * name                 string                                     required     Part name
 * brand                string                                     required     Brand label
 * thumbnail            string                                     required     Image src
 * thumbnailAlt         string                                     —            Image alt text
 * price                number                                     required     Price (VND)
 * compatibilityStatus  "compatible"|"incompatible"|"warning"|…    "unchecked"  Compatibility state
 * compatibilityNote    string                                     —            Tooltip/aria label for compatibility
 * isSelected           boolean                                    false        Highlight as currently selected
 * onSelect             (id: string) => void                       —            Selection callback
 * href                 string                                     —            Product detail URL
 * className            string                                     ""           Extra classes on <article>
 */

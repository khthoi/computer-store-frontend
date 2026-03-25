"use client";

import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkeletonVariant = "text" | "card" | "avatar" | "table-row" | "rect";

export interface SkeletonProps {
  /** Pre-built shape variant
   * @default "rect"
   */
  variant?: SkeletonVariant;
  /**
   * Number of times to repeat the skeleton (useful for lists).
   * @default 1
   */
  count?: number;
  /** Width — accepts any Tailwind w-* class or arbitrary value
   * @default "w-full"
   */
  width?: string;
  /** Height — accepts any Tailwind h-* class or arbitrary value */
  height?: string;
  /** Rounded corners — accepts any Tailwind rounded-* class
   * @default "rounded"
   */
  rounded?: string;
  /** Override all classes (bypasses variant defaults) */
  className?: string;
}

// ─── Base shimmer ─────────────────────────────────────────────────────────────

const SHIMMER =
  "animate-pulse bg-secondary-200";

// ─── Variant presets ──────────────────────────────────────────────────────────

/** A single shimmer bar */
function SkeletonBar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`${SHIMMER} ${className}`} />;
}

/** "text" variant: stacked lines of different widths */
function TextSkeleton({ count }: { count: number }) {
  const widths = ["w-full", "w-4/5", "w-full", "w-3/4", "w-5/6"];
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBar
          key={i}
          className={`h-4 rounded ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

/** "card" variant: image placeholder + text lines */
function CardSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <SkeletonBar className="h-48 w-full rounded-md" />
          <SkeletonBar className="h-4 w-3/4 rounded" />
          <SkeletonBar className="h-4 w-1/2 rounded" />
          <SkeletonBar className="h-5 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}

/** "avatar" variant: circle + text lines side by side */
function AvatarSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBar className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBar className="h-4 w-1/3 rounded" />
            <SkeletonBar className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** "table-row" variant: horizontal cell placeholders */
function TableRowSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col divide-y divide-secondary-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <SkeletonBar className="h-4 w-8 rounded" />
          <SkeletonBar className="h-4 flex-1 rounded" />
          <SkeletonBar className="h-4 w-20 rounded" />
          <SkeletonBar className="h-4 w-16 rounded" />
          <SkeletonBar className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Skeleton — shimmer loading placeholder.
 *
 * ```tsx
 * // Generic rectangle
 * <Skeleton height="h-10" width="w-48" />
 *
 * // Product card placeholder
 * <Skeleton variant="card" count={3} />
 *
 * // User list placeholder
 * <Skeleton variant="avatar" count={5} />
 *
 * // Table body placeholder
 * <Skeleton variant="table-row" count={8} />
 *
 * // Paragraph text placeholder
 * <Skeleton variant="text" count={4} />
 * ```
 */
export function Skeleton({
  variant = "rect",
  count = 1,
  width = "w-full",
  height = "h-4",
  rounded = "rounded",
  className,
}: SkeletonProps) {
  if (className) {
    // Fully custom — bypass variant system
    return (
      <div aria-busy="true" aria-label="Loading…">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBar key={i} className={className} />
        ))}
      </div>
    );
  }

  return (
    <div aria-busy="true" aria-label="Loading…">
      {variant === "text"      && <TextSkeleton count={count} />}
      {variant === "card"      && <CardSkeleton count={count} />}
      {variant === "avatar"    && <AvatarSkeleton count={count} />}
      {variant === "table-row" && <TableRowSkeleton count={count} />}
      {variant === "rect"      && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonBar key={i} className={`${height} ${width} ${rounded}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type                                       Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * variant    "rect"|"text"|"card"|"avatar"|"table-row"  "rect"     Pre-built shape
 * count      number                                     1          Repetitions
 * width      string (Tailwind w-*)                      "w-full"   Width (rect only)
 * height     string (Tailwind h-*)                      "h-4"      Height (rect only)
 * rounded    string (Tailwind rounded-*)                "rounded"  Border radius (rect only)
 * className  string                                     —          Override all classes
 */

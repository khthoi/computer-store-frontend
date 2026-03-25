"use client";

import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerColor = "primary" | "secondary" | "white" | "current";

export interface SpinnerProps {
  /** @default "md" */
  size?: SpinnerSize;
  /** @default "primary" */
  color?: SpinnerColor;
  /** Accessible label for screen readers
   * @default "Loading…"
   */
  label?: string;
  className?: string;
}

export interface SpinnerOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Text displayed beneath the spinner */
  message?: string;
  /** Spinner size
   * @default "lg"
   */
  size?: SpinnerSize;
  children: ReactNode;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const SIZE: Record<SpinnerSize, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
};

const STROKE: Record<SpinnerSize, number> = {
  xs: 3,
  sm: 3,
  md: 2.5,
  lg: 2.5,
  xl: 2,
};

const COLOR: Record<SpinnerColor, string> = {
  primary:   "text-primary-600",
  secondary: "text-secondary-400",
  white:     "text-white",
  current:   "text-current",
};

// ─── Spinner component ────────────────────────────────────────────────────────

/**
 * Spinner — animated loading indicator.
 *
 * ```tsx
 * // Inline next to text
 * <span className="flex items-center gap-2">
 *   <Spinner size="sm" /> Loading products…
 * </span>
 *
 * // Centered on a card
 * <div className="flex justify-center py-8">
 *   <Spinner size="lg" />
 * </div>
 *
 * // White on a dark background
 * <Spinner color="white" />
 * ```
 */
export function Spinner({
  size = "md",
  color = "primary",
  label = "Loading…",
  className = "",
}: SpinnerProps) {
  const stroke = STROKE[size];

  return (
    <svg
      className={[
        "animate-spin",
        SIZE[size],
        COLOR[color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
    >
      <title>{label}</title>
      {/* Track ring */}
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={stroke}
      />
      {/* Spinning arc */}
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─── SpinnerOverlay component ─────────────────────────────────────────────────

/**
 * SpinnerOverlay — covers its children with a translucent spinner overlay.
 * Useful for async operations on cards, tables, or forms.
 *
 * ```tsx
 * <SpinnerOverlay isVisible={isSaving} message="Saving…">
 *   <ProductForm ... />
 * </SpinnerOverlay>
 * ```
 */
export function SpinnerOverlay({
  isVisible,
  message,
  size = "lg",
  children,
}: SpinnerOverlayProps) {
  return (
    <div className="relative">
      {children}

      {isVisible && (
        <div
          aria-busy="true"
          aria-label={message ?? "Loading…"}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded bg-white/70 backdrop-blur-sm"
        >
          <Spinner size={size} />
          {message && (
            <p className="text-sm font-medium text-secondary-600">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ─── Spinner Prop Table ───────────────────────────────────────────────────────
 *
 * Name      Type                                   Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * size      "xs"|"sm"|"md"|"lg"|"xl"               "md"       Spinner dimensions
 * color     "primary"|"secondary"|"white"|"current" "primary"  Spinner color
 * label     string                                 "Loading…" aria-label + title
 * className string                                 ""         Extra Tailwind classes
 *
 * ─── SpinnerOverlay Prop Table ────────────────────────────────────────────────
 *
 * Name       Type      Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * isVisible  boolean   required   Shows/hides the overlay
 * message    string    —          Text below the spinner
 * size       SpinnerSize "lg"     Spinner size
 * children   ReactNode required   Content to overlay
 */

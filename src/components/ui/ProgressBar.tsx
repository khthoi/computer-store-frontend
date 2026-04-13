"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressBarVariant = "default" | "success" | "warning" | "error" | "info";
export type ProgressBarSize    = "xs" | "sm" | "md" | "lg";

export interface ProgressBarProps {
  /** Current value (0 → max) */
  value:       number;
  /** Maximum value — @default 100 */
  max?:        number;
  /** Track height — @default "md" */
  size?:       ProgressBarSize;
  /** Fill colour variant — @default "default" */
  variant?:    ProgressBarVariant;
  /**
   * Show "N / max" or percentage label to the right of the bar.
   * @default false
   */
  showValue?:  boolean;
  /**
   * When true the label reads "N / max" instead of "N%".
   * Only relevant when `showValue` is true.
   * @default false
   */
  showCount?:  boolean;
  /** Text rendered above the track */
  label?:      string;
  /** Text rendered below the track */
  caption?:    string;
  /** Animate the fill width transition */
  animated?:   boolean;
  className?:  string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const TRACK_HEIGHT: Record<ProgressBarSize, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const FILL_COLOR: Record<ProgressBarVariant, string> = {
  default: "bg-primary-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error:   "bg-red-500",
  info:    "bg-sky-500",
};

const LABEL_COLOR: Record<ProgressBarVariant, string> = {
  default: "text-primary-600",
  success: "text-green-600",
  warning: "text-amber-600",
  error:   "text-red-600",
  info:    "text-sky-600",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProgressBar — displays a horizontal progress indicator.
 *
 * ```tsx
 * <ProgressBar value={30} max={100} showValue label="Đang tải..." />
 * <ProgressBar value={7} max={10} showCount variant="success" size="sm" />
 * ```
 */
export function ProgressBar({
  value,
  max       = 100,
  size      = "md",
  variant   = "default",
  showValue = false,
  showCount = false,
  label,
  caption,
  animated  = true,
  className = "",
}: ProgressBarProps) {
  const pct     = Math.round(clamp((value / Math.max(max, 1)) * 100, 0, 100));
  const display = showCount ? `${value} / ${max}` : `${pct}%`;

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {/* Top row: label + value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label ? (
            <span className="text-xs font-medium text-secondary-700">{label}</span>
          ) : (
            <span />
          )}
          {showValue && (
            <span className={["text-xs font-semibold tabular-nums", LABEL_COLOR[variant]].join(" ")}>
              {display}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={[
          "w-full rounded-full bg-secondary-100 overflow-hidden",
          TRACK_HEIGHT[size],
        ].join(" ")}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        {/* Fill */}
        <div
          className={[
            "h-full rounded-full",
            FILL_COLOR[variant],
            animated ? "transition-all duration-500 ease-out" : "",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Caption */}
      {caption && (
        <p className="mt-1 text-xs text-secondary-400">{caption}</p>
      )}
    </div>
  );
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type StarRatingSize = "sm" | "md" | "lg";

export interface StarRatingProps {
  value:       1 | 2 | 3 | 4 | 5 | number;
  max?:        number;
  size?:       StarRatingSize;
  showValue?:  boolean;
  className?:  string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const STAR_SIZE: Record<StarRatingSize, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StarRating — display-only star rating component.
 *
 * ```tsx
 * <StarRating value={4} size="sm" />
 * <StarRating value={4.3} showValue />
 * ```
 */
export function StarRating({
  value,
  max       = 5,
  size      = "md",
  showValue = false,
  className = "",
}: StarRatingProps) {
  const starSize = STAR_SIZE[size];

  return (
    <div className={["inline-flex items-center gap-0.5", className].filter(Boolean).join(" ")}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <svg
            key={i}
            className={[starSize, "shrink-0", filled ? "text-amber-400" : "text-secondary-200"].join(" ")}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}

      {showValue && (
        <span className="ml-1 text-xs font-semibold text-secondary-600 tabular-nums">
          {Number.isInteger(value) ? value : value.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
}

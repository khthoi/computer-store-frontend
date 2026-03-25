import type { ReactNode } from "react";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminEmptyStateProps {
  /** Icon element — will be rendered inside the icon wrapper (text-secondary-400, w-8 h-8 recommended) */
  icon: ReactNode;
  /** Primary heading text */
  title: string;
  /** Optional supporting description */
  description?: string;
  /** Optional primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Visual hint for the type of empty state.
   * "no-data" — first time / no records yet.
   * "no-results" — search/filter returned nothing.
   */
  variant?: "no-data" | "no-results";
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminEmptyState — centered empty-state block for admin table pages.
 *
 * Not a client component — renders server-side with a static Button if needed.
 */
export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      {/* Icon wrapper */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
        <span className="flex h-8 w-8 items-center justify-center text-secondary-400">
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-secondary-800">{title}</h3>

      {/* Description */}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-secondary-500">{description}</p>
      )}

      {/* Action button */}
      {action && (
        <div className="mt-6">
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

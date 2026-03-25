import type { ReactNode } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returning";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<
  OrderStatus,
  { label: string; wrapper: string; icon: ReactNode }
> = {
  pending: {
    label: "Pending",
    wrapper: "bg-warning-50 text-warning-700 border-warning-200",
    icon: <ClockIcon className="shrink-0" aria-hidden="true" />,
  },
  confirmed: {
    label: "Confirmed",
    wrapper: "bg-info-50 text-info-700 border-info-200",
    icon: <CheckCircleIcon className="shrink-0" aria-hidden="true" />,
  },
  packing: {
    label: "Packing",
    wrapper: "bg-secondary-100 text-secondary-700 border-secondary-200",
    icon: <ArchiveBoxIcon className="shrink-0" aria-hidden="true" />,
  },
  shipping: {
    label: "Shipping",
    wrapper: "bg-primary-50 text-primary-700 border-primary-200",
    icon: <TruckIcon className="shrink-0" aria-hidden="true" />,
  },
  delivered: {
    label: "Delivered",
    wrapper: "bg-success-50 text-success-700 border-success-200",
    icon: <CheckBadgeIcon className="shrink-0" aria-hidden="true" />,
  },
  cancelled: {
    label: "Cancelled",
    wrapper: "bg-error-50 text-error-700 border-error-200",
    icon: <XCircleIcon className="shrink-0" aria-hidden="true" />,
  },
  returning: {
    label: "Returning",
    wrapper: "bg-warning-50 text-warning-700 border-warning-200",
    icon: <ArrowPathIcon className="shrink-0" aria-hidden="true" />,
  },
};

const SIZE: Record<"sm" | "md" | "lg", { badge: string; icon: string }> = {
  sm: { badge: "px-2 py-0.5 text-[10px] gap-1",   icon: "w-3 h-3" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5",      icon: "w-3.5 h-3.5" },
  lg: { badge: "px-3 py-1.5 text-sm gap-2",         icon: "w-4 h-4" },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OrderStatusBadge — color-coded badge for all order lifecycle states.
 *
 * ```tsx
 * <OrderStatusBadge status="shipping" />
 * <OrderStatusBadge status="delivered" size="lg" />
 * ```
 */
export function OrderStatusBadge({
  status,
  size = "md",
  className = "",
}: OrderStatusBadgeProps) {
  const { label, wrapper, icon } = CONFIG[status];
  const { badge, icon: iconSize } = SIZE[size];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-medium",
        wrapper,
        badge,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Clone icon with size class */}
      <span className={iconSize} aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type                                                 Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * status     "pending"|"confirmed"|"packing"|"shipping"|         required Order state
 *            "delivered"|"cancelled"|"returning"
 * size       "sm"|"md"|"lg"                                       "md"     Badge dimensions
 * className  string                                               ""       Extra Tailwind classes
 */

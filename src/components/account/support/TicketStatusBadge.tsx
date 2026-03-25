import type { TicketStatus } from "@/src/app/(storefront)/account/support/_mock_data";

// ─── Style map ────────────────────────────────────────────────────────────────

interface StatusMeta {
  label: string;
  containerClass: string;
  textClass: string;
  dotClass: string;
}

const STATUS_META: Record<TicketStatus, StatusMeta> = {
  in_progress: {
    label: "Đang xử lý",
    containerClass: "bg-amber-50 border border-amber-200",
    textClass: "text-amber-700",
    dotClass: "bg-amber-500",
  },
  resolved: {
    label: "Đã giải quyết",
    containerClass: "bg-success-50 border border-success-200",
    textClass: "text-success-700",
    dotClass: "bg-success-500",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface TicketStatusBadgeProps {
  status: TicketStatus;
}

/**
 * TicketStatusBadge — pill chip showing the current state of a support ticket.
 * Mirrors the visual style of ReturnStatusBadge.
 */
export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const { label, containerClass, textClass, dotClass } = STATUS_META[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
        containerClass,
      ].join(" ")}
    >
      <span
        className={["h-2 w-2 rounded-full shrink-0", dotClass].join(" ")}
        aria-hidden="true"
      />
      <span className={textClass}>{label}</span>
    </span>
  );
}

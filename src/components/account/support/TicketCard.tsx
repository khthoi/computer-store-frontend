import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { TicketStatusBadge } from "@/src/components/account/support/TicketStatusBadge";
import {
  TICKET_CATEGORY_LABELS,
  type SupportTicket,
} from "@/src/app/(storefront)/account/support/_mock_data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketCardProps {
  ticket: SupportTicket;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketCard — summary card for a single support ticket in the ticket list.
 * Server-compatible (no client hooks). Mirrors ReturnRequestSummaryCard layout.
 */
export function TicketCard({ ticket }: TicketCardProps) {
  const latestMessage = ticket.messages.at(-1);
  const hasUnreadReply =
    ticket.status === "in_progress" && latestMessage?.role === "staff";

  return (
    <article
      className="rounded-xl bg-white overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 bg-secondary-50 px-4 py-3 border-b border-secondary-100">
        <span className="font-mono text-sm font-semibold text-secondary-900">
          {ticket.id}
        </span>
        <div className="flex items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          {hasUnreadReply && (
            <span className="h-2 w-2 rounded-full bg-primary-500 shrink-0" aria-label="Có tin nhắn mới" />
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 space-y-2">
        {/* Subject */}
        <p className="text-sm font-medium text-secondary-900 line-clamp-1">
          {ticket.subject}
        </p>

        {/* Meta row: category badge + updated date */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-secondary-400">
          <Badge variant="default" size="sm">
            {TICKET_CATEGORY_LABELS[ticket.category]}
          </Badge>
          <span className="text-secondary-300">·</span>
          <span>Cập nhật {formatDate(ticket.updatedAt)}</span>
        </div>

        {/* Latest message preview */}
        {latestMessage && (
          <p
            className={[
              "text-xs line-clamp-1",
              hasUnreadReply
                ? "font-semibold text-secondary-900"
                : "text-secondary-400",
            ].join(" ")}
          >
            <span
              className={hasUnreadReply ? "text-primary-600" : undefined}
            >
              {latestMessage.role === "customer" ? "Bạn: " : "CSKH: "}
            </span>
            {latestMessage.content}
          </p>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-secondary-100">
        <Link
          href={`/account/support/${ticket.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Xem chi tiết
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

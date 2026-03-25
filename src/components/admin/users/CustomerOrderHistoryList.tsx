"use client";

import Link from "next/link";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { AdminStatus } from "@/src/components/admin/StatusBadge";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  date: string;
  status: string;
  itemCount: number;
  total: number;
}

interface CustomerOrderHistoryListProps {
  orders: OrderRow[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

const VALID_STATUSES: AdminStatus[] = [
  "active", "inactive", "pending", "suspended", "draft",
  "published", "archived", "approved", "rejected", "review",
  "online", "offline",
];

function safeStatus(status: string): AdminStatus {
  return VALID_STATUSES.includes(status as AdminStatus)
    ? (status as AdminStatus)
    : "pending";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerOrderHistoryList({
  orders,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: CustomerOrderHistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton variant="table-row" count={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-secondary-400">
        Khách hàng chưa có đơn hàng nào
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-secondary-100">
        {orders.map((order) => (
          <li key={order.id} className="flex flex-wrap items-center gap-3 py-3">
            {/* Order ID link */}
            <Link
              href={"/admin/orders/" + order.id}
              className="font-mono text-xs text-primary-600 hover:text-primary-700 hover:underline shrink-0"
            >
              {order.id}
            </Link>

            {/* Date */}
            <span className="text-sm text-secondary-500 shrink-0">{order.date}</span>

            {/* Status */}
            <StatusBadge status={safeStatus(order.status)} size="sm" />

            {/* Item count */}
            <span className="text-sm text-secondary-600 shrink-0">
              {order.itemCount} sản phẩm
            </span>

            {/* Total */}
            <span className="ml-auto text-sm font-medium text-secondary-800 shrink-0">
              {formatVND(order.total)}
            </span>
          </li>
        ))}
      </ul>

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="mt-3 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onLoadMore}>
            Xem thêm
          </Button>
        </div>
      )}
    </div>
  );
}

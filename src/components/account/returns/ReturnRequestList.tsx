"use client";

import Link from "next/link";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { ReturnRequestSummaryCard } from "@/src/components/account/returns/ReturnRequestSummaryCard";
import type { ReturnRequest } from "@/src/app/(storefront)/account/returns/_mock_data";
import type { OrderSummary } from "@/src/app/(storefront)/account/orders/_mock_data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReturnRequestListProps {
  requests: ReturnRequest[];
  orders: OrderSummary[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReturnRequestList({ requests, orders }: ReturnRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-secondary-200 bg-white py-20 px-6 text-center">
        <ArrowUturnLeftIcon
          className="h-12 w-12 text-secondary-300"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-secondary-700">
          Bạn chưa có yêu cầu đổi/trả nào.
        </p>
        <Link
          href="/account/orders"
          className="text-sm text-primary-600 underline underline-offset-2 hover:text-primary-700"
        >
          Xem đơn hàng của bạn
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {requests.map((request) => {
        const order = orders.find((o) => o.id === request.orderId);
        return (
          <li key={request.id}>
            <ReturnRequestSummaryCard request={request} order={order} />
          </li>
        );
      })}
    </ul>
  );
}

import Link from "next/link";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { AdminStatus } from "@/src/components/admin/StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentOrdersTableProps {
  orders: {
    id: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Status values from orders may not exactly match AdminStatus — map where possible
const ORDER_STATUS_MAP: Record<string, AdminStatus> = {
  pending: "pending",
  confirmed: "active",
  processing: "review",
  shipped: "active",
  delivered: "approved",
  cancelled: "rejected",
  returned: "inactive",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* Card header */}
      <h2 className="text-sm font-semibold text-secondary-800 mb-4">
        Đơn hàng gần đây
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-100">
              <th className="pb-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Mã đơn
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Khách hàng
              </th>
              <th className="pb-3 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Tổng tiền
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide pl-4">
                Trạng thái
              </th>
              <th className="pb-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide pl-4">
                Ngày đặt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-50">
            {orders.map((order) => {
              const adminStatus =
                ORDER_STATUS_MAP[order.status] ?? "pending";
              return (
                <tr
                  key={order.id}
                  className="hover:bg-secondary-50/50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={"/admin/orders/" + order.id}
                      className="text-primary-600 font-mono text-xs hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-secondary-700">
                    {order.customerName}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium text-secondary-800 tabular-nums">
                    {formatVND(order.total)}
                  </td>
                  <td className="py-3 pr-4 pl-4">
                    <StatusBadge status={adminStatus} size="sm" />
                  </td>
                  <td className="py-3 pl-4 text-secondary-500 tabular-nums">
                    {formatDate(order.date)}
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-secondary-400"
                >
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-end border-t border-secondary-100 pt-3">
        <Link
          href="/admin/orders"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Xem tất cả đơn hàng →
        </Link>
      </div>
    </div>
  );
}

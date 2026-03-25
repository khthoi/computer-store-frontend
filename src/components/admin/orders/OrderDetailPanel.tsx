import Link from "next/link";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { AdminStatus } from "@/src/components/admin/StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  productId: string;
  name: string;
  sku: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
}

interface OrderDetailPanelProps {
  order: {
    id: string;
    date: string;
    status: string;
    channel: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      userId: string;
    };
    lineItems: LineItem[];
    subtotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    grandTotal: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const lineTotal = (item: LineItem) => item.quantity * item.unitPrice;

  // Map order status string to AdminStatus safely
  const safeStatus = (
    [
      "active", "inactive", "pending", "suspended", "draft",
      "published", "archived", "approved", "rejected", "review",
      "online", "offline",
    ] as AdminStatus[]
  ).includes(order.status as AdminStatus)
    ? (order.status as AdminStatus)
    : "pending";

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* ── Section 1: Order header ──────────────────────────────── */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-secondary-500 text-sm">{order.id}</p>
          <p className="mt-0.5 text-xs text-secondary-400">{order.date}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={safeStatus} />
          <span className="inline-flex items-center rounded-full border border-secondary-200 bg-secondary-50 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
            {order.channel}
          </span>
        </div>
      </div>

      <hr className="my-4 border-secondary-100" />

      {/* ── Section 2: Customer ─────────────────────────────────── */}
      <div className="flex items-start gap-3">
        {/* Avatar initial circle */}
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
        >
          {getInitials(order.customer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-secondary-900">{order.customer.name}</p>
          <p className="text-sm text-secondary-500">{order.customer.email}</p>
          <p className="text-sm text-secondary-500">{order.customer.phone}</p>
        </div>
        <div className="shrink-0">
          <Link
            href={"/admin/users/" + order.customer.userId}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Xem hồ sơ
          </Link>
        </div>
      </div>

      <hr className="my-4 border-secondary-100" />

      {/* ── Section 3: Line items ────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-secondary-500 border-b border-secondary-100">
              <th className="pb-2 pr-3">Sản phẩm</th>
              <th className="pb-2 pr-3">SKU</th>
              <th className="pb-2 pr-3 text-center">SL</th>
              <th className="pb-2 pr-3 text-right">Đơn giá</th>
              <th className="pb-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-50">
            {order.lineItems.map((item) => (
              <tr key={item.productId}>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover border border-secondary-100 shrink-0"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded border border-secondary-100 bg-secondary-50 shrink-0"
                      />
                    )}
                    <span className="font-medium text-secondary-800 line-clamp-2">{item.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="text-xs font-mono text-secondary-500">{item.sku}</span>
                </td>
                <td className="py-2.5 pr-3 text-center text-secondary-700">{item.quantity}</td>
                <td className="py-2.5 pr-3 text-right text-secondary-700">{formatVND(item.unitPrice)}</td>
                <td className="py-2.5 text-right font-medium text-secondary-800">{formatVND(lineTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-4 border-secondary-100" />

      {/* ── Section 4: Totals ────────────────────────────────────── */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-secondary-600">
            <span>Tạm tính</span>
            <span>{formatVND(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-secondary-600">
            <span>Giảm giá</span>
            <span className="text-success-600">-{formatVND(order.discount)}</span>
          </div>
          <div className="flex justify-between text-secondary-600">
            <span>Phí vận chuyển</span>
            <span>{formatVND(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between text-secondary-600">
            <span>Thuế</span>
            <span>{formatVND(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-double border-secondary-200 pt-2 font-bold text-secondary-900 text-base">
            <span>Tổng cộng</span>
            <span>{formatVND(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

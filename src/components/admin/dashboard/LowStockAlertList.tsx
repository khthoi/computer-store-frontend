import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LowStockItem {
  productId: string;
  name: string;
  sku: string;
  thumbnail?: string;
  currentStock: number;
  threshold: number;
}

export interface LowStockAlertListProps {
  items: LowStockItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LowStockAlertList({ items }: LowStockAlertListProps) {
  const displayItems = items.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* Card header */}
      <h2 className="text-sm font-semibold text-secondary-800 mb-4">
        Cảnh báo tồn kho
      </h2>

      {displayItems.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <CheckCircleIcon className="w-10 h-10 text-success-400" aria-hidden="true" />
          <p className="text-sm text-secondary-500">
            Không có sản phẩm nào sắp hết hàng
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {displayItems.map((item) => (
            <li
              key={item.productId}
              className="flex items-center gap-3 rounded-lg hover:bg-secondary-50 transition-colors p-1 -mx-1"
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-10 h-10 rounded bg-secondary-100 overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary-100" aria-hidden="true" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-secondary-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs font-mono text-secondary-400 truncate">
                  {item.sku}
                </p>
              </div>

              {/* Stock + action */}
              <div className="shrink-0 flex items-center gap-3">
                <span className="text-error-600 font-bold text-sm tabular-nums">
                  {item.currentStock}
                </span>
                <Link
                  href={`/admin/inventory/restock/${item.productId}`}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                >
                  Nhập hàng
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="mt-4 flex justify-end border-t border-secondary-100 pt-3">
        <Link
          href="/admin/inventory?filter=low-stock"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Xem tất cả sản phẩm sắp hết hàng →
        </Link>
      </div>
    </div>
  );
}

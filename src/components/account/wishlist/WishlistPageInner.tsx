"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { ToastMessage } from "@/src/components/ui/Toast";
import { WishlistCard } from "@/src/components/account/wishlist/WishlistCard";
import type { WishlistVariantItem } from "@/src/app/(storefront)/account/wishlist/_mock_data";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WishlistPageInnerProps {
  initialItems: WishlistVariantItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WishlistPageInner — client root for /account/wishlist.
 *
 * State:
 * - items        : local mutable copy (optimistic removes)
 * - toastVisible : controls ToastMessage visibility
 * - toastMessage : message text shown in the toast
 */
export function WishlistPageInner({ initialItems }: WishlistPageInnerProps) {
  const [items, setItems] = useState<WishlistVariantItem[]>(initialItems);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  // ── Individual handlers ───────────────────────────────────────────────────

  const handleRemove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Đã xóa sản phẩm khỏi danh sách yêu thích");
    },
    [showToast]
  );

  const handleAddToCart = useCallback(
    (id: string) => {
      void id;
      showToast("Đã thêm vào giỏ hàng");
    },
    [showToast]
  );

  // ── Bulk handlers ─────────────────────────────────────────────────────────

  const inStockItems = items.filter((i) => !i.outOfStock);

  const handleAddAll = useCallback(() => {
    showToast(`Đã thêm ${inStockItems.length} sản phẩm vào giỏ hàng`);
  }, [inStockItems.length, showToast]);

  const handleRemoveAll = useCallback(() => {
    setItems([]);
    showToast("Đã xóa toàn bộ danh sách yêu thích");
  }, [showToast]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-secondary-200 bg-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-100 px-6 py-5">
        <h1 className="text-lg font-bold text-secondary-900">
          Danh sách yêu thích{" "}
          <span className="font-normal text-secondary-400">
            ({items.length} sản phẩm)
          </span>
        </h1>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              disabled={inStockItems.length === 0}
              onClick={handleAddAll}
            >
              Thêm tất cả vào giỏ
            </Button>

            <button
              type="button"
              onClick={handleRemoveAll}
              className={[
                "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-500",
                "cursor-pointer select-none h-10 px-4 text-sm",
                "bg-transparent text-error-600 hover:bg-error-50 active:bg-error-100",
              ].join(" ")}
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="px-6 py-6">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      <ToastMessage
        isVisible={toastVisible}
        type="success"
        message={toastMessage}
        position="bottom-right"
        duration={3000}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <HeartIcon className="h-16 w-16 text-secondary-300" aria-hidden />
      <div className="space-y-1">
        <p className="text-lg font-semibold text-secondary-700">
          Danh sách yêu thích trống
        </p>
        <p className="text-sm text-secondary-400">
          Hãy thêm sản phẩm yêu thích để theo dõi và mua hàng dễ dàng hơn.
        </p>
      </div>
      <Link
        href="/products"
        className={[
          "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
          "cursor-pointer select-none h-10 px-4 text-sm",
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
        ].join(" ")}
      >
        Khám phá sản phẩm
      </Link>
    </div>
  );
}

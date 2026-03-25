"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useCart } from "@/src/store/cart.store";
import { CartSelectBar } from "@/src/components/cart/CartSelectBar";
import { CartList } from "@/src/components/cart/CartList";
import { CartSummary } from "@/src/components/cart/CartSummary";

// ─── CartEmptyState ───────────────────────────────────────────────────────────

/**
 * CartEmptyState — full-width centered illustration shown when the cart is empty.
 */
export function CartEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Minimal SVG cart illustration */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
        className="mb-6 text-secondary-300"
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        <path
          d="M32 38h10l12 34h26l9-24H44"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="52" cy="78" r="4.5" fill="currentColor" />
        <circle cx="74" cy="78" r="4.5" fill="currentColor" />
        <path
          d="M71 50h-8v8h8v-8z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="67"
          y1="46"
          x2="67"
          y2="43"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="64"
          y1="43"
          x2="70"
          y2="43"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <h2 className="text-xl font-semibold text-secondary-700 mb-2">
        Giỏ hàng của bạn đang trống
      </h2>
      <p className="text-sm text-secondary-400 mb-6 max-w-xs">
        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={() => router.push("/products")}
      >
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}

// ─── CartSkeleton ─────────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Left column skeleton */}
      <div className="rounded-2xl border border-secondary-200 bg-white px-5 divide-y divide-secondary-100">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 py-4">
            <Skeleton className="h-4 w-4 rounded shrink-0 mt-1" />
            <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <Skeleton className="h-3 w-14 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-10 w-32 rounded-lg mt-1" />
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2 pt-1 shrink-0">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Right column skeleton */}
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

// ─── CartPageInner ────────────────────────────────────────────────────────────

/**
 * CartPageInner — top-level client component for the /cart page layout.
 *
 * Reads cart state from context and renders:
 * - Skeleton rows while localStorage hydration is pending
 * - CartEmptyState when the cart has no items
 * - Full two-column layout (list + summary) when items exist
 *
 * Lives in CartEmptyState.tsx so that page.tsx (a server component) can import
 * CartProvider and CartPageInner without itself needing "use client".
 */
export function CartPageInner() {
  const {
    state,
    removeItem,
    updateQuantity,
    toggleSelect,
    selectAll,
    deselectAll,
    removeSelected,
    showToast,
  } = useCart();

  const { items, selectedIds, hydrated } = state;

  const handleRemoveSelected = useCallback(() => {
    const count = selectedIds.size;
    removeSelected();
    showToast(`Đã xoá ${count} sản phẩm`, "success");
  }, [selectedIds.size, removeSelected, showToast]);

  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-secondary-900">Giỏ hàng</h1>
        {hydrated && items.length > 0 && (
          <span className="text-base font-normal text-secondary-400">
            ({items.length} sản phẩm)
          </span>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {!hydrated ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left column: select bar + item list */}
          <section aria-label="Danh sách sản phẩm">
            <div className="rounded-2xl border border-secondary-200 bg-white px-5">
              <CartSelectBar
                totalCount={items.length}
                selectedCount={selectedIds.size}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onRemoveSelected={handleRemoveSelected}
              />
              <CartList
                items={items}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            </div>
          </section>

          {/* Right column: price summary */}
          <aside aria-label="Tóm tắt đơn hàng">
            <CartSummary items={items} selectedIds={selectedIds} />
          </aside>
        </div>
      )}
    </main>
  );
}

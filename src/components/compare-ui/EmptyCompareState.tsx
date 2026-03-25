"use client";

import { ArrowsRightLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { useCompare } from "@/src/store/compare.store";
import type { CatalogueProduct } from "@/src/components/compare-ui/types";
import { formatVND } from "@/src/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmptyCompareStateProps {
  suggestedProducts?: CatalogueProduct[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmptyCompareState({
  suggestedProducts = [],
}: EmptyCompareStateProps) {
  const { openDrawer } = useCompare();

  return (
    <div className="flex flex-col items-center py-16 px-4">
      {/* Illustration */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-100">
        <ArrowsRightLeftIcon
          className="h-12 w-12 text-secondary-300"
          aria-hidden="true"
        />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-secondary-500">
        Chưa có sản phẩm để so sánh
      </h2>
      <p className="mb-8 max-w-sm text-center text-sm text-secondary-400">
        Thêm ít nhất 2 sản phẩm cùng loại để bắt đầu so sánh thông số kỹ thuật.
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={openDrawer}
        leftIcon={<PlusIcon className="h-5 w-5" aria-hidden="true" />}
      >
        Chọn sản phẩm
      </Button>

      {/* ── Suggested products ── */}
      {suggestedProducts.length > 0 && (
        <div className="mt-16 w-full max-w-5xl">
          <h3 className="mb-4 text-base font-semibold text-secondary-700">
            Gợi ý sản phẩm phổ biến
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {suggestedProducts.slice(0, 4).map((p) => (
              <SuggestedCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Suggested mini-card ──────────────────────────────────────────────────────

function SuggestedCard({ product }: { product: CatalogueProduct }) {
  const { addProduct, state } = useCompare();
  const isAdded = state.compareList.some((p) => p.id === product.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-secondary-200 bg-white transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="flex h-36 items-center justify-center bg-secondary-50 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.thumbnailSrc}
          alt={product.name}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-medium text-secondary-800">
          {product.name}
        </p>
        <p className="text-sm font-bold text-primary-700">
          {formatVND(product.currentPrice)}
        </p>
      </div>

      {/* Add to compare */}
      <div className="border-t border-secondary-100 p-2">
        <Button
          variant={isAdded ? "primary" : "outline"}
          size="xs"
          fullWidth
          onClick={() =>
            addProduct({
              ...product,
              originalPrice: product.originalPrice,
              discountPct: 0,
              specGroups: [],
            })
          }
          leftIcon={
            isAdded ? undefined : (
              <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            )
          }
        >
          {isAdded ? "Đã thêm" : "So sánh"}
        </Button>
      </div>
    </div>
  );
}

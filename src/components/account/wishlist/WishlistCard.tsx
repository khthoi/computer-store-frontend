"use client";

import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { PriceTag } from "@/src/components/product/PriceTag";
import type { WishlistVariantItem } from "@/src/app/(storefront)/account/wishlist/_mock_data";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WishlistCardProps {
  item: WishlistVariantItem;
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WishlistCard — displays a single wishlisted product variant.
 *
 * Fixed-section layout (mirrors ProductCard) so cards in the same grid row
 * keep their variant label and CTA perfectly aligned regardless of name length:
 *
 *   1. Thumbnail  — aspect-square
 *   2. Name       — h-[4.2em] line-clamp-3, tooltip + link to product page
 *   3. Variant    — min-h-[1.25rem], always reserves space
 *   4. Price      — min-h-[48px], PriceTag (currentPrice / originalPrice)
 *   5. CTA        — mt-auto, pinned to card bottom
 */
export function WishlistCard({ item, onRemove, onAddToCart }: WishlistCardProps) {
  const productHref = `/products/${item.productSlug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* ── 1. Thumbnail ───────────────────────────────────────────────── */}
      <div className="relative aspect-square shrink-0 overflow-hidden bg-secondary-50">
        <a href={productHref} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          <Image
            src={item.thumbnailSrc}
            alt={item.productName}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </a>

        {/* Out-of-stock overlay */}
        {item.outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary-700">
              Hết hàng
            </span>
          </div>
        )}

        {/* Heart icon — top-left, decorative (item is already wishlisted) */}
        <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
          <HeartIcon className="h-4 w-4 text-error-500" aria-hidden />
        </span>

        {/* Remove button — top-right */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-error-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={`Xóa ${item.productName} khỏi danh sách yêu thích`}
        >
          <XMarkIcon className="h-4 w-4 text-secondary-500" aria-hidden />
        </button>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3">

        {/* ── 2. Name — exactly 3 lines, fixed height, tooltip + link ── */}
        <Tooltip content={item.productName} placement="top">
          <a
            href={productHref}
            className="line-clamp-3 h-[4.2em] overflow-hidden leading-[1.4] text-sm font-medium text-secondary-900 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            {item.productName}
          </a>
        </Tooltip>

        {/* ── 3. Variant label — always reserves min-h so rows align ── */}
        <div className="mt-1 flex min-h-[1.25rem] items-start">
          <span className="text-xs leading-tight text-secondary-400">
            {item.variantLabel}
          </span>
        </div>

        {/* ── 4. Price — min-h-[48px] matches ProductCard price section ── */}
        <div className="mt-2 min-h-[48px]">
          <PriceTag
            currentPrice={item.currentPrice}
            originalPrice={item.originalPrice}
            size="sm"
          />
          {/* Invisible placeholder preserves 2nd-row height when no discount */}
          {!item.originalPrice && (
            <span className="select-none opacity-0 text-xs" aria-hidden="true">
              placeholder
            </span>
          )}
        </div>

        {/* ── 5. CTA — pinned to card bottom via mt-auto ── */}
        <div className="mt-auto border-t border-secondary-100 pt-2">
          <Button
            variant={item.outOfStock ? "secondary" : "primary"}
            size="sm"
            fullWidth
            disabled={item.outOfStock}
            onClick={() => !item.outOfStock && onAddToCart(item.id)}
          >
            Thêm vào giỏ hàng
          </Button>
        </div>
      </div>
    </article>
  );
}

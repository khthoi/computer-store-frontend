"use client";

import { BoltIcon } from "@heroicons/react/24/solid";
import { ProductCarousel } from "@/src/components/product/ProductCarousel";
import { FlashSaleCountdown } from "./FlashSaleCountdown";
import type { FlashSaleEvent } from "@/src/app/(storefront)/promotions/_mock_data";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FlashSaleBanner — timed flash sale section with live countdown and carousel.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────┐
 *   │  ⚡ Flash Sale Hôm Nay   [HH] : [MM] : [SS] │
 *   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ←→   │
 *   │  │ card │ │ card │ │ card │ │ card │        │
 *   │  └──────┘ └──────┘ └──────┘ └──────┘        │
 *   └─────────────────────────────────────────────┘
 */
export function FlashSaleBanner({ flashSale }: { flashSale: FlashSaleEvent }) {
  return (
    <section className="py-10 max-w-[1450px] mx-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row: bolt icon + title + countdown */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-6 w-6 text-orange-500" aria-hidden="true" />
            <h2 className="text-xl font-bold text-secondary-900">
              {flashSale.label}
            </h2>
          </div>
          <FlashSaleCountdown endsAt={flashSale.endsAt} />
        </div>

        {/* Product carousel — same pattern as homepage ProductSection */}
        <ProductCarousel products={flashSale.products} itemsPerView={6} />
      </div>
    </section>
  );
}

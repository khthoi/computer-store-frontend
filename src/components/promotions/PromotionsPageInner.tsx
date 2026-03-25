"use client";

import { useState } from "react";
import { Tabs, TabPanel, type TabItem } from "@/src/components/ui/Tabs";
import { FlashSaleBanner } from "./FlashSaleBanner";
import { DealSection } from "./DealSection";
import { PromotionHeroBanner } from "./PromotionHeroBanner";
import type {
  FlashSaleEvent,
  DealGroup,
  DealCategoryMeta,
  DealCategory,
} from "@/src/app/(storefront)/promotions/_mock_data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PromotionsPageInnerProps {
  flashSale: FlashSaleEvent;
  dealGroups: DealGroup[];
  categoryMeta: DealCategoryMeta[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PromotionsPageInner — client root for /promotions.
 *
 * Layout sections (top to bottom):
 *  1. PromotionHeroBanner — asymmetric hero + sub-banners (owns its own data)
 *  2. Flash Sale section (countdown + product carousel)
 *  3. Deals by category (line tab bar + per-category carousel)
 */
export function PromotionsPageInner({
  flashSale,
  dealGroups,
  categoryMeta,
}: PromotionsPageInnerProps) {
  const [activeCategory, setActiveCategory] = useState<DealCategory>(
    categoryMeta[0].value
  );

  const tabItems: TabItem[] = categoryMeta.map((meta) => ({
    value: meta.value,
    label: meta.label,
  }));

  return (
    <>
      {/* ── 1. Hero banners ───────────────────────────────────────────────── */}
      <PromotionHeroBanner />

      {/* ── 2. Flash Sale ─────────────────────────────────────────────────── */}
      <FlashSaleBanner flashSale={flashSale} />

      {/* ── 3. Deals by category ──────────────────────────────────────────── */}
      <section className="py-10 flex max-w-[1450px] mx-auto">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-xl font-bold text-secondary-900">
            Ưu đãi theo danh mục
          </h2>

          <Tabs
            tabs={tabItems}
            value={activeCategory}
            onChange={(v) => setActiveCategory(v as DealCategory)}
            variant="line"
          >
            {categoryMeta.map((meta) => {
              const group = dealGroups.find((g) => g.category === meta.value);
              return (
                <TabPanel key={meta.value} value={meta.value}>
                  {group && group.products.length > 0 ? (
                    <DealSection products={group.products} />
                  ) : (
                    <p className="py-12 text-center text-sm text-secondary-400">
                      Không có ưu đãi trong danh mục này.
                    </p>
                  )}
                </TabPanel>
              );
            })}
          </Tabs>
        </div>
      </section>
    </>
  );
}

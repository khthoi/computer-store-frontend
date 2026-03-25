"use client";

import { memo, useState, useCallback } from "react";
import { Drawer } from "@/src/components/ui/Drawer";
import { VariantSelector } from "@/src/components/product/VariantSelector";
import type { VariantOption } from "@/src/components/product/VariantSelector";
import { PriceTag } from "@/src/components/product/PriceTag";
import {
  ShoppingCartIcon,
  ArrowsRightLeftIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VariantGroup {
  /** Unique key matching the variant dimension, e.g. "ram", "storage", "color" */
  key: string;
  /** Display label shown above the options, e.g. "RAM", "Dung lượng" */
  label: string;
  /** Button chips (default) or circular color swatches */
  type?: "button" | "color";
  options: VariantOption[];
}

export type DrawerActionType = "wishlist" | "compare" | "cart";

export interface ProductVariantDrawerProduct {
  id: string;
  name: string;
  brand: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
}

export interface ProductVariantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductVariantDrawerProduct;
  /** Which action the user triggered */
  actionType: DrawerActionType;
  /** Optional variant groups — shown as selector rows */
  variants?: VariantGroup[];
  /**
   * Called when the user confirms the action.
   * Receives a map of { [group.key]: selectedOptionValue }.
   */
  onConfirm: (selectedVariants: Record<string, string>) => void;
}

// ─── Action config ────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  DrawerActionType,
  { label: string; Icon: React.ElementType; buttonClass: string }
> = {
  cart: {
    label: "Thêm vào giỏ hàng",
    Icon: ShoppingCartIcon,
    buttonClass:
      "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white",
  },
  compare: {
    label: "Thêm vào so sánh",
    Icon: ArrowsRightLeftIcon,
    buttonClass:
      "bg-secondary-800 hover:bg-secondary-900 active:bg-secondary-950 text-white",
  },
  wishlist: {
    label: "Thêm vào yêu thích",
    Icon: HeartIcon,
    buttonClass: "bg-error-500 hover:bg-error-600 active:bg-error-700 text-white",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductVariantDrawer — bottom sheet for selecting product variants before
 * executing a cart / compare / wishlist action.
 *
 * ```tsx
 * <ProductVariantDrawer
 *   isOpen={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 *   product={{ id, name, brand, thumbnail, price, originalPrice }}
 *   actionType="cart"
 *   variants={[
 *     { key: "ram",     label: "RAM",     options: ramOptions },
 *     { key: "storage", label: "Bộ nhớ", options: storageOptions },
 *   ]}
 *   onConfirm={(selected) => addToCart(id, selected)}
 * />
 * ```
 */
export const ProductVariantDrawer = memo(function ProductVariantDrawer({
  isOpen,
  onClose,
  product,
  actionType,
  variants = [],
  onConfirm,
}: ProductVariantDrawerProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const handleSelect = useCallback((key: string, value: string) => {
    setSelected((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selected);
    onClose();
    // Reset selection for next open
    setSelected({});
  }, [onConfirm, selected, onClose]);

  const handleClose = useCallback(() => {
    setSelected({});
    onClose();
  }, [onClose]);

  const { label: actionLabel, Icon: ActionIcon, buttonClass } =
    ACTION_CONFIG[actionType];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      position="right"
      size="xl"
      closeOnBackdrop
      title={
        actionType === "cart"
          ? "Chọn cấu hình"
          : actionType === "compare"
          ? "So sánh sản phẩm"
          : "Thêm vào yêu thích"
      }
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-secondary-200 px-4 py-3 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary-400",
              buttonClass,
            ].join(" ")}
          >
            <ActionIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {actionLabel}
          </button>
        </div>
      }
    >
      {/* ── Product preview ── */}
      <div className="flex items-center gap-4 pb-4 border-b border-secondary-100">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-secondary-100 bg-secondary-50 p-2">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block mb-1 rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-600">
            {product.brand}
          </span>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-secondary-900">
            {product.name}
          </p>
          <PriceTag
            currentPrice={product.price}
            originalPrice={product.originalPrice}
            size="sm"
            className="mt-1"
          />
        </div>
      </div>

      {/* ── Variant selectors ── */}
      {variants.length > 0 ? (
        <div className="mt-5 flex flex-col gap-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary-400">
            Chọn cấu hình
          </p>
          {variants.map((group) => (
            <VariantSelector
              key={group.key}
              label={group.label}
              type={group.type ?? "button"}
              options={group.options}
              value={selected[group.key]}
              onChange={(val) => handleSelect(group.key, val)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-secondary-500">
          Xác nhận thao tác với sản phẩm này.
        </p>
      )}
    </Drawer>
  );
});

"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Badge } from "@/src/components/ui/Badge";
import { Select } from "@/src/components/ui/Select";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { PriceTag } from "@/src/components/product/PriceTag";
import type { CompatibilityStatus } from "@/src/components/buildpc/PCPartCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  value: string;
  label: string;
}

export interface PartPickerProductItemProps {
  id: string;
  name: string;
  brand: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  /** Warranty duration shown as a badge (e.g. "36 tháng") */
  warranty?: string;
  /** When provided, user must pick a variant before adding to build */
  variants?: ProductVariant[];
  /**
   * The variant value currently stored in the build for this product.
   * Used to initialise the Select and to determine whether to show ✓ or +.
   */
  selectedVariantValue?: string;
  availability?: "in-stock" | "out-of-stock" | "limited";
  /** Remaining units shown as "Còn N sản phẩm" */
  stockQuantity?: number;
  compatibilityStatus?: CompatibilityStatus;
  isSelected?: boolean;
  /** Called with the product id and the chosen variant value (if any) */
  onSelect?: (id: string, variantValue?: string) => void;
  /** Opens product detail in a new tab when clicked */
  href?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AvailabilityBadge({
  availability,
  stockQuantity,
}: {
  availability?: "in-stock" | "out-of-stock" | "limited";
  stockQuantity?: number;
}) {
  if (!availability) return null;

  const config = {
    "in-stock":     { label: "Còn hàng", variant: "success" as const },
    "limited":      { label: "Sắp hết",  variant: "warning" as const },
    "out-of-stock": { label: "Hết hàng", variant: "error"   as const },
  };
  const { label, variant } = config[availability];

  const showQty =
    stockQuantity !== undefined &&
    stockQuantity > 0 &&
    availability !== "out-of-stock";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} size="sm" dot className="self-start">
        {label}
      </Badge>
      {showQty && (
        <span className="text-[11px] text-secondary-400">
          Còn {stockQuantity} sản phẩm
        </span>
      )}
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

const THUMB_SIZE = 100; // px — matches h-25 w-25 (6.25rem at base-16)

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={THUMB_SIZE}
      height={THUMB_SIZE}
      className="h-25 w-25 rounded-lg object-contain"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PartPickerProductItem — rich horizontal product row for the part-picker modal.
 *
 * Layout: [thumbnail] [info: brand · name · warranty + variant Select (same row) · availability] [PriceTag · add icon]
 *
 * Variant / add-button logic:
 * - Select is shown on the same row as warranty, after the warranty badge.
 * - Button shows ✓  when the product is already in the build AND the local Select value
 *   matches the build's stored variant (or when there are no variants).
 * - Button shows +  when (a) product is not yet in the build, or (b) the user has changed
 *   the Select to a variant that differs from the one currently in the build.
 * - Clicking + always calls `onSelect(id, variantValue)` — the build does NOT update
 *   until the user explicitly clicks the button.
 */
export function PartPickerProductItem({
  id,
  name,
  brand,
  thumbnail,
  price,
  originalPrice,
  warranty,
  variants,
  selectedVariantValue,
  availability,
  stockQuantity,
  compatibilityStatus = "unchecked",
  isSelected = false,
  onSelect,
  href,
}: PartPickerProductItemProps) {
  // Initialise from the build's stored variant so the Select shows the right value on open.
  const [selectedVariant, setSelectedVariant] = useState(selectedVariantValue ?? "");

  const hasVariants = variants !== undefined && variants.length > 0;

  // ✓ when: product is in the build AND variant matches (or there are no variants).
  const buildVariant       = selectedVariantValue ?? "";
  const isVariantUnchanged = !hasVariants || selectedVariant === buildVariant;
  const showCheckmark      = isSelected && isVariantUnchanged;

  // + button is active when: not incompatible AND (already selected OR variant not required OR variant chosen).
  const isIncompatible = compatibilityStatus === "incompatible";
  const canAdd         = !isIncompatible && (isSelected || !hasVariants || selectedVariant !== "");

  const handleSelect = useCallback(
    () => onSelect?.(id, selectedVariant || undefined),
    [id, onSelect, selectedVariant]
  );

  return (
    <article
      className={[
        "flex items-start gap-4 py-4 transition-colors",
        isSelected    ? "bg-primary-50/40" : "",
        isIncompatible ? "opacity-60"       : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Thumbnail */}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          className="shrink-0"
        >
          <Thumbnail src={thumbnail} alt={name} />
        </a>
      ) : (
        <div className="shrink-0 flex my-auto">
          <Thumbnail src={thumbnail} alt={name} />
        </div>
      )}

      {/* Info — brand, name, warranty + variant Select (same row), availability */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">
          {brand}
        </p>

        <Tooltip content={name} placement="top-start">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-3 w-max max-w-full text-sm font-medium text-secondary-900 transition-colors hover:text-primary-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {name}
            </a>
          ) : (
            <p className="line-clamp-3 w-max max-w-full text-sm font-medium text-secondary-900">
              {name}
            </p>
          )}
        </Tooltip>

        {/* Warranty + variant Select — same row, visually balanced */}
        {(warranty || hasVariants) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {warranty && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-secondary-400">Bảo hành:</span>
                <Badge variant="default" size="sm" className="self-start">
                  {warranty}
                </Badge>
              </div>
            )}

            {hasVariants && (
              <div className="w-44">
                <Select
                  options={variants!.map((v) => ({ value: v.value, label: v.label }))}
                  value={selectedVariant}
                  onChange={(v) => setSelectedVariant(v as string)}
                  placeholder="Chọn phiên bản"
                  size="sm"
                />
              </div>
            )}
          </div>
        )}

        <AvailabilityBadge availability={availability} stockQuantity={stockQuantity} />
      </div>

      {/* Right column: price + icon-only action button */}
      <div className="flex shrink-0 flex-col items-end justify-between self-stretch gap-3 mr-4 mt-5">
        <PriceTag currentPrice={price} originalPrice={originalPrice} size="sm" />

        {/* Icon-only button — ✓ when variant matches build, + otherwise */}
        <button
          type="button"
          disabled={!canAdd}
          onClick={canAdd ? handleSelect : undefined}
          aria-label={
            showCheckmark
              ? `${name} đã được thêm vào build`
              : `Thêm ${name} vào build`
          }
          aria-pressed={showCheckmark}
          title={
            showCheckmark
              ? "Đã thêm vào build"
              : !canAdd && hasVariants
              ? "Vui lòng chọn phiên bản trước"
              : isSelected
              ? "Cập nhật phiên bản"
              : "Thêm vào build"
          }
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 mr-2",
            showCheckmark
              ? "bg-primary-600 text-white shadow-sm"
              : !canAdd
              ? "cursor-not-allowed bg-secondary-100 text-secondary-300"
              : "border border-primary-300 bg-white text-primary-600 hover:bg-primary-50 hover:border-primary-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          ].join(" ")}
        >
          {showCheckmark ? (
            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PlusCircleIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </article>
  );
}

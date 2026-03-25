"use client";

import { useCallback } from "react";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatVND } from "@/src/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItemProps {
  id: string;
  productId: string;
  name: string;
  brand: string;
  thumbnail: string;
  thumbnailAlt?: string;
  /** URL to the product detail page */
  href?: string;
  /** Selected variant description (e.g. "16 GB RAM / 512 GB SSD") */
  variant?: string;
  unitPrice: number;
  quantity: number;
  /** Maximum purchasable quantity — also determines out-of-stock state when 0 */
  maxQuantity?: number;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CartItem — single line item in the shopping cart.
 *
 * ```tsx
 * <CartItem
 *   id="ci-1"
 *   productId="p-001"
 *   name="Intel Core i9-14900K"
 *   brand="Intel"
 *   thumbnail="/images/i9.jpg"
 *   variant="Boxed"
 *   unitPrice={12900000}
 *   quantity={2}
 *   maxQuantity={10}
 *   onQuantityChange={(id, qty) => updateCart(id, qty)}
 *   onRemove={(id) => removeFromCart(id)}
 * />
 * ```
 */
export function CartItem({
  id,
  name,
  brand,
  thumbnail,
  thumbnailAlt,
  href,
  variant,
  unitPrice,
  quantity,
  maxQuantity,
  onQuantityChange,
  onRemove,
  className = "",
}: CartItemProps) {
  const isOutOfStock = maxQuantity !== undefined && maxQuantity === 0;
  const isAtMax = maxQuantity !== undefined && quantity >= maxQuantity;

  const handleDecrement = useCallback(() => {
    if (quantity > 1) onQuantityChange(id, quantity - 1);
  }, [id, quantity, onQuantityChange]);

  const handleIncrement = useCallback(() => {
    if (!isAtMax) onQuantityChange(id, quantity + 1);
  }, [id, isAtMax, quantity, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  const subtotal = unitPrice * quantity;

  return (
    <article
      className={[
        "flex gap-4 rounded-xl border border-secondary-200 bg-white p-4",
        isOutOfStock ? "opacity-70" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Thumbnail ── */}
      <a
        href={href}
        tabIndex={href ? 0 : -1}
        aria-hidden={!href}
        className="shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={thumbnailAlt ?? name}
          className="h-20 w-20 rounded-lg border border-secondary-100 object-contain bg-secondary-50 p-1"
          loading="lazy"
        />
      </a>

      {/* ── Details ── */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Brand + name */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary-400">
            {brand}
          </span>
          {href ? (
            <a
              href={href}
              className="line-clamp-2 text-sm font-medium text-secondary-900 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              {name}
            </a>
          ) : (
            <p className="line-clamp-2 text-sm font-medium text-secondary-900">
              {name}
            </p>
          )}
          {variant && (
            <p className="text-xs text-secondary-500">{variant}</p>
          )}
        </div>

        {/* Out-of-stock warning */}
        {isOutOfStock && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-error-600">
            <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            This item is no longer available
          </p>
        )}

        {/* ── Bottom row: stepper + subtotal + remove ── */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          {/* Quantity stepper */}
          <div
            role="group"
            aria-label={`Quantity for ${name}`}
            className="flex items-center rounded-lg border border-secondary-200 bg-secondary-50 overflow-hidden"
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || isOutOfStock}
              onClick={handleDecrement}
              className="flex h-8 w-8 items-center justify-center text-secondary-500 transition-colors hover:bg-secondary-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
            >
              <MinusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <span
              aria-live="polite"
              className="min-w-[2rem] select-none text-center text-sm font-medium text-secondary-800"
            >
              {quantity}
            </span>

            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isAtMax || isOutOfStock}
              onClick={handleIncrement}
              className="flex h-8 w-8 items-center justify-center text-secondary-500 transition-colors hover:bg-secondary-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
            >
              <PlusIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-sm font-bold text-primary-700">
            {formatVND(subtotal)}
          </span>

          {/* Remove */}
          <button
            type="button"
            aria-label={`Remove ${name} from cart`}
            onClick={handleRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-error-50 hover:text-error-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-400"
          >
            <TrashIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Max quantity hint */}
        {isAtMax && !isOutOfStock && (
          <p className="text-[11px] text-warning-600">
            Maximum available quantity reached ({maxQuantity})
          </p>
        )}
      </div>
    </article>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name               Type                               Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * id                 string                             required Cart item ID
 * productId          string                             required Product ID
 * name               string                             required Product name
 * brand              string                             required Brand label
 * thumbnail          string                             required Image src
 * thumbnailAlt       string                             —        Image alt text
 * href               string                             —        Product detail URL
 * variant            string                             —        Variant descriptor
 * unitPrice          number                             required Unit price (VND)
 * quantity           number                             required Current quantity
 * maxQuantity        number                             —        Max stock (0 = out of stock)
 * onQuantityChange   (id: string, qty: number) => void required Quantity change callback
 * onRemove           (id: string) => void               required Remove item callback
 * className          string                             ""       Extra classes on <article>
 */

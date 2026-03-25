"use client";

import { ShoppingBagIcon, TagIcon, TruckIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { formatVND }  from "@/src/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartSummaryProps {
  itemCount: number;
  /** Sum of all cart items before any discounts */
  subtotal: number;
  /** Total discount applied (coupon + promotions). Displayed as a negative amount. */
  discountAmount?: number;
  /** Label for the discount (e.g. coupon code). Shown when discountAmount > 0. */
  discountLabel?: string;
  /**
   * Shipping fee. Pass 0 for free shipping.
   * Undefined = "calculated at checkout".
   */
  shippingFee?: number;
  /** Final total (calculated by consumer: subtotal - discount + shipping). */
  total: number;
  onCheckout: () => void;
  isLoading?: boolean;
  /**
   * Slot for a coupon input rendered above the totals.
   * Pass a <CouponInput /> instance here.
   */
  couponSlot?: React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CartSummary — order total panel with itemized breakdown and checkout CTA.
 *
 * ```tsx
 * <CartSummary
 *   itemCount={3}
 *   subtotal={38700000}
 *   discountAmount={3000000}
 *   discountLabel="SUMMER20"
 *   shippingFee={0}
 *   total={35700000}
 *   onCheckout={() => router.push("/checkout")}
 *   couponSlot={<CouponInput ... />}
 * />
 * ```
 */
export function CartSummary({
  itemCount,
  subtotal,
  discountAmount = 0,
  discountLabel,
  shippingFee,
  total,
  onCheckout,
  isLoading = false,
  couponSlot,
  className = "",
}: CartSummaryProps) {
  const hasFreeShipping = shippingFee === 0;
  const shippingUnknown = shippingFee === undefined;

  return (
    <aside
      aria-label="Order summary"
      className={[
        "flex flex-col gap-4 rounded-xl border border-secondary-200 bg-white p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-base font-semibold text-secondary-900">
        Order Summary
        <span className="ml-2 text-sm font-normal text-secondary-400">
          ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
      </h2>

      {/* Coupon slot */}
      {couponSlot && <div>{couponSlot}</div>}

      {/* Itemized breakdown */}
      <dl className="flex flex-col gap-2.5 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <dt className="text-secondary-600">Subtotal</dt>
          <dd className="font-medium text-secondary-800">{formatVND(subtotal)}</dd>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-success-700">
              <TagIcon className="w-4 h-4" aria-hidden="true" />
              Discount
              {discountLabel && (
                <span className="rounded bg-success-50 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  {discountLabel}
                </span>
              )}
            </dt>
            <dd className="font-medium text-success-700">
              -{formatVND(discountAmount)}
            </dd>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-1.5 text-secondary-600">
            <TruckIcon className="w-4 h-4" aria-hidden="true" />
            Shipping
          </dt>
          <dd
            className={
              hasFreeShipping
                ? "font-semibold text-success-600"
                : "font-medium text-secondary-800"
            }
          >
            {shippingUnknown
              ? "Calculated at checkout"
              : hasFreeShipping
              ? "FREE"
              : formatVND(shippingFee!)}
          </dd>
        </div>

        {/* Divider */}
        <div className="border-t border-secondary-200" role="separator" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <dt className="text-base font-semibold text-secondary-900">Total</dt>
          <dd className="text-base font-bold text-primary-700">
            {formatVND(total)}
          </dd>
        </div>
      </dl>

      {/* Savings callout */}
      {discountAmount > 0 && (
        <p className="rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
          You save {formatVND(discountAmount)} on this order!
        </p>
      )}

      {/* Checkout CTA */}
      <button
        type="button"
        disabled={isLoading || itemCount === 0}
        onClick={onCheckout}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-150",
          itemCount === 0 || isLoading
            ? "cursor-not-allowed bg-secondary-100 text-secondary-400"
            : "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
        ].join(" ")}
      >
        <ShoppingBagIcon className="w-4 h-4" aria-hidden="true" />
        {isLoading ? "Processing…" : "Proceed to Checkout"}
        {!isLoading && (
          <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
        )}
      </button>

      <p className="text-center text-xs text-secondary-400">
        Secure checkout · 30-day returns
      </p>
    </aside>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name            Type            Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * itemCount       number          required Number of distinct items
 * subtotal        number          required Pre-discount sum (VND)
 * discountAmount  number          0        Total discount applied (VND)
 * discountLabel   string          —        Coupon code label shown on discount row
 * shippingFee     number          —        Shipping cost; 0 = free; undefined = TBD
 * total           number          required Final payable amount (VND)
 * onCheckout      () => void      required Checkout button handler
 * isLoading       boolean         false    Shows spinner, disables button
 * couponSlot      ReactNode       —        Coupon input rendered above totals
 * className       string          ""       Extra classes on <aside>
 */

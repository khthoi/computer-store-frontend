"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  TagIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { formatVND } from "@/src/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppliedCoupon {
  code: string;
  /** Discount amount (VND) for display */
  discountAmount: number;
  /** Optional label (e.g. "20% off orders over 5M") */
  description?: string;
}

export interface CouponInputProps {
  /** Currently applied coupon — null means none applied */
  appliedCoupon?: AppliedCoupon | null;
  /** Called when the user submits a coupon code. Return an error message string on failure, or void/undefined on success. */
  onApply: (code: string) => Promise<string | void> | string | void;
  /** Called when the user removes the applied coupon */
  onRemove?: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CouponInput — coupon code field with apply button, success and error states.
 *
 * ```tsx
 * <CouponInput
 *   appliedCoupon={appliedCoupon}
 *   onApply={async (code) => {
 *     const result = await validateCoupon(code);
 *     if (!result.valid) return "Invalid or expired coupon code";
 *     setAppliedCoupon(result.coupon);
 *   }}
 *   onRemove={() => setAppliedCoupon(null)}
 * />
 * ```
 */
export function CouponInput({
  appliedCoupon,
  onApply,
  onRemove,
  className = "",
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return;

      setError(null);
      setIsLoading(true);
      try {
        const result = await Promise.resolve(onApply(trimmed));
        if (typeof result === "string") {
          setError(result);
        } else {
          setCode(""); // clear input on success
        }
      } finally {
        setIsLoading(false);
      }
    },
    [code, onApply]
  );

  const handleRemove = useCallback(() => {
    setError(null);
    setCode("");
    onRemove?.();
  }, [onRemove]);

  // ── Applied state ──────────────────────────────────────────────────────────
  if (appliedCoupon) {
    return (
      <div
        className={[
          "flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 px-3 py-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <CheckCircleIcon
          className="mt-0.5 w-4 h-4 shrink-0 text-success-600"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-success-800">
            {appliedCoupon.code}
            <span className="ml-2 font-normal text-success-600">
              -{formatVND(appliedCoupon.discountAmount)}
            </span>
          </p>
          {appliedCoupon.description && (
            <p className="text-xs text-success-600 mt-0.5">
              {appliedCoupon.description}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Remove coupon"
          onClick={handleRemove}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-success-600 transition-colors hover:bg-success-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500"
        >
          <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  // ── Input state ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      <div className="flex gap-2">
        {/* Coupon input */}
        <div className="relative flex-1">
          <TagIcon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
            aria-invalid={!!error}
            aria-describedby={error ? "coupon-error" : undefined}
            autoComplete="off"
            spellCheck={false}
            className={[
              "w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm font-mono tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2",
              error
                ? "border-error-400 text-error-700 focus:border-error-400 focus:ring-error-200"
                : "border-secondary-200 text-secondary-900 focus:border-primary-400 focus:ring-primary-200",
            ].join(" ")}
          />
        </div>

        {/* Apply button */}
        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {isLoading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isLoading ? "Applying…" : "Apply"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          id="coupon-error"
          role="alert"
          className="flex items-center gap-1.5 text-xs text-error-600"
        >
          <XCircleIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </form>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name           Type                                          Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * appliedCoupon  AppliedCoupon | null                          —        Applied coupon state
 * onApply        (code: string) => Promise<string|void>|…      required Apply callback; return error string on failure
 * onRemove       () => void                                    —        Remove coupon callback
 * className      string                                        ""       Extra classes on root
 *
 * ─── AppliedCoupon ────────────────────────────────────────────────────────────
 *
 * Name            Type    Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * code            string  yes       Coupon code displayed to user
 * discountAmount  number  yes       VND discount amount
 * description     string  no        Human-readable offer description
 */

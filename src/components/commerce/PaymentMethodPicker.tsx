"use client";

import { useCallback } from "react";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentMethodId =
  | "cod"
  | "bank-transfer"
  | "e-wallet"
  | "installment";

export interface PaymentMethodDef {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: ReactNode;
  /** Badge shown on the card (e.g. "Popular", "0% interest") */
  badge?: string;
  /** Render this method as disabled */
  disabled?: boolean;
}

export interface PaymentMethodPickerProps {
  /** Currently selected payment method */
  value?: PaymentMethodId | null;
  /** Called when the user selects a method */
  onChange: (id: PaymentMethodId) => void;
  /**
   * Override or augment the default payment method list.
   * Provide a complete replacement array or keep undefined to use the defaults.
   */
  methods?: PaymentMethodDef[];
  className?: string;
}

// ─── Default payment methods ──────────────────────────────────────────────────

const DEFAULT_METHODS: PaymentMethodDef[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
    icon: <BanknotesIcon className="w-6 h-6" aria-hidden="true" />,
    badge: "Popular",
  },
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    description: "Transfer directly to our bank account. Order confirmed after payment verified.",
    icon: <BuildingLibraryIcon className="w-6 h-6" aria-hidden="true" />,
  },
  {
    id: "e-wallet",
    label: "E-Wallet",
    description: "Pay instantly with MoMo, ZaloPay, or VNPay.",
    icon: <DevicePhoneMobileIcon className="w-6 h-6" aria-hidden="true" />,
  },
  {
    id: "installment",
    label: "Installment Plan",
    description: "Split into 3–24 monthly payments. 0% interest for 3 months.",
    icon: <CreditCardIcon className="w-6 h-6" aria-hidden="true" />,
    badge: "0% interest",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PaymentMethodPicker — radio-group style payment option selector.
 *
 * ```tsx
 * <PaymentMethodPicker
 *   value={paymentMethod}
 *   onChange={setPaymentMethod}
 * />
 * ```
 */
export function PaymentMethodPicker({
  value,
  onChange,
  methods = DEFAULT_METHODS,
  className = "",
}: PaymentMethodPickerProps) {
  const handleSelect = useCallback(
    (id: PaymentMethodId, disabled?: boolean) => {
      if (!disabled) onChange(id);
    },
    [onChange]
  );

  return (
    <div
      role="radiogroup"
      aria-label="Payment method"
      className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}
    >
      {methods.map((method) => {
        const isSelected = value === method.id;

        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={method.label}
            aria-describedby={`payment-desc-${method.id}`}
            disabled={method.disabled}
            onClick={() => handleSelect(method.id, method.disabled)}
            className={[
              "relative flex w-full items-start gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all duration-150",
              isSelected
                ? "border-primary-500 bg-primary-50 ring-1 ring-primary-400"
                : "border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50",
              method.disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
            ].join(" ")}
          >
            {/* Icon */}
            <span
              className={[
                "mt-0.5 shrink-0 transition-colors",
                isSelected ? "text-primary-600" : "text-secondary-400",
              ].join(" ")}
              aria-hidden="true"
            >
              {method.icon}
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "text-sm font-semibold",
                    isSelected ? "text-primary-800" : "text-secondary-800",
                  ].join(" ")}
                >
                  {method.label}
                </span>
                {method.badge && (
                  <span className="rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-700">
                    {method.badge}
                  </span>
                )}
              </div>
              <p
                id={`payment-desc-${method.id}`}
                className="mt-0.5 text-xs text-secondary-500"
              >
                {method.description}
              </p>
            </div>

            {/* Selected indicator */}
            <span className="shrink-0 mt-0.5" aria-hidden="true">
              {isSelected ? (
                <CheckCircleSolid className="w-5 h-5 text-primary-600" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 text-secondary-300" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type                              Default         Description
 * ──────────────────────────────────────────────────────────────────────────────
 * value      PaymentMethodId | null            —               Currently selected method
 * onChange   (id: PaymentMethodId) => void     required        Selection callback
 * methods    PaymentMethodDef[]                DEFAULT_METHODS Override payment methods
 * className  string                            ""              Extra classes on root div
 *
 * ─── PaymentMethodId ──────────────────────────────────────────────────────────
 * "cod" | "bank-transfer" | "e-wallet" | "installment"
 */

"use client";

import {
  useCallback,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  MapPinIcon,
  CreditCardIcon,
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { PaymentMethodPicker, type PaymentMethodId } from "./PaymentMethodPicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  note?: string;
}

export interface CheckoutFormData {
  address: ShippingAddress;
  paymentMethod: PaymentMethodId;
}

export interface CheckoutFormProps {
  /** Called when the user confirms the order on the review step */
  onSubmit: (data: CheckoutFormData) => void;
  /** Disables the submit button and shows a spinner */
  isSubmitting?: boolean;
  /** Pre-fill the address fields */
  defaultAddress?: Partial<ShippingAddress>;
  /** Pre-select a payment method */
  defaultPaymentMethod?: PaymentMethodId;
  /**
   * Content rendered inside the review step (e.g. CartSummary, order items).
   * If omitted, a simple data recap is shown.
   */
  orderSummarySlot?: ReactNode;
  className?: string;
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: "address",  label: "Shipping",  icon: <MapPinIcon className="w-5 h-5" aria-hidden="true" /> },
  { id: "payment",  label: "Payment",   icon: <CreditCardIcon className="w-5 h-5" aria-hidden="true" /> },
  { id: "review",   label: "Review",    icon: <ClipboardDocumentCheckIcon className="w-5 h-5" aria-hidden="true" /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof ShippingAddress, string>>;

function validateAddress(addr: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};
  if (!addr.fullName.trim()) errors.fullName = "Full name is required.";
  if (!addr.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^(0|\+84)\d{9,10}$/.test(addr.phone.trim().replace(/\s/g, ""))) {
    errors.phone = "Please enter a valid Vietnamese phone number.";
  }
  if (!addr.addressLine.trim()) errors.addressLine = "Street address is required.";
  if (!addr.ward.trim())        errors.ward = "Ward is required.";
  if (!addr.district.trim())    errors.district = "District is required.";
  if (!addr.city.trim())        errors.city = "City / Province is required.";
  return errors;
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  id,
  required,
  error,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-secondary-700"
      >
        {label}
        {required && <span className="ml-0.5 text-error-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-error-600" role="alert" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  [
    "w-full rounded-lg border px-3 py-2.5 text-sm text-secondary-900 transition-shadow focus:outline-none focus:ring-2 placeholder:text-secondary-400",
    hasError
      ? "border-error-400 focus:border-error-400 focus:ring-error-200"
      : "border-secondary-200 focus:border-primary-400 focus:ring-primary-200",
  ].join(" ");

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CheckoutForm — multi-step checkout wizard (address → payment → review).
 *
 * ```tsx
 * <CheckoutForm
 *   onSubmit={async (data) => {
 *     setSubmitting(true);
 *     await placeOrder(data);
 *     router.push("/order-success");
 *   }}
 *   isSubmitting={isSubmitting}
 *   defaultAddress={savedAddress}
 *   orderSummarySlot={<CartSummary ... />}
 * />
 * ```
 */
export function CheckoutForm({
  onSubmit,
  isSubmitting = false,
  defaultAddress,
  defaultPaymentMethod,
  orderSummarySlot,
  className = "",
}: CheckoutFormProps) {
  const [step, setStep] = useState(0); // 0=address, 1=payment, 2=review
  const [address, setAddress] = useState<ShippingAddress>({
    fullName:    defaultAddress?.fullName    ?? "",
    phone:       defaultAddress?.phone       ?? "",
    addressLine: defaultAddress?.addressLine ?? "",
    ward:        defaultAddress?.ward        ?? "",
    district:    defaultAddress?.district    ?? "",
    city:        defaultAddress?.city        ?? "",
    note:        defaultAddress?.note        ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>(
    defaultPaymentMethod ?? null
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof ShippingAddress>(field: K, value: ShippingAddress[K]) => {
      setAddress((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  // ── Step: Address ──────────────────────────────────────────────────────────
  const handleAddressSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const errors = validateAddress(address);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});
      setStep(1);
    },
    [address]
  );

  // ── Step: Payment ──────────────────────────────────────────────────────────
  const handlePaymentNext = useCallback(() => {
    if (!paymentMethod) {
      setPaymentError("Please select a payment method to continue.");
      return;
    }
    setPaymentError(null);
    setStep(2);
  }, [paymentMethod]);

  // ── Step: Review → Submit ──────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(() => {
    if (!paymentMethod) return;
    onSubmit({ address, paymentMethod });
  }, [address, onSubmit, paymentMethod]);

  // ── Progress indicator ─────────────────────────────────────────────────────
  const ProgressBar = (
    <nav aria-label="Checkout steps">
      <ol className="flex items-center">
        {STEPS.map((s, idx) => {
          const isCompleted = idx < step;
          const isCurrent = idx === step;
          return (
            <li key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={idx > step}
                onClick={() => { if (idx < step) setStep(idx); }}
                className={[
                  "flex flex-col items-center gap-1 focus-visible:outline-none",
                  idx < step ? "cursor-pointer" : "cursor-default",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                    isCompleted
                      ? "border-success-500 bg-success-500 text-white"
                      : isCurrent
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-secondary-200 bg-white text-secondary-400",
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    s.icon
                  )}
                </span>
                <span
                  className={[
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-primary-700" : isCompleted ? "text-success-600" : "text-secondary-400",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </button>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={[
                    "mx-2 h-0.5 flex-1 transition-colors duration-200",
                    idx < step ? "bg-success-400" : "bg-secondary-200",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={["flex flex-col gap-6", className].filter(Boolean).join(" ")}
    >
      {ProgressBar}

      {/* ── Step 0: Shipping Address ── */}
      {step === 0 && (
        <form
          onSubmit={handleAddressSubmit}
          noValidate
          aria-label="Shipping address"
          className="flex flex-col gap-5"
        >
          <h2 className="text-base font-semibold text-secondary-900">
            Shipping Address
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" id="fullName" required error={fieldErrors.fullName}>
              <input
                id="fullName"
                type="text"
                value={address.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                aria-invalid={!!fieldErrors.fullName}
                aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                className={inputClass(!!fieldErrors.fullName)}
              />
            </Field>

            <Field label="Phone Number" id="phone" required error={fieldErrors.phone}>
              <input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="0912 345 678"
                autoComplete="tel"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                className={inputClass(!!fieldErrors.phone)}
              />
            </Field>
          </div>

          <Field label="Street Address" id="addressLine" required error={fieldErrors.addressLine}>
            <input
              id="addressLine"
              type="text"
              value={address.addressLine}
              onChange={(e) => updateField("addressLine", e.target.value)}
              placeholder="123 Nguyễn Trãi, Apartment 4B"
              autoComplete="address-line1"
              aria-invalid={!!fieldErrors.addressLine}
              aria-describedby={fieldErrors.addressLine ? "addressLine-error" : undefined}
              className={inputClass(!!fieldErrors.addressLine)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ward" id="ward" required error={fieldErrors.ward}>
              <input
                id="ward"
                type="text"
                value={address.ward}
                onChange={(e) => updateField("ward", e.target.value)}
                placeholder="Phường Bến Nghé"
                aria-invalid={!!fieldErrors.ward}
                aria-describedby={fieldErrors.ward ? "ward-error" : undefined}
                className={inputClass(!!fieldErrors.ward)}
              />
            </Field>

            <Field label="District" id="district" required error={fieldErrors.district}>
              <input
                id="district"
                type="text"
                value={address.district}
                onChange={(e) => updateField("district", e.target.value)}
                placeholder="Quận 1"
                aria-invalid={!!fieldErrors.district}
                aria-describedby={fieldErrors.district ? "district-error" : undefined}
                className={inputClass(!!fieldErrors.district)}
              />
            </Field>

            <Field label="City / Province" id="city" required error={fieldErrors.city}>
              <input
                id="city"
                type="text"
                value={address.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Hồ Chí Minh"
                aria-invalid={!!fieldErrors.city}
                aria-describedby={fieldErrors.city ? "city-error" : undefined}
                className={inputClass(!!fieldErrors.city)}
              />
            </Field>
          </div>

          <Field label="Delivery Note (optional)" id="note">
            <textarea
              id="note"
              value={address.note ?? ""}
              onChange={(e) => updateField("note", e.target.value)}
              placeholder="Gate code, leave at door, call on arrival…"
              rows={2}
              className={inputClass(false)}
            />
          </Field>

          {/* Nav */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              Continue to Payment
              <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      )}

      {/* ── Step 1: Payment ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5" aria-label="Payment method">
          <h2 className="text-base font-semibold text-secondary-900">
            Payment Method
          </h2>

          <PaymentMethodPicker
            value={paymentMethod}
            onChange={(id) => {
              setPaymentMethod(id);
              setPaymentError(null);
            }}
          />

          {paymentError && (
            <p className="text-sm text-error-600" role="alert">
              {paymentError}
            </p>
          )}

          {/* Nav */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex items-center gap-2 rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={handlePaymentNext}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              Review Order
              <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5" aria-label="Review order">
          <h2 className="text-base font-semibold text-secondary-900">
            Review Your Order
          </h2>

          {/* Address recap */}
          <section className="rounded-xl border border-secondary-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-secondary-700">
                Shipping Address
              </h3>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-xs text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                Edit
              </button>
            </div>
            <p className="text-sm text-secondary-800 font-medium">{address.fullName}</p>
            <p className="text-sm text-secondary-600">{address.phone}</p>
            <p className="text-sm text-secondary-600">
              {[address.addressLine, address.ward, address.district, address.city]
                .filter(Boolean)
                .join(", ")}
            </p>
            {address.note && (
              <p className="mt-1 text-xs italic text-secondary-400">{address.note}</p>
            )}
          </section>

          {/* Payment recap */}
          <section className="rounded-xl border border-secondary-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-secondary-700">
                Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                Edit
              </button>
            </div>
            <p className="text-sm text-secondary-800 capitalize">
              {paymentMethod?.replace(/-/g, " ")}
            </p>
          </section>

          {/* Consumer-provided order summary */}
          {orderSummarySlot && (
            <section>{orderSummarySlot}</section>
          )}

          {/* Nav */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
            >
              {isSubmitting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
              )}
              {isSubmitting ? "Placing Order…" : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name                Type                               Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * onSubmit            (data: CheckoutFormData) => void   required Called on final confirmation
 * isSubmitting        boolean                            false    Disables submit + shows spinner
 * defaultAddress      Partial<ShippingAddress>           —        Pre-fill address fields
 * defaultPaymentMethod PaymentMethodId                   —        Pre-select payment method
 * orderSummarySlot    ReactNode                          —        Content shown in review step
 * className           string                             ""       Extra classes on root div
 *
 * ─── CheckoutFormData ─────────────────────────────────────────────────────────
 * { address: ShippingAddress; paymentMethod: PaymentMethodId }
 *
 * ─── ShippingAddress ──────────────────────────────────────────────────────────
 * { fullName, phone, addressLine, ward, district, city, note? }
 */

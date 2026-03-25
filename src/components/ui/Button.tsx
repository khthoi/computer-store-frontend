"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Visual style variant of the button */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";

/** Size of the button */
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant
   * @default "primary"
   */
  variant?: ButtonVariant;
  /** Button size
   * @default "md"
   */
  size?: ButtonSize;
  /** Shows a spinner and disables the button while a promise is resolving
   * @default false
   */
  isLoading?: boolean;
  /** Icon rendered to the left of the label. Use 16×16 SVG icons. */
  leftIcon?: ReactNode;
  /** Icon rendered to the right of the label. Use 16×16 SVG icons. */
  rightIcon?: ReactNode;
  /** Stretches the button to fill its container width
   * @default false
   */
  fullWidth?: boolean;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm " +
    "hover:bg-primary-700 active:bg-primary-800 " +
    "focus-visible:ring-primary-500",

  secondary:
    "bg-secondary-100 text-secondary-700 border border-secondary-200 " +
    "hover:bg-secondary-200 active:bg-secondary-300 " +
    "focus-visible:ring-secondary-400",

  ghost:
    "bg-transparent text-secondary-600 " +
    "hover:bg-secondary-100 active:bg-secondary-200 " +
    "focus-visible:ring-secondary-400",

  danger:
    "bg-error-600 text-white shadow-sm " +
    "hover:bg-error-700 active:bg-error-800 " +
    "focus-visible:ring-error-500",

  outline:
    "bg-transparent text-primary-600 border border-primary-400 " +
    "hover:bg-primary-50 active:bg-primary-100 " +
    "focus-visible:ring-primary-500",
};

const SIZE: Record<ButtonSize, string> = {
  xs: "h-7  px-2.5 text-xs",
  sm: "h-8  px-3   text-sm",
  md: "h-10 px-4   text-sm",
  lg: "h-12 px-6   text-base",
};

/** Icon wrapper size aligned with each button size */
const ICON_SIZE: Record<ButtonSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};


// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Button — primary interactive element.
 *
 * ```tsx
 * // Primary CTA
 * <Button onClick={handleAddToCart} leftIcon={<CartIcon />}>Add to Cart</Button>
 *
 * // Loading state
 * <Button isLoading>Processing…</Button>
 *
 * // Destructive action
 * <Button variant="danger" size="sm">Remove</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    className = "",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={[
        BASE,
        VARIANT[variant],
        SIZE[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {/* Left slot: spinner replaces leftIcon while loading */}
      {isLoading ? (
        <ArrowPathIcon
          className={`${ICON_SIZE[size]} animate-spin`}
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span className={`${ICON_SIZE[size]} flex shrink-0 items-center`} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}

      {children}

      {/* Right icon is hidden while loading to avoid layout shift */}
      {!isLoading && rightIcon && (
        <span className={`${ICON_SIZE[size]} flex shrink-0 items-center`} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name        Type                                      Default      Description
 * ──────────────────────────────────────────────────────────────────────────────
 * variant     "primary"|"secondary"|"ghost"|            "primary"    Visual style
 *             "danger"|"outline"
 * size        "xs"|"sm"|"md"|"lg"                       "md"         Dimensions
 * isLoading   boolean                                   false        Spinner + disabled
 * leftIcon    ReactNode                                 —            Left icon slot
 * rightIcon   ReactNode                                 —            Right icon slot
 * fullWidth   boolean                                   false        100% width
 * disabled    boolean                                   false        Native disabled
 * onClick     React.MouseEventHandler<HTMLButtonElement> —           Click handler
 * className   string                                    ""           Extra Tailwind classes
 * children    ReactNode                                 —            Button label/content
 *
 * All native <button> HTML attributes are also supported via spread.
 */

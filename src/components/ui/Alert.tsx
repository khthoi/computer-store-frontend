"use client";

import { useState, type ReactNode } from "react";
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  /** Semantic color variant
   * @default "info"
   */
  variant?: AlertVariant;
  /** Alert title (bold, optional) */
  title?: string;
  /** Allow the user to dismiss the alert
   * @default false
   */
  dismissible?: boolean;
  /** Called when the alert is dismissed */
  onDismiss?: () => void;
  /** Replace the default icon with a custom node, or set false to hide the icon */
  icon?: ReactNode | false;
  className?: string;
  children: ReactNode;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT: Record<
  AlertVariant,
  { wrapper: string; icon: string; title: string; body: string; dismiss: string }
> = {
  info: {
    wrapper: "bg-info-50    border-info-200",
    icon:    "text-info-500",
    title:   "text-info-800",
    body:    "text-info-700",
    dismiss: "text-info-500 hover:bg-info-100 hover:text-info-700",
  },
  success: {
    wrapper: "bg-success-50  border-success-200",
    icon:    "text-success-500",
    title:   "text-success-800",
    body:    "text-success-700",
    dismiss: "text-success-500 hover:bg-success-100 hover:text-success-700",
  },
  warning: {
    wrapper: "bg-warning-50  border-warning-200",
    icon:    "text-warning-500",
    title:   "text-warning-800",
    body:    "text-warning-700",
    dismiss: "text-warning-500 hover:bg-warning-100 hover:text-warning-700",
  },
  error: {
    wrapper: "bg-error-50    border-error-200",
    icon:    "text-error-500",
    title:   "text-error-800",
    body:    "text-error-700",
    dismiss: "text-error-500 hover:bg-error-100 hover:text-error-700",
  },
};

// ─── Default icons ────────────────────────────────────────────────────────────

const DEFAULT_ICON: Record<AlertVariant, ReactNode> = {
  info:    <InformationCircleIcon className="size-5" aria-hidden="true" />,
  success: <CheckCircleIcon className="size-5" aria-hidden="true" />,
  warning: <ExclamationTriangleIcon className="size-5" aria-hidden="true" />,
  error:   <XCircleIcon className="size-5" aria-hidden="true" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Alert — inline notification banner with icon, title, and optional dismiss.
 *
 * ```tsx
 * // Informational
 * <Alert variant="info" title="Heads up">Your cart expires in 30 minutes.</Alert>
 *
 * // Dismissible error
 * <Alert variant="error" dismissible onDismiss={() => clearError()}>
 *   Payment failed. Please try again.
 * </Alert>
 *
 * // No icon
 * <Alert variant="success" icon={false}>Order confirmed!</Alert>
 * ```
 */
export function Alert({
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  icon,
  className = "",
  children,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const styles = VARIANT[variant];

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const resolvedIcon = icon === false ? null : (icon ?? DEFAULT_ICON[variant]);

  return (
    <div
      role="alert"
      className={[
        "flex gap-3 rounded-md border p-4",
        styles.wrapper,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Icon */}
      {resolvedIcon && (
        <span className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden="true">
          {resolvedIcon}
        </span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold ${styles.title} ${children ? "mb-1" : ""}`}>
            {title}
          </p>
        )}
        <div className={`text-sm ${styles.body}`}>{children}</div>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={dismiss}
          className={[
            "ml-auto -mr-1 -mt-0.5 flex size-7 shrink-0 items-center justify-center rounded transition-colors",
            styles.dismiss,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          ].join(" ")}
        >
          <XMarkIcon className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name        Type                               Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * variant     "info"|"success"|"warning"|"error"  "info"   Color + icon variant
 * title       string                             —        Bold title line
 * dismissible boolean                            false    Show × dismiss button
 * onDismiss   () => void                         —        Called on dismiss
 * icon        ReactNode | false                  default  Custom icon or false to hide
 * className   string                             ""       Extra Tailwind classes
 * children    ReactNode                          required Alert body content
 */

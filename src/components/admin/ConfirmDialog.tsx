"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  /** Body text explaining what the action does */
  description: string;
  /**
   * Variant affects icon and confirm button color.
   * @default "danger"
   */
  variant?: "danger" | "warning" | "info";
  /** Label on the confirm button
   * @default "Confirm"
   */
  confirmLabel?: string;
  /** Label on the cancel button
   * @default "Cancel"
   */
  cancelLabel?: string;
  /**
   * If provided, the user must type this exact string before the confirm
   * button becomes active. Use for irreversible destructive actions.
   * e.g. "DELETE" or the item name.
   */
  requiredPhrase?: string;
  /** Shows a spinner and disables the confirm button */
  isConfirming?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

function getFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ConfirmDialog — confirmation modal with optional typed-phrase guard
 * for destructive actions.
 *
 * ```tsx
 * // Simple confirm
 * <ConfirmDialog
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Product"
 *   description="This will permanently delete 'Intel Core i9-14900K' and all its data."
 *   confirmLabel="Delete"
 * />
 *
 * // Typed confirmation for destructive actions
 * <ConfirmDialog
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleBulkDelete}
 *   title="Delete 24 Products"
 *   description="This action cannot be undone. All selected products will be permanently removed."
 *   requiredPhrase="DELETE"
 *   confirmLabel="Delete All"
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  requiredPhrase,
  isConfirming = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const phraseInputId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [typedPhrase, setTypedPhrase] = useState("");

  const requiresPhrase = !!requiredPhrase;
  const phraseMatches =
    !requiresPhrase || typedPhrase === requiredPhrase;
  const canConfirm = phraseMatches && !isConfirming;

  // Reset phrase on open/close
  useEffect(() => {
    if (!isOpen) setTypedPhrase("");
  }, [isOpen]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, [isOpen]);

  // Focus first element on open
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const els = panelRef.current ? getFocusable(panelRef.current) : [];
      els[0]?.focus();
    }, 20);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && panelRef.current) {
        const els = getFocusable(panelRef.current);
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    },
    [onClose]
  );

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return;
    await Promise.resolve(onConfirm());
  }, [canConfirm, onConfirm]);

  const handlePhraseChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setTypedPhrase(e.target.value),
    []
  );

  if (!isOpen || typeof document === "undefined") return null;

  const iconConfig = {
    danger:  { icon: <ExclamationTriangleIcon className="w-6 h-6" />, bg: "bg-error-100",   text: "text-error-600",   btn: "bg-error-600 hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500"   },
    warning: { icon: <ExclamationTriangleIcon className="w-6 h-6" />, bg: "bg-warning-100", text: "text-warning-600", btn: "bg-warning-600 hover:bg-warning-700 active:bg-warning-800 focus-visible:ring-warning-500" },
    info:    { icon: <InformationCircleIcon className="w-6 h-6" />,   bg: "bg-info-100",    text: "text-info-600",    btn: "bg-info-600 hover:bg-info-700 active:bg-info-800 focus-visible:ring-info-500"         },
  }[variant];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Cancel"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Body */}
        <div className="px-6 pb-6 pt-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4">
            <span
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                iconConfig.bg,
                iconConfig.text,
              ].join(" ")}
              aria-hidden="true"
            >
              {iconConfig.icon}
            </span>
            <div className="min-w-0 pt-1.5">
              <h2
                id={titleId}
                className="text-base font-semibold text-secondary-900"
              >
                {title}
              </h2>
              <p
                id={descId}
                className="mt-1 text-sm text-secondary-600"
              >
                {description}
              </p>
            </div>
          </div>

          {/* Typed confirmation */}
          {requiresPhrase && (
            <div className="mt-5 flex flex-col gap-1.5">
              <label
                htmlFor={phraseInputId}
                className="text-sm text-secondary-600"
              >
                To confirm, type{" "}
                <span className="font-mono font-semibold text-error-700">
                  {requiredPhrase}
                </span>{" "}
                below:
              </label>
              <input
                id={phraseInputId}
                type="text"
                value={typedPhrase}
                onChange={handlePhraseChange}
                autoComplete="off"
                spellCheck={false}
                placeholder={requiredPhrase}
                className={[
                  "w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2",
                  phraseMatches && typedPhrase
                    ? "border-success-400 focus:border-success-400 focus:ring-success-200"
                    : typedPhrase
                    ? "border-error-400 focus:border-error-400 focus:ring-error-200"
                    : "border-secondary-200 focus:border-primary-400 focus:ring-primary-200",
                ].join(" ")}
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              className="flex items-center justify-center rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className={[
                "flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                iconConfig.btn,
              ].join(" ")}
            >
              {isConfirming && (
                <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
              )}
              {isConfirming ? "Processing…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name            Type                       Default    Description
 * ──────────────────────────────────────────────────────────────────────────────
 * isOpen          boolean                    required   Controls visibility
 * onClose         () => void                 required   Close callback
 * onConfirm       () => void | Promise<void> required   Confirm action callback
 * title           string                     required   Dialog heading
 * description     string                     required   Explanation text
 * variant         "danger"|"warning"|"info"  "danger"   Icon + confirm button color
 * confirmLabel    string                     "Confirm"  Confirm button text
 * cancelLabel     string                     "Cancel"   Cancel button text
 * requiredPhrase  string                     —          Phrase user must type to unlock confirm
 * isConfirming    boolean                    false      Shows spinner, disables confirm button
 */

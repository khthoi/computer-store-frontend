"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "warning" | "error" | "info";
export type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface ToastMessageProps {
  /** Controls visibility — parent is responsible for toggling */
  isVisible: boolean;
  /** Visual variant — controls color and icon @default "success" */
  type?: ToastType;
  /** Message text */
  message: string;
  /** Viewport corner placement @default "top-right" */
  position?: ToastPosition;
  /**
   * Auto-dismiss duration in milliseconds.
   * Pass `0` to disable auto-dismiss.
   * @default 3500
   */
  duration?: number;
  /**
   * Called when the auto-dismiss timer fires or the close button is clicked.
   * The parent should set `isVisible` to `false` in this handler.
   */
  onClose?: () => void;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const POSITION_CLASS: Record<ToastPosition, string> = {
  "top-right":    "top-6 right-6",
  "top-left":     "top-6 left-6",
  "bottom-right": "bottom-6 right-6",
  "bottom-left":  "bottom-6 left-6",
};

const TYPE_BG: Record<ToastType, string> = {
  success: "bg-success-600",
  error:   "bg-error-600",
  warning: "bg-warning-500",
  info:    "bg-primary-600",
};

const TYPE_ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon         className="h-5 w-5 shrink-0" aria-hidden="true" />,
  error:   <ExclamationCircleIcon   className="h-5 w-5 shrink-0" aria-hidden="true" />,
  warning: <ExclamationTriangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />,
  info:    <InformationCircleIcon   className="h-5 w-5 shrink-0" aria-hidden="true" />,
};

// ─── Standalone ToastMessage ───────────────────────────────────────────────────

/**
 * ToastMessage — a fixed-position notification with auto-dismiss and Framer Motion transitions.
 *
 * Renders via `createPortal` so it is never clipped by parent containers.
 * The parent controls visibility via `isVisible`; `onClose` is called when the
 * timer fires or the user clicks the × button.
 *
 * For multiple simultaneous toasts that stack properly, use `ToastProvider` +
 * `useToast()` instead.
 *
 * ```tsx
 * const [visible, setVisible] = useState(false);
 *
 * <ToastMessage
 *   isVisible={visible}
 *   type="success"
 *   message="Đã thêm vào giỏ hàng!"
 *   position="top-right"
 *   duration={3000}
 *   onClose={() => setVisible(false)}
 * />
 * ```
 */
export function ToastMessage({
  isVisible,
  type = "success",
  message,
  position = "top-right",
  duration = 3500,
  onClose,
}: ToastMessageProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Freeze the last visible content so the exit animation doesn't flash empty text
  const [displayType, setDisplayType] = useState<ToastType>(type);
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => { setIsMounted(true); }, []);

  // Update display values only when becoming visible (captures the new toast's data)
  useEffect(() => {
    if (isVisible) {
      setDisplayType(type);
      setDisplayMessage(message);
    }
  }, [isVisible, type, message]);

  // Auto-dismiss timer — resets whenever isVisible flips to true
  useEffect(() => {
    if (!isVisible || !duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isMounted) return null;

  const isTop = position.startsWith("top");
  const yOffset = isTop ? -16 : 16;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: yOffset, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,       scale: 1    }}
          exit={{    opacity: 0, y: yOffset, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className={[
            "fixed z-[70] flex items-center gap-2.5 rounded-xl px-4 py-3",
            "text-sm font-medium text-white shadow-xl pointer-events-auto",
            POSITION_CLASS[position],
            TYPE_BG[displayType],
          ].join(" ")}
        >
          {TYPE_ICON[displayType]}

          <span>{displayMessage}</span>

          {onClose && (
            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={onClose}
              className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Toast Stack (Provider + Hook) ────────────────────────────────────────────

interface ToastEntry {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * useToast — returns `showToast(message, type?, duration?)`.
 * Must be called inside a `<ToastProvider>`.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ── Individual stacked toast item ─────────────────────────────────────────────

function ToastItem({
  entry,
  onRemove,
}: {
  entry: ToastEntry;
  onRemove: (id: string) => void;
}) {
  // Auto-dismiss from inside the item so each timer is independent
  useEffect(() => {
    if (!entry.duration) return;
    const t = setTimeout(() => onRemove(entry.id), entry.duration);
    return () => clearTimeout(t);
  }, [entry.id, entry.duration, onRemove]);

  return (
    <motion.div
      // layout animates positional shifts when sibling items are removed (stack reflow)
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      className={[
        "pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3",
        "text-sm font-medium text-white shadow-xl",
        TYPE_BG[entry.type],
      ].join(" ")}
    >
      {TYPE_ICON[entry.type]}
      <span>{entry.message}</span>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => onRemove(entry.id)}
        className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * ToastProvider — wraps the app (or a subtree) and renders a single fixed
 * container that stacks toasts vertically. Use `useToast()` in any descendant
 * to fire toasts.
 *
 * Add once near the root, e.g. inside `<Providers>` in `providers.tsx`.
 *
 * ```tsx
 * // providers.tsx
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 *
 * // any component
 * const { showToast } = useToast();
 * showToast("Đã thêm vào giỏ hàng!", "success", 3000);
 * ```
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration = 3500) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isMounted &&
        createPortal(
          <div
            aria-label="Thông báo"
            className="pointer-events-none fixed right-6 top-6 z-[70] flex flex-col gap-2"
          >
            <AnimatePresence initial={false}>
              {toasts.map((entry) => (
                <ToastItem key={entry.id} entry={entry} onRemove={removeToast} />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

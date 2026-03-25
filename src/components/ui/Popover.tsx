"use client";

import {
  cloneElement,
  ReactPortal,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

export interface PopoverProps {
  /** Content rendered inside the floating panel */
  content: ReactNode;
  /** Placement relative to the trigger
   * @default "bottom-start"
   */
  placement?: PopoverPlacement;
  /**
   * The trigger element. Must be a single React element.
   * The Popover injects onClick, ref, and ARIA props.
   */
  children: ReactElement;
  /** Controlled open state */
  open?: boolean;
  /** Called when the popover opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Close when clicking outside
   * @default true
   */
  closeOnOutsideClick?: boolean;
  /** Close on Escape key
   * @default true
   */
  closeOnEscape?: boolean;
  /** Extra classes on the panel */
  panelClassName?: string;
}

// ─── Placement style map ──────────────────────────────────────────────────────
// Uses fixed positioning; offset calculated from trigger's getBoundingClientRect.
// For simplicity, these are the CSS positioning classes applied relative to
// the trigger's wrapper (which has position:relative).

const PANEL_PLACEMENT: Record<PopoverPlacement, string> = {
  "top":          "bottom-full left-1/2 mb-2 -translate-x-1/2",
  "top-start":    "bottom-full left-0 mb-2",
  "top-end":      "bottom-full right-0 mb-2",
  "bottom":       "top-full left-1/2 mt-2 -translate-x-1/2",
  "bottom-start": "top-full left-0 mt-2",
  "bottom-end":   "top-full right-0 mt-2",
  "left":         "right-full top-0 mr-2",
  "right":        "left-full top-0 ml-2",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Popover — click-triggered floating panel with focus management.
 *
 * Unlike `Tooltip`, Popover:
 * - Opens on click (not hover)
 * - Persists until dismissed
 * - Can contain interactive content (forms, menus)
 *
 * ```tsx
 * // Simple info popover
 * <Popover
 *   content={<p className="text-sm">Shipping is free over 500,000₫.</p>}
 *   placement="bottom-start"
 * >
 *   <button type="button" className="text-info-600 underline text-sm">
 *     Shipping info
 *   </button>
 * </Popover>
 *
 * // Interactive content (filter panel, color picker, etc.)
 * <Popover
 *   content={<FilterPanel onApply={applyFilters} />}
 *   placement="bottom-end"
 * >
 *   <Button variant="outline" rightIcon={<FilterIcon />}>Filter</Button>
 * </Popover>
 * ```
 */
export function Popover({
  content,
  placement = "bottom-start",
  children,
  open: controlledOpen,
  onOpenChange,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  panelClassName = "",
}: PopoverProps) {
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? (controlledOpen ?? false) : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  // ── Outside click ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    // Defer so the triggering click doesn't immediately close
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, closeOnOutsideClick, close]);

  // ── Escape key ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeOnEscape, close]);

  // ── Focus first element when panel opens ──────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const FOCUSABLE =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
      'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [isOpen]);

  if (!isValidElement(children)) return children;

  // Inject toggle + ARIA onto the trigger
  const trigger = cloneElement(
    children as ReactElement<Record<string, unknown>>,
    {
      onClick: (e: React.MouseEvent) => {
        // Call original onClick if provided
        const original = (children as ReactElement<Record<string, unknown>>).props.onClick as
          | ((e: React.MouseEvent) => void)
          | undefined;
        original?.(e);
        toggle();
      },
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? panelId : undefined,
      "aria-haspopup": "dialog" as const,
    }
  );

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      {trigger}

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          tabIndex={-1}
          className={[
            "absolute z-50 min-w-[12rem] rounded-md border border-secondary-200 bg-white shadow-lg",
            "focus:outline-none",
            PANEL_PLACEMENT[placement],
            panelClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {content}
        </div>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name                Type                Default         Description
 * ──────────────────────────────────────────────────────────────────────────────
 * content             ReactNode           required        Panel content
 * placement           PopoverPlacement    "bottom-start"  Floating position
 * children            ReactElement        required        Trigger element
 * open                boolean             —               Controlled open state
 * onOpenChange        (open: boolean)=>void —             Open/close callback
 * closeOnOutsideClick boolean             true            Close on outside click
 * closeOnEscape       boolean             true            Close on Escape
 * panelClassName      string              ""              Extra classes on panel
 *
 * PopoverPlacement values:
 *   "top" | "top-start" | "top-end"
 *   "bottom" | "bottom-start" | "bottom-end"
 *   "left" | "right"
 */

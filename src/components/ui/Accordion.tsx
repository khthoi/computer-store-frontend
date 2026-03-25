"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AccordionItemDef {
  /** Unique identifier */
  value: string;
  /** Header label */
  label: ReactNode;
  /** Optional icon before the label */
  icon?: ReactNode;
  /** Panel content */
  children: ReactNode;
  /** Prevent this item from being toggled */
  disabled?: boolean;
}

export interface AccordionProps {
  /** Accordion items to render */
  items: AccordionItemDef[];
  /**
   * Controlled open item(s).
   * Pass string for single, string[] for multiple.
   */
  value?: string | string[];
  /** Initial open item(s) — uncontrolled */
  defaultValue?: string | string[];
  /** Called when open items change */
  onChange?: (value: string | string[]) => void;
  /**
   * Allow multiple items to be open simultaneously.
   * @default false
   */
  multiple?: boolean;
  /** Visual variant
   * @default "bordered"
   */
  variant?: "bordered" | "ghost" | "separated";
  className?: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AccordionContext {
  openValues: string[];
  toggle: (value: string) => void;
  baseId: string;
}

const AccordionCtx = createContext<AccordionContext | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionCtx);
  if (!ctx) throw new Error("Accordion context missing");
  return ctx;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT_WRAPPER: Record<string, string> = {
  bordered:  "divide-y divide-secondary-200 rounded-md border border-secondary-200",
  ghost:     "divide-y divide-secondary-100",
  separated: "flex flex-col gap-2",
};

const VARIANT_ITEM: Record<string, string> = {
  bordered:  "",
  ghost:     "",
  separated: "rounded-md border border-secondary-200",
};

const VARIANT_TRIGGER: Record<string, string> = {
  bordered:  "hover:bg-secondary-50",
  ghost:     "hover:bg-secondary-50",
  separated: "rounded-md hover:bg-secondary-50",
};


// ─── AccordionItem component ──────────────────────────────────────────────────

function AccordionItem({
  item,
  variantKey,
}: {
  item: AccordionItemDef;
  variantKey: string;
}) {
  const { openValues, toggle, baseId } = useAccordion();
  const isOpen = openValues.includes(item.value);
  const triggerId = `${baseId}-trigger-${item.value}`;
  const panelId = `${baseId}-panel-${item.value}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!item.disabled) toggle(item.value);
    }
  };

  return (
    <div className={VARIANT_ITEM[variantKey]}>
      {/* Trigger */}
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={item.disabled}
        onClick={() => toggle(item.value)}
        onKeyDown={handleKeyDown}
        className={[
          "flex w-full items-center justify-between gap-3 px-4 py-4 text-left",
          "text-sm font-medium text-secondary-800 transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          VARIANT_TRIGGER[variantKey],
        ].join(" ")}
      >
        <span className="flex items-center gap-3 min-w-0">
          {item.icon && (
            <span className="shrink-0 size-5 text-secondary-400" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className="truncate">{item.label}</span>
        </span>

        <ChevronDownIcon
          className={[
            "size-4 shrink-0 text-secondary-400 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {/* Panel — animated via CSS grid row expansion */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={[
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        {/* Inner wrapper must have overflow-hidden so content is clipped when collapsed */}
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 text-sm text-secondary-600">
            {item.children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion component ──────────────────────────────────────────────────────

/**
 * Accordion — collapsible sections with smooth animation.
 * Uses the CSS grid row trick (no inline styles, no JS height measurement).
 *
 * ```tsx
 * // Single open
 * <Accordion
 *   items={[
 *     { value: "cpu",  label: "CPU Compatibility",  children: <p>…</p> },
 *     { value: "ram",  label: "RAM Requirements",   children: <p>…</p> },
 *   ]}
 *   defaultValue="cpu"
 * />
 *
 * // Multiple open with ghost variant
 * <Accordion
 *   items={faqItems}
 *   multiple
 *   variant="ghost"
 *   defaultValue={["q1", "q2"]}
 * />
 * ```
 */
export function Accordion({
  items,
  value,
  defaultValue,
  onChange,
  multiple = false,
  variant = "bordered",
  className = "",
}: AccordionProps) {
  const baseId = useId();
  const isControlled = value !== undefined;

  const normalise = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const [internalValues, setInternalValues] = useState<string[]>(
    normalise(defaultValue)
  );
  const openValues = isControlled ? normalise(value) : internalValues;

  const toggle = useCallback(
    (val: string) => {
      const next = openValues.includes(val)
        ? openValues.filter((v) => v !== val)
        : multiple
        ? [...openValues, val]
        : [val];

      if (!isControlled) setInternalValues(next);
      onChange?.(multiple ? next : (next[0] ?? ""));
    },
    [isControlled, multiple, onChange, openValues]
  );

  return (
    <AccordionCtx.Provider value={{ openValues, toggle, baseId }}>
      <div
        className={[VARIANT_WRAPPER[variant], className]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map((item) => (
          <AccordionItem key={item.value} item={item} variantKey={variant} />
        ))}
      </div>
    </AccordionCtx.Provider>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name          Type                               Default     Description
 * ──────────────────────────────────────────────────────────────────────────────
 * items         AccordionItemDef[]                 required    Panel definitions
 * value         string | string[]                  —           Controlled open value(s)
 * defaultValue  string | string[]                  —           Initial open value(s)
 * onChange      (v: string|string[]) => void       —           Change callback
 * multiple      boolean                            false       Allow many panels open
 * variant       "bordered"|"ghost"|"separated"     "bordered"  Visual style
 * className     string                             ""          Extra classes on root
 *
 * ─── AccordionItemDef ─────────────────────────────────────────────────────────
 *
 * Name      Type       Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * value     string     yes       Unique identifier
 * label     ReactNode  yes       Header text/content
 * icon      ReactNode  no        Icon before label
 * children  ReactNode  yes       Panel body
 * disabled  boolean    no        Prevent toggling
 */

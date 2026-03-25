"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabsOrientation = "horizontal" | "vertical";
export type TabsVariant = "line" | "pill";

export interface TabItem {
  /** Unique key for this tab */
  value: string;
  /** Tab button label */
  label: ReactNode;
  /** Icon rendered before the label */
  icon?: ReactNode;
  /** Prevents selecting this tab */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab definitions */
  tabs: TabItem[];
  /** Controlled active tab value */
  value?: string;
  /** Initial active tab (uncontrolled)
   * @default first tab value
   */
  defaultValue?: string;
  /** Called when the active tab changes */
  onChange?: (value: string) => void;
  /** Layout orientation
   * @default "horizontal"
   */
  orientation?: TabsOrientation;
  /** Visual style variant
   * @default "line"
   */
  variant?: TabsVariant;
  /**
   * When true, all panels remain mounted but only the active one is visible.
   * When false (default), only the active panel is rendered.
   * @default false
   */
  keepMounted?: boolean;
  className?: string;
  children: ReactNode;
}

export interface TabPanelProps {
  /** Must match a TabItem value */
  value: string;
  children: ReactNode;
  className?: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabsContextValue {
  activeValue: string;
  baseId: string;
  orientation: TabsOrientation;
  keepMounted: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be used inside Tabs");
  return ctx;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const TAB_BASE =
  "inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 " +
  "disabled:pointer-events-none disabled:opacity-40";

const VARIANT_TAB: Record<
  TabsVariant,
  { active: string; inactive: string; list: string; tab: string }
> = {
  line: {
    list:     "border-b border-secondary-200",
    tab:      "rounded-none px-4 py-2.5 border-b-2 -mb-px",
    active:   "border-primary-600 text-primary-600",
    inactive: "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300",
  },
  pill: {
    list:     "bg-secondary-100 p-1 rounded-lg gap-1",
    tab:      "rounded-md px-4 py-2",
    active:   "bg-white text-secondary-900 shadow-sm",
    inactive: "text-secondary-500 hover:text-secondary-700",
  },
};

const VERTICAL_TAB: Record<
  TabsVariant,
  { active: string; inactive: string; list: string; tab: string }
> = {
  line: {
    list:     "border-r border-secondary-200",
    tab:      "rounded-none px-4 py-2.5 border-r-2 -mr-px justify-start",
    active:   "border-primary-600 text-primary-600",
    inactive: "border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300",
  },
  pill: {
    list:     "bg-secondary-100 p-1 rounded-lg gap-1",
    tab:      "rounded-md px-4 py-2 justify-start",
    active:   "bg-white text-secondary-900 shadow-sm",
    inactive: "text-secondary-500 hover:text-secondary-700",
  },
};

// ─── Tabs component ───────────────────────────────────────────────────────────

/**
 * Tabs — tabbed content with keyboard navigation and optional lazy mounting.
 *
 * ```tsx
 * const tabs = [
 *   { value: "specs", label: "Specifications" },
 *   { value: "reviews", label: "Reviews" },
 *   { value: "qa", label: "Q&A", disabled: true },
 * ];
 *
 * <Tabs tabs={tabs} defaultValue="specs">
 *   <TabPanel value="specs"><SpecTable ... /></TabPanel>
 *   <TabPanel value="reviews"><ReviewList ... /></TabPanel>
 *   <TabPanel value="qa"><QASection ... /></TabPanel>
 * </Tabs>
 *
 * // Controlled
 * <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab}>
 *   ...
 * </Tabs>
 * ```
 */
export function Tabs({
  tabs,
  value,
  defaultValue,
  onChange,
  orientation = "horizontal",
  variant = "line",
  keepMounted = false,
  className = "",
  children,
}: TabsProps) {
  const baseId = useId();
  const tabListRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? tabs.find((t) => !t.disabled)?.value ?? ""
  );
  const activeValue = isControlled ? (value ?? "") : internalValue;

  const handleSelect = useCallback(
    (tabValue: string) => {
      if (!isControlled) setInternalValue(tabValue);
      onChange?.(tabValue);
    },
    [isControlled, onChange]
  );

  const isVertical = orientation === "vertical";
  const styles = isVertical ? VERTICAL_TAB[variant] : VARIANT_TAB[variant];

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = tabs.filter((t) => !t.disabled);
    const currentIdx = enabled.findIndex((t) => t.value === activeValue);

    let nextIdx = currentIdx;

    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

    if (e.key === prevKey) {
      e.preventDefault();
      nextIdx = (currentIdx - 1 + enabled.length) % enabled.length;
    } else if (e.key === nextKey) {
      e.preventDefault();
      nextIdx = (currentIdx + 1) % enabled.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIdx = enabled.length - 1;
    } else {
      return;
    }

    const nextTab = enabled[nextIdx];
    if (nextTab) {
      handleSelect(nextTab.value);
      // Move DOM focus to the newly selected tab button
      const el = tabListRef.current?.querySelector<HTMLButtonElement>(
        `[data-value="${nextTab.value}"]`
      );
      el?.focus();
    }
  };

  return (
    <TabsContext.Provider value={{ activeValue, baseId, orientation, keepMounted }}>
      <div
        className={[
          isVertical ? "flex gap-6" : "flex flex-col",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Tab list */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation={orientation}
          onKeyDown={handleKeyDown}
          className={[
            "flex gap-1",
            isVertical ? "flex-col" : "flex-row",
            styles.list,
          ].join(" ")}
        >
          {tabs.map((tab) => {
            const isActive = tab.value === activeValue;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.value}`}
                aria-controls={`${baseId}-panel-${tab.value}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                data-value={tab.value}
                disabled={tab.disabled}
                onClick={() => handleSelect(tab.value)}
                className={[
                  TAB_BASE,
                  styles.tab,
                  isActive ? styles.active : styles.inactive,
                ].join(" ")}
              >
                {tab.icon && (
                  <span className="size-4" aria-hidden="true">
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </TabsContext.Provider>
  );
}

// ─── TabPanel component ───────────────────────────────────────────────────────

/**
 * TabPanel — content area for a specific tab. Must be used inside `<Tabs>`.
 */
export function TabPanel({ value, children, className = "" }: TabPanelProps) {
  const { activeValue, baseId, keepMounted } = useTabsContext();
  const isActive = value === activeValue;

  if (!keepMounted && !isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      hidden={!isActive}
      className={[
        "focus-visible:outline-none",
        isActive ? "" : "hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/*
 * ─── Tabs Prop Table ──────────────────────────────────────────────────────────
 *
 * Name          Type                          Default       Description
 * ──────────────────────────────────────────────────────────────────────────────
 * tabs          TabItem[]                     required      Tab definitions
 * value         string                        —             Controlled active tab
 * defaultValue  string                        first tab     Initial active tab
 * onChange      (value: string) => void       —             Tab change callback
 * orientation   "horizontal"|"vertical"       "horizontal"  Layout axis
 * variant       "line"|"pill"                 "line"        Visual style
 * keepMounted   boolean                       false         Keep all panels in DOM
 * className     string                        ""            Extra classes on root
 * children      ReactNode                     required      TabPanel components
 *
 * ─── TabItem Prop Table ───────────────────────────────────────────────────────
 *
 * Name      Type       Description
 * ──────────────────────────────────────────────────────────────────────────────
 * value     string     Unique identifier
 * label     ReactNode  Tab button text/content
 * icon      ReactNode  Icon before label
 * disabled  boolean    Prevent selection
 *
 * ─── TabPanel Prop Table ──────────────────────────────────────────────────────
 *
 * Name      Type       Description
 * ──────────────────────────────────────────────────────────────────────────────
 * value     string     Must match a TabItem value
 * children  ReactNode  Panel content
 * className string     Extra classes on panel div
 */

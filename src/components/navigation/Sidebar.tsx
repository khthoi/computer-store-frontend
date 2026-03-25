"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  /** Unique key */
  value: string;
  /** Display label */
  label: string;
  /** Link href. If omitted and children present, acts as a group toggle. */
  href?: string;
  /** Optional Heroicon or ReactNode */
  icon?: ReactNode;
  /** Marks this item as the currently active route */
  active?: boolean;
  /** Nested sub-items */
  children?: SidebarNavItem[];
  /** Disable this item */
  disabled?: boolean;
  /** Small badge label (e.g. "New", count) */
  badge?: ReactNode;
}

export interface SidebarProps {
  /** Navigation tree */
  items: SidebarNavItem[];
  /**
   * Allow the sidebar to collapse to an icon-only rail.
   * @default false
   */
  collapsible?: boolean;
  /**
   * Controlled collapsed state. Use with `onCollapsedChange`.
   */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Header slot (logo area) */
  header?: ReactNode;
  /** Footer slot (user info / sign-out area) */
  footer?: ReactNode;
  className?: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SidebarCtxValue {
  collapsed: boolean;
}

const SidebarCtx = createContext<SidebarCtxValue>({ collapsed: false });

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  depth = 0,
}: {
  item: SidebarNavItem;
  depth?: number;
}) {
  const { collapsed } = useContext(SidebarCtx);
  const hasChildren = !!item.children?.length;
  const [open, setOpen] = useState(
    // Auto-expand if any child is active
    () => !!item.children?.some((c) => c.active)
  );

  const handleToggle = useCallback(() => {
    if (!hasChildren) return;
    setOpen((v) => !v);
  }, [hasChildren]);

  const indentPadding = depth === 0 ? "pl-3" : depth === 1 ? "pl-8" : "pl-12";

  const baseItemClass = [
    "group flex w-full items-center gap-3 rounded-md py-2 pr-3 text-sm font-medium transition-colors",
    indentPadding,
    item.active
      ? "bg-primary-50 text-primary-700"
      : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900",
    item.disabled ? "pointer-events-none opacity-50" : "",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {/* Icon */}
      {item.icon && (
        <span
          className={[
            "shrink-0 w-5 h-5 transition-colors",
            item.active ? "text-primary-600" : "text-secondary-400 group-hover:text-secondary-600",
          ].join(" ")}
          aria-hidden="true"
        >
          {item.icon}
        </span>
      )}

      {/* Label + badge (hidden when collapsed at depth 0) */}
      {!(collapsed && depth === 0) && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="shrink-0 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRightIcon
              className={[
                "w-4 h-4 shrink-0 text-secondary-400 transition-transform duration-150",
                open ? "rotate-90" : "",
              ].join(" ")}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </>
  );

  return (
    <li>
      {item.href && !hasChildren ? (
        <a href={item.href} className={baseItemClass} aria-current={item.active ? "page" : undefined}>
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={hasChildren ? handleToggle : undefined}
          disabled={item.disabled}
          aria-expanded={hasChildren ? open : undefined}
          className={baseItemClass}
        >
          {content}
        </button>
      )}

      {/* Children */}
      {hasChildren && !collapsed && open && (
        <ul role="list" className="mt-0.5 flex flex-col gap-0.5">
          {item.children!.map((child) => (
            <NavItem key={child.value} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Sidebar component ────────────────────────────────────────────────────────

/**
 * Sidebar — collapsible vertical navigation with nested menu items.
 *
 * ```tsx
 * <Sidebar
 *   collapsible
 *   header={<Logo />}
 *   items={[
 *     { value: "dashboard", label: "Dashboard", href: "/admin", icon: <HomeIcon className="w-5 h-5" />, active: true },
 *     {
 *       value: "products", label: "Products", icon: <CubeIcon className="w-5 h-5" />,
 *       children: [
 *         { value: "all-products", label: "All Products", href: "/admin/products" },
 *         { value: "categories",   label: "Categories",   href: "/admin/categories" },
 *       ],
 *     },
 *   ]}
 *   footer={<UserInfo />}
 * />
 * ```
 */
export function Sidebar({
  items,
  collapsible = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  header,
  footer,
  className = "",
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = useCallback(() => {
    const next = !collapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [collapsed, isControlled, onCollapsedChange]);

  return (
    <SidebarCtx.Provider value={{ collapsed }}>
      <aside
        className={[
          "flex flex-col border-r border-secondary-200 bg-white transition-all duration-200",
          collapsed ? "w-16" : "w-64",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}
        {(header || collapsible) && (
          <div
            className={[
              "flex shrink-0 items-center border-b border-secondary-200 px-3 py-4",
              collapsed ? "justify-center" : "justify-between",
            ].join(" ")}
          >
            {!collapsed && header && (
              <div className="min-w-0 flex-1">{header}</div>
            )}
            {collapsible && (
              <button
                type="button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={toggleCollapse}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {collapsed ? (
                  <Bars3Icon className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto px-2 py-3">
          <ul role="list" className="flex flex-col gap-0.5">
            {items.map((item) => (
              <NavItem key={item.value} item={item} depth={0} />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {footer && !collapsed && (
          <div className="shrink-0 border-t border-secondary-200 p-3">
            {footer}
          </div>
        )}
      </aside>
    </SidebarCtx.Provider>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name               Type               Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * items              SidebarNavItem[]   required Navigation tree
 * collapsible        boolean            false    Show collapse toggle button
 * collapsed          boolean            —        Controlled collapsed state
 * onCollapsedChange  (v: boolean)=>void —        Callback when collapsed changes
 * header             ReactNode          —        Logo/branding slot
 * footer             ReactNode          —        User info / sign-out slot
 * className          string             ""       Extra classes on <aside>
 *
 * ─── SidebarNavItem ───────────────────────────────────────────────────────────
 *
 * Name      Type               Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * value     string             yes       Unique identifier
 * label     string             yes       Display label
 * href      string             no        Link URL (omit for group toggles)
 * icon      ReactNode          no        Heroicon or custom icon
 * active    boolean            no        Highlight as current page
 * children  SidebarNavItem[]   no        Nested items (creates expandable group)
 * disabled  boolean            no        Prevent interaction
 * badge     ReactNode          no        Small badge label (count, "New", etc.)
 */

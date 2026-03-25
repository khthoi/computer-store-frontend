"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavLink {
  href: string;
  label: string;
  /** Marks this link as the currently active route */
  active?: boolean;
}

export interface NavUser {
  name: string;
  email?: string;
  /** URL for the user's avatar image */
  avatarSrc?: string;
}

export interface NavUserMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Renders the item in a destructive red style (e.g. "Sign out") */
  isDanger?: boolean;
}

export interface NavbarProps {
  /** Logo rendered in the top-left */
  logo: ReactNode;
  /** Primary navigation links */
  links?: NavLink[];
  /** Cart item count badge. 0 or undefined hides the badge. */
  cartCount?: number;
  onCartClick?: () => void;
  /** Authenticated user. Null/undefined shows a Sign In link. */
  user?: NavUser | null;
  /** Dropdown items shown under the user menu */
  userMenuItems?: NavUserMenuItem[];
  /**
   * Optional search bar slot rendered between nav links and actions.
   * Pass a <SearchBar /> instance here.
   */
  searchSlot?: ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Navbar — top navigation bar for the customer storefront.
 *
 * ```tsx
 * <Navbar
 *   logo={<Logo />}
 *   links={[
 *     { href: "/", label: "Home", active: true },
 *     { href: "/products", label: "Products" },
 *     { href: "/build-pc", label: "Build PC" },
 *   ]}
 *   cartCount={3}
 *   onCartClick={() => setCartOpen(true)}
 *   user={currentUser}
 *   userMenuItems={[
 *     { label: "My Orders", href: "/orders" },
 *     { label: "Account Settings", href: "/account" },
 *     { label: "Sign Out", onClick: signOut, isDanger: true },
 *   ]}
 *   searchSlot={<SearchBar ... />}
 * />
 * ```
 */
export function Navbar({
  logo,
  links = [],
  cartCount,
  onCartClick,
  user,
  userMenuItems = [],
  searchSlot,
  className = "",
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuPosition, setUserMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate user menu dropdown position
  useEffect(() => {
    if (!userMenuOpen || !userMenuRef.current) {
      setUserMenuPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = userMenuRef.current?.getBoundingClientRect();
      if (rect) {
        setUserMenuPosition({
          top: rect.bottom + 8, // mt-2 = 8px gap
          right: window.innerWidth - rect.right,
        });
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(updatePosition);

    // Update position on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [userMenuOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !userMenuRef.current?.contains(target) &&
        !userMenuDropdownRef.current?.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const toggleMobile = useCallback(
    () => setMobileOpen((v) => !v),
    []
  );

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, []);

  const hasCart = cartCount !== undefined && cartCount >= 0;
  const showBadge = hasCart && cartCount > 0;

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full border-b border-secondary-200 bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <div className="shrink-0">{logo}</div>

        {/* ── Desktop nav links ── */}
        {links.length > 0 && (
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={[
                  "rounded px-3 py-2 text-sm font-medium transition-colors",
                  link.active
                    ? "bg-primary-50 text-primary-700"
                    : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900",
                ].join(" ")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* ── Search slot (center/flex-1) ── */}
        {searchSlot && (
          <div className="hidden flex-1 md:flex justify-center max-w-sm mx-auto">
            {searchSlot}
          </div>
        )}

        {/* ── Spacer when no search ── */}
        {!searchSlot && <div className="flex-1" />}

        {/* ── Actions: cart + user ── */}
        <div className="flex items-center gap-2">

          {/* Cart button */}
          {hasCart && (
            <button
              type="button"
              aria-label={`Shopping cart${showBadge ? `, ${cartCount} items` : ""}`}
              onClick={onCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {showBadge && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          )}

          {/* User menu */}
          <div ref={userMenuRef} className="relative hidden md:block">
            {user ? (
              <>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {user.avatarSrc ? (
                    <img
                      src={user.avatarSrc}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-6 h-6 text-secondary-400" />
                  )}
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-secondary-400 transition-transform duration-150 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User dropdown - rendered via portal */}
                {userMenuOpen &&
                  userMenuPosition &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      ref={userMenuDropdownRef}
                      role="menu"
                      aria-label="User menu"
                      className="fixed z-[9999] min-w-[180px] rounded-md border border-secondary-200 bg-white py-1 shadow-lg"
                      style={{
                        top: `${userMenuPosition.top}px`,
                        right: `${userMenuPosition.right}px`,
                      }}
                    >
                      {/* User info header */}
                      <div className="border-b border-secondary-100 px-4 py-2">
                        <p className="text-sm font-medium text-secondary-900 truncate">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-secondary-500 truncate">{user.email}</p>
                        )}
                      </div>

                      {userMenuItems.map((item, i) => (
                        <div key={i} role="menuitem">
                          {item.href ? (
                            <a
                              href={item.href}
                              onClick={closeAll}
                              className={[
                                "block px-4 py-2 text-sm transition-colors hover:bg-secondary-50",
                                item.isDanger
                                  ? "text-error-600 hover:bg-error-50"
                                  : "text-secondary-700",
                              ].join(" ")}
                            >
                              {item.label}
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                item.onClick?.();
                                closeAll();
                              }}
                              className={[
                                "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-secondary-50",
                                item.isDanger
                                  ? "text-error-600 hover:bg-error-50"
                                  : "text-secondary-700",
                              ].join(" ")}
                            >
                              {item.label}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>,
                    document.body
                  )}
              </>
            ) : (
              <a
                href="/auth/login"
                className="rounded px-3 py-2 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-secondary-900"
              >
                Sign In
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={toggleMobile}
            className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-600 transition-colors hover:bg-secondary-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {mobileOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-secondary-200 bg-white px-4 pb-4 pt-2 md:hidden"
        >
          {/* Mobile search */}
          {searchSlot && <div className="mb-3">{searchSlot}</div>}

          {/* Mobile nav links */}
          {links.length > 0 && (
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  onClick={closeAll}
                  className={[
                    "rounded px-3 py-2.5 text-sm font-medium transition-colors",
                    link.active
                      ? "bg-primary-50 text-primary-700"
                      : "text-secondary-700 hover:bg-secondary-100",
                  ].join(" ")}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Mobile user section */}
          {user ? (
            <div className="mt-3 border-t border-secondary-100 pt-3">
              <div className="mb-2 flex items-center gap-3 px-3">
                {user.avatarSrc ? (
                  <img
                    src={user.avatarSrc}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-secondary-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-secondary-900">{user.name}</p>
                  {user.email && (
                    <p className="truncate text-xs text-secondary-500">{user.email}</p>
                  )}
                </div>
              </div>
              {userMenuItems.map((item, i) => (
                <div key={i}>
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={closeAll}
                      className={[
                        "block rounded px-3 py-2 text-sm transition-colors",
                        item.isDanger
                          ? "text-error-600 hover:bg-error-50"
                          : "text-secondary-700 hover:bg-secondary-100",
                      ].join(" ")}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        item.onClick?.();
                        closeAll();
                      }}
                      className={[
                        "w-full rounded px-3 py-2 text-left text-sm transition-colors",
                        item.isDanger
                          ? "text-error-600 hover:bg-error-50"
                          : "text-secondary-700 hover:bg-secondary-100",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 border-t border-secondary-100 pt-3">
              <a
                href="/auth/login"
                className="block rounded px-3 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name           Type                Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * logo           ReactNode           required Logo in the top-left
 * links          NavLink[]           []       Primary nav links
 * cartCount      number              —        Cart badge count (0 = visible, no badge)
 * onCartClick    () => void          —        Cart button click handler
 * user           NavUser | null      —        Auth state; null shows Sign In
 * userMenuItems  NavUserMenuItem[]   []       Dropdown items for the user menu
 * searchSlot     ReactNode           —        Search bar component slot
 * className      string              ""       Extra classes on <header>
 */

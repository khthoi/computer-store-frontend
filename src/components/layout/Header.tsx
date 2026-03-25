"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bars3Icon,
  ChevronDownIcon,
  CpuChipIcon,
  HeartIcon,
  PhoneIcon,
  ArrowsRightLeftIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { SearchBar } from "@/src/components/search/SearchBar";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";
import { Drawer } from "@/src/components/ui";
import { SidebarMegaMenu } from "@/src/components/navigation";
import { STORE_MEGA_MENU } from "@/src/navigation/megamenu.config";
import { Navbar } from "./Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeaderUser {
  name: string;
  email?: string;
}

export interface HeaderProps {
  /** Cart item count — badge hidden when 0 */
  cartCount?: number;
  /** Wishlist item count — badge hidden when 0 */
  wishlistCount?: number;
  /** Compare item count — badge hidden when 0 */
  compareCount?: number;
  /** Authenticated user; null/undefined shows Sign In link */
  user?: HeaderUser | null;
  /** Called when the user clicks "Đăng xuất" in the user menu */
  onLogout?: () => void;
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

const ANNOUNCEMENTS = [
  "Miễn phí giao hàng toàn quốc cho đơn từ 500k",
  "🔥 Flash Sale GPU — Giảm đến 20% hôm nay",
  "Bảo hành chính hãng 24 tháng — Đổi trả 30 ngày",
];

function TopBar() {
  return (
    <div className="bg-primary-600 text-white">
      <div className="mx-auto flex h-8 max-w-[1450px] items-center justify-between gap-4 px-4">
        {/* Left: Announcement */}
        <div className="flex min-w-0 items-center gap-2 overflow-hidden text-xs">
          <TruckIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:block truncate">{ANNOUNCEMENTS[0]}</span>
          <span className="sm:hidden text-[11px]">Freeship đơn từ 500k</span>
          <span className="hidden sm:inline mx-1 text-primary-400" aria-hidden="true">|</span>
          <span className="hidden md:block font-medium text-yellow-300 truncate">
            {ANNOUNCEMENTS[1]}
          </span>
        </div>

        {/* Right: Quick links */}
        <nav aria-label="Top bar links" className="flex shrink-0 items-center gap-2 text-xs">
          <a
            href="/support"
            className="hidden sm:flex items-center gap-1 text-primary-100 hover:text-white transition-colors"
          >
            <PhoneIcon className="w-3 h-3" aria-hidden="true" />
            Hỗ trợ khách hàng
          </a>
          <span className="hidden sm:inline text-primary-400" aria-hidden="true">|</span>
          <a
            href="/orders/track"
            className="hidden sm:inline text-primary-100 hover:text-white transition-colors"
          >
            Đơn hàng của tôi
          </a>
          <span className="text-primary-400" aria-hidden="true">|</span>
          <a href="/login" className="text-primary-100 hover:text-white transition-colors">Đăng nhập</a>
          <span className="text-primary-400" aria-hidden="true">/</span>
          <a href="/register" className="text-primary-100 hover:text-white transition-colors">Đăng ký</a>
        </nav>
      </div>
    </div>
  );
}


// ─── SocialIcons ──────────────────────────────────────────────────────────────
// Inline SVG icons — same paths as Footer.tsx but used here without exporting.

function FacebookSvg({ className }: { className?: string }) {
  return (
    <FaFacebookF className={className} />
  );
}

function TikTokSvg({ className }: { className?: string }) {
  return (
    <FaTiktok className={className} />
  );
}

function YouTubeSvg({ className }: { className?: string }) {
  return (
    <FaYoutube className={className} />
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookSvg, hoverClass: "hover:text-blue-600 hover:border-blue-200" },
  { label: "TikTok", href: "https://tiktok.com", Icon: TikTokSvg, hoverClass: "hover:text-secondary-900 hover:border-secondary-400" },
  { label: "YouTube", href: "https://youtube.com", Icon: YouTubeSvg, hoverClass: "hover:text-red-600 hover:border-red-200" },
] as const;

function SocialIcons() {
  return (
    <div
      className="hidden lg:flex shrink-0 items-center gap-2"
      aria-label="Mạng xã hội"
    >
      {SOCIAL_LINKS.map(({ label, href, Icon, hoverClass }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full border border-secondary-200 text-secondary-400 transition-colors",
            hoverClass,
          ].join(" ")}
        >
          <Icon className="w-3.5 h-3.5" />
        </a>
      ))}
    </div>
  );
}

// ─── ActionIcons ──────────────────────────────────────────────────────────────

function ActionIcons({
  cartCount = 0,
  wishlistCount = 0,
  user = null,
  compareCount = 0,
  compact = false,
  onLogout,
}: Pick<HeaderProps, "cartCount" | "wishlistCount" | "compareCount" | "user" | "onLogout"> & { compact?: boolean }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const firstName = user?.name.split(" ").pop() ?? "";

  return (
    <div
      className="flex shrink-0 items-center gap-5"
      role="toolbar"
      aria-label="Công cụ và tài khoản"
    >
      {/* Build PC — always visible; critical CTA */}
      <Link
        href="/build-pc"
        className="hidden md:flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 shrink-0"
      >
        <CpuChipIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        Build PC
      </Link>

      {/* So sánh — visible in both normal and compact */}
      <Link
        href="/compare"
        aria-label={`So sánh sản phẩm${compareCount > 0 ? `, ${compareCount} sản phẩm` : ""}`}
        className="hidden md:flex flex-col items-center gap-0.5 text-secondary-500 transition-colors hover:text-primary-600"
      >
        {/* relative wraps the icon only — badge is positioned against the icon,
            not the full link (icon + label), so all badges land identically */}
        <div className="relative">
          <ArrowsRightLeftIcon className="w-5 h-5" />
          {compareCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-white"
            >
              {compareCount > 9 ? "9+" : compareCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium leading-none">So sánh</span>
      </Link>

      {/* Wishlist — visible in both normal and compact */}
      <Link
        href="/wishlist"
        aria-label={`Danh sách yêu thích${wishlistCount > 0 ? `, ${wishlistCount} sản phẩm` : ""}`}
        className="hidden md:flex flex-col items-center gap-0.5 text-secondary-500 transition-colors hover:text-primary-600"
      >
        <div className="relative">
          <HeartIcon className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[9px] font-bold text-white"
            >
              {wishlistCount > 9 ? "9+" : wishlistCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium leading-none">Yêu thích</span>
      </Link>

      {/* Account — always visible; critical action */}
      {user ? (
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label={`Tài khoản: ${user.name}`}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            className="flex flex-col items-center gap-0.5 text-secondary-500 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none max-w-[56px] truncate">
              {firstName}
            </span>
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <>
              {/* Click-outside overlay */}
              <div
                className="fixed inset-0 z-10"
                aria-hidden="true"
                onClick={() => setUserMenuOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg"
              >
                <div className="border-b border-secondary-100 px-4 py-2">
                  <p className="text-sm font-semibold text-secondary-800 truncate">{user.name}</p>
                  {user.email && (
                    <p className="text-xs text-secondary-400 truncate">{user.email}</p>
                  )}
                </div>
                <Link
                  href="/account/profile"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                >
                  Tài khoản của tôi
                </Link>
                <Link
                  href="/account/orders"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600"
                >
                  Đơn hàng
                </Link>
                <div className="border-t border-secondary-100 mt-1 pt-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setUserMenuOpen(false); onLogout?.(); }}
                    className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 hover:text-error-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          aria-label="Đăng nhập"
          className="hidden sm:flex flex-col items-center gap-0.5 text-secondary-500 transition-colors hover:text-primary-600"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none max-w-[56px] truncate">
            Tài khoản
          </span>
        </Link>
      )}

      {/* Cart — always visible */}
      <Link
        href="/cart"
        aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} sản phẩm` : ""}`}
        className="hidden md:flex flex-col items-center gap-0.5 text-secondary-500 transition-colors hover:text-primary-600"
      >
        <div className="relative">
          <ShoppingCartIcon className="w-5 h-5" />
          {cartCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[9px] font-bold text-white"
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium leading-none">Giỏ hàng</span>
      </Link>
    </div>
  );
}

// ─── CompactCategoryTrigger ───────────────────────────────────────────────────
// Renders only the trigger button + mobile drawer.
// Desktop dropdown state and panel are owned by Header (see below) so the panel
// can be anchored to the full container width — identical to Navbar.tsx.

interface CompactCategoryTriggerProps {
  megaOpen: boolean;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onToggle: () => void;
}

function CompactCategoryTrigger({
  megaOpen,
  onTriggerEnter,
  onTriggerLeave,
  onToggle,
}: CompactCategoryTriggerProps) {
  // Mobile drawer state stays local — independent of the desktop panel width.
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ── Mobile: open drawer ── */}
      <button
        type="button"
        aria-label="Mở danh mục sản phẩm"
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-700 rounded-md border border-secondary-200 bg-white hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 shrink-0"
      >
        <Bars3Icon className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* ── Desktop: trigger button only — panel rendered at container level ── */}
      <div
        className="hidden lg:block shrink-0"
        onMouseEnter={onTriggerEnter}
        onMouseLeave={onTriggerLeave}
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={megaOpen}
          onClick={onToggle}
          className={[
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
            megaOpen
              ? "border-primary-300 text-primary-600"
              : "border-secondary-200 text-secondary-700 hover:text-primary-600",
          ].join(" ")}
        >
          <Bars3Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
          Danh mục
          <ChevronDownIcon
            className={[
              "w-3.5 h-3.5 shrink-0 transition-transform duration-150",
              megaOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
        size="md"
        title="Danh mục sản phẩm"
      >
        <div className="h-full overflow-hidden -mx-4 -mt-2">
          <SidebarMegaMenu
            categories={STORE_MEGA_MENU}
            defaultActiveId="laptop-gaming"
            height={680}
            className="rounded-none border-0 shadow-none w-full"
          />
        </div>
      </Drawer>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

/**
 * Header — full sticky site header for the customer storefront.
 *
 * Scroll behavior:
 *  - Before scroll (< 80px): TopBar + full MainHeader (h-16) + Navbar
 *  - After scroll (≥ 80px):  Compact MainHeader only (h-14) with category
 *    trigger replacing Navbar; TopBar, social icons, and most action icons hidden.
 *
 * Full layout zones:
 *  1. TopBar       — thin announcement strip (bg-primary-600)
 *  2. MainHeader   — [Logo] | [Search] | [Social Icons] | [Build PC + Icons]
 *  3. Navbar       — category bar with mega menu
 *
 * Compact layout:
 *  2. MainHeader   — [☰ Danh mục] [Logo] | [Search] | [Cart]
 */
// ── Scroll thresholds ──────────────────────────────────────────────────────────
// Two separate values create a hysteresis band that prevents rapid toggling
// when the user hovers near the collapse point.
//
//   Scrolling DOWN: collapse when window.scrollY crosses SCROLL_COMPACT  (140 px)
//   Scrolling UP:   restore  when window.scrollY drops below SCROLL_RESTORE (80 px)
//
// This means the header only changes state once the user moves clearly in one
// direction, not when they drift back and forth near the threshold.
const SCROLL_COMPACT = 200; // px → switch to compact
const SCROLL_RESTORE = 120; // px → switch back to full

export function Header({ cartCount = 0, wishlistCount = 0, compareCount = 0, user = null, onLogout }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number>(0);

  // ── Compact mega-menu state ──────────────────────────────────────────────────
  // Owned here (not inside CompactCategoryTrigger) so the panel can be rendered
  // as a sibling of the three layout zones, anchored to the container's full
  // left-0 right-0 width — identical positioning logic to Navbar.tsx.
  const [compactMegaOpen, setCompactMegaOpen] = useState(false);
  const compactCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openCompactMega() {
    if (compactCloseTimer.current) clearTimeout(compactCloseTimer.current);
    setCompactMegaOpen(true);
  }
  function closeCompactMegaDelayed() {
    compactCloseTimer.current = setTimeout(() => setCompactMegaOpen(false), 180);
  }

  useEffect(() => {
    // Sync on mount so a page reload while already scrolled shows the right state.
    setScrolled(window.scrollY > SCROLL_COMPACT);

    function onScroll() {
      // rAF coalesces burst scroll events into one state update per frame.
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        // Hysteresis: only flip state when crossing the appropriate threshold
        // in the correct direction — prevents toggling near the boundary.
        setScrolled((prev) => {
          if (!prev && y > SCROLL_COMPACT) return true;
          if (prev && y < SCROLL_RESTORE) return false;
          return prev; // no change — avoid re-render
        });
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Close compact mega menu when leaving compact mode (scrolling back to top).
  useEffect(() => {
    if (!scrolled) setCompactMegaOpen(false);
  }, [scrolled]);

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* 1 — TopBar: hidden when compact */}
      {!scrolled && <TopBar />}

      {/* 2 — Main header */}
      <div className="bg-white border-b border-secondary-200 shadow-sm">
        {/*
         * `relative` makes this container the positioning anchor for the compact
         * mega-menu panel below, matching exactly the technique used in Navbar.tsx.
         * Both dropdowns now use identical left-0 right-0 top-full logic.
         */}
        <div
          className={[
            "mx-auto flex max-w-[1450px] items-center justify-between gap-4 px-4 transition-all duration-300 ease-in-out relative",
            scrolled ? "h-14" : "h-16",
          ].join(" ")}
        >

          {/* ── Left zone: [Compact trigger?] + Logo ── */}
          <div className="flex shrink-0 items-center gap-3">
            {scrolled && (
              <CompactCategoryTrigger
                megaOpen={compactMegaOpen}
                onTriggerEnter={openCompactMega}
                onTriggerLeave={closeCompactMegaDelayed}
                onToggle={() => setCompactMegaOpen((v) => !v)}
              />
            )}

            <Link
              href="/"
              aria-label="TechStore — Trang chủ"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              <div
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-extrabold tracking-tight"
              >
                PC
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-base font-extrabold tracking-tight text-secondary-900">
                  Tech<span className="text-primary-600">Store</span>
                </p>
                {!scrolled && (
                  <p className="text-[10px] text-secondary-500 leading-none">
                    Linh kiện chính hãng
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* ── Center zone: Search ── */}
          <div className="flex flex-1 justify-center px-2">
            <SearchBar size="default" />
          </div>

          {/* ── Right zone: Social icons + separator + Action icons ── */}
          <div className="flex shrink-0 items-center gap-4">
            {!scrolled && (
              <>
                <SocialIcons />
                <div className="hidden lg:block h-8 w-px bg-secondary-200 shrink-0" aria-hidden="true" />
              </>
            )}
            <ActionIcons
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              compareCount={compareCount}
              user={user}
              compact={scrolled}
              onLogout={onLogout}
            />
          </div>

          {/* ── Compact mega-menu panel — full container width ── */}
          {/*
           * Sibling of the three layout zones, anchored to the `relative` container.
           * `left-0 right-0` gives it exactly the same width as the navbar dropdown.
           * `pt-2` is an invisible hover-bridge: the mouse enters the padding area
           * (which fires onMouseEnter) before reaching the visible panel, so the
           * 180ms close timer is cancelled and the menu stays open.
           */}
          {scrolled && compactMegaOpen && (
            <div
              role="region"
              aria-label="Tất cả danh mục sản phẩm"
              className="absolute left-0 right-0 top-full z-[200] pt-2"
              onMouseEnter={openCompactMega}
              onMouseLeave={closeCompactMegaDelayed}
            >
              <SidebarMegaMenu
                categories={STORE_MEGA_MENU}
                defaultActiveId="laptop-gaming"
                className="w-full shadow-2xl border-secondary-200"
              />
            </div>
          )}

        </div>
      </div>

      {/* 3 — Navbar: hidden when compact */}
      {!scrolled && <Navbar />}

    </header>
  );
}

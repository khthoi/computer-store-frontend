"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  ChevronDownIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import { Drawer } from "@/src/components/ui";
import { SidebarMegaMenu } from "@/src/components/navigation";
import { STORE_MEGA_MENU } from "@/src/navigation/megamenu.config";

// ─── Nav link definitions ─────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
  badge?: string;
  highlight?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Laptop", href: "/products/laptop" },
  { label: "PC Gaming", href: "/products/pc-gaming" },
  { label: "CPU", href: "/products/cpu" },
  { label: "GPU", href: "/products/gpu" },
  { label: "RAM", href: "/products/ram" },
  { label: "SSD", href: "/products/ssd" },
  { label: "PSU", href: "/products/psu" },
  { label: "Mainboard", href: "/products/mainboard" },
  { label: "Màn Hình", href: "/products/man-hinh" },
  { label: "Gaming Gear", href: "/products/gaming-gear" },
  { label: "Linh Kiện", href: "/products/linh-kien" },
  { label: "Phụ Kiện", href: "/products/phu-kien" },
  { label: "Khuyến Mãi", href: "/khuyen-mai", badge: "Hot!", highlight: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Navbar — category navigation bar.
 *
 * Desktop: dark bar with "Tất cả danh mục" mega-menu trigger + quick-access links.
 * Mobile/Tablet: hamburger button opens a left-side Drawer containing the full SidebarMegaMenu.
 */
export function Navbar() {
  const pathname = usePathname();

  // Desktop mega menu hover state
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }

  function closeMegaDelayed() {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 180);
  }

  return (
    <>
      {/* ── Nav bar ── */}
      <nav
        aria-label="Category navigation"
        className="bg-white border-b border-secondary-200"
      >
        {/*
         * `relative` on this container is the positioning anchor for the mega menu panel.
         * The panel uses `left-0 right-0` to fill the exact same width as this container,
         * matching the header layout precisely.
         */}
        <div className="mx-auto max-w-[1400px] px-4 relative">

          {/* ── Nav row ── */}
          <div className="flex h-12 items-center gap-0">

            {/* ── Mobile / Tablet: Hamburger ── */}
            <button
              type="button"
              aria-label="Mở danh mục sản phẩm"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-700 rounded-md border border-secondary-200 bg-white hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Bars3Icon className="w-4 h-4" aria-hidden="true" />
              <span>Danh mục</span>
            </button>

            {/* ── Desktop: Tất cả danh mục trigger ── */}
            {/*
             * No longer `relative` — the dropdown is now positioned relative to the
             * container above, not this wrapper. Hover handlers remain here and on
             * the panel; the 180ms close delay bridges any gap between them.
             */}
            <div
              className="hidden lg:block shrink-0"
              onMouseEnter={openMega}
              onMouseLeave={closeMegaDelayed}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={megaOpen}
                onClick={() => setMegaOpen((v) => !v)}
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

            {/* Vertical separator */}
            <div
              className="hidden lg:block mx-4 h-5 w-px bg-secondary-200 shrink-0"
              aria-hidden="true"
            />

            {/* ── Desktop: Quick-access links ── */}
            <div className="hidden lg:flex flex-1 items-center gap-6">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative flex items-center gap-1 text-sm font-medium tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:rounded-sm",
                      isActive
                        ? "text-primary-600 after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:bg-primary-600"
                        : link.highlight
                          ? "text-primary-600 hover:text-primary-700"
                          : "text-secondary-600 hover:text-primary-600",
                    ].join(" ")}
                  >
                    {link.highlight && (
                      <TagIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    {link.label}
                    {link.badge && (
                      <span className="ml-0.5 inline-flex items-center rounded bg-error-500 px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Flash sale callout — far right */}
            <div className="ml-auto hidden xl:flex items-center gap-1.5 shrink-0">
              <SparklesIcon className="w-4 h-4 text-warning-600" aria-hidden="true" />
              <span className="text-xs font-semibold text-warning-600">
                Flash Sale hôm nay
              </span>
            </div>
          </div>

          {/* ── Mega menu panel — full container width ── */}
          {/*
           * Positioned absolute relative to the container div above (which is `relative`).
           * `left-0 right-0` pins both edges to the container, making the panel exactly
           * as wide as the navbar content area — no fixed pixel width needed.
           * `pt-2` creates an invisible hover-bridge so the mouse can travel from the
           * trigger button into the panel without triggering the close timer.
           */}
          {megaOpen && (
            <div
              role="region"
              aria-label="Tất cả danh mục sản phẩm"
              className="absolute left-0 right-0 top-full z-[200] pt-2"
              onMouseEnter={openMega}
              onMouseLeave={closeMegaDelayed}
            >
              <SidebarMegaMenu
                categories={STORE_MEGA_MENU}
                defaultActiveId="laptop-gaming"
                className="w-full shadow-2xl border-secondary-200"
              />
            </div>
          )}

        </div>
      </nav>

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

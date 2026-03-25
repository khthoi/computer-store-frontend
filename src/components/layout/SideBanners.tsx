"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SideBanner } from "@/src/components/ui/SideBanner";

// ─── Config ───────────────────────────────────────────────────────────────────

const BANNER_TOP = 160; // normal distance from viewport top (px)
const FOOTER_GAP = 24;  // minimum gap between banner bottom and footer top (px)

const LEFT_BANNER = {
  image: "/side-banner/side-banner1.jpg",
  alt: "Khuyến mãi đặc biệt",
  href: "/promotions",
};

const RIGHT_BANNER = {
  image: "/side-banner/side-banner2.jpg",
  alt: "PC Gaming Sale",
  href: "/products/pc-gaming",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SideBanners — fixed vertical promotional banners that avoid the footer.
 *
 * Positioning strategy
 * --------------------
 * `position: fixed` keeps the banners visible during scrolling.
 * A rAF-batched scroll listener reads the footer's viewport position on every
 * frame and clamps the banner's `top` so its bottom never overlaps the footer:
 *
 *   normal:   top = BANNER_TOP (160 px)
 *   clamped:  top = footerTop − bannerHeight − FOOTER_GAP
 *
 * The clamp only kicks in when the footer enters the viewport, so the banner
 * glides up smoothly instead of snapping behind the footer.
 */
export function SideBanners() {
  const pathname = usePathname();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Grab the <footer> element once; it doesn't change during the session.
    const footer = document.querySelector("footer");

    function update() {
      cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const left = leftRef.current;
        const right = rightRef.current;

        if (!left || !right) return;

        let top = BANNER_TOP;

        if (footer) {
          const footerTop = footer.getBoundingClientRect().top;
          const bannerHeight = left.offsetHeight;

          const bannerBottom = BANNER_TOP + bannerHeight;
          const collisionPoint = bannerBottom + FOOTER_GAP;

          if (footerTop <= collisionPoint) {
            top = footerTop - bannerHeight - FOOTER_GAP;
          }
        }

        left.style.top = `${top}px`;
        right.style.top = `${top}px`;
      });
    }

    // Sync on mount (handles initial scroll position after a page reload).
    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (pathname.startsWith("/account")) return null;

  const colCls =
    "pointer-events-none fixed z-30 hidden 2xl:block";

  return (
    <>
      {/* Left banner */}
      <div
        ref={leftRef}
        aria-hidden="true"
        className={`${colCls} left-6`}
        style={{ top: BANNER_TOP }}
      >
        <div className="pointer-events-auto">
          <SideBanner
            image={LEFT_BANNER.image}
            alt={LEFT_BANNER.alt}
            href={LEFT_BANNER.href}
          />
        </div>
      </div>

      {/* Right banner */}
      <div
        ref={rightRef}
        aria-hidden="true"
        className={`${colCls} right-6`}
        style={{ top: BANNER_TOP }}
      >
        <div className="pointer-events-auto">
          <SideBanner
            image={RIGHT_BANNER.image}
            alt={RIGHT_BANNER.alt}
            href={RIGHT_BANNER.href}
          />
        </div>
      </div>
    </>
  );
}

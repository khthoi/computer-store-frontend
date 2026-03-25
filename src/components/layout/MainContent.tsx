"use client";

import { usePathname } from "next/navigation";

// Routes whose main content area should span the full viewport width,
// bypassing the 120px side-banner gutters used at 2xl+.
// Must stay in sync with SUPPRESSED_PREFIXES in SideBannersConditional.tsx —
// any route that suppresses side banners and needs a wider layout goes here.
const FULL_WIDTH_PREFIXES = ["/search"];

/**
 * MainContent — wraps <main> in the root layout and conditionally switches
 * between the normal centre-column placement and a full-width span.
 *
 * Normal pages (col-start-2):   [120px gutter] [1fr main] [120px gutter]
 * Full-width pages (col-span-3): [────────────────1fr main────────────────]
 *
 * The grid is only active at 2xl+; below that breakpoint the div is not a
 * grid container so both classes are no-ops and content is naturally full-width.
 */
export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = FULL_WIDTH_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <main
      id="main-content"
      className={`min-h-[calc(100vh-theme(spacing.40))] min-w-0 ${
        isFullWidth ? "2xl:col-span-3 mx-3" : "2xl:col-start-2"
      }`}
    >
      {children}
    </main>
  );
}

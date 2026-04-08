"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminBreadcrumbProps {
  items?: BreadcrumbItem[];
  variant?: "default" | "inverse";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a URL segment (possibly kebab-case) to Title Case */
function segmentToLabel(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Route-group segments to skip (Next.js App Router convention) */
const SKIP_SEGMENTS = new Set(["(dashboard)", "(auth)", "(admin)"]);

/**
 * Override the href for specific accumulated paths.
 * Needed when a URL segment doesn't have a standalone page
 * (e.g. /promotions/earn-rules redirects to /promotions?tab=earn-rules).
 */
const PATH_HREF_OVERRIDES: Record<string, string> = {
  "/promotions/earn-rules": "/promotions?tab=earn-rules",
};

function deriveItems(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const result: BreadcrumbItem[] = [];
  let accumulated = "";

  for (const part of parts) {
    // Skip Next.js route group segments like (dashboard)
    if (SKIP_SEGMENTS.has(part) || (part.startsWith("(") && part.endsWith(")"))) {
      continue;
    }
    accumulated += `/${part}`;
    result.push({
      label: segmentToLabel(part),
      href: PATH_HREF_OVERRIDES[accumulated] ?? accumulated,
    });
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminBreadcrumb — auto-derives breadcrumb from the current pathname,
 * or accepts explicit `items` for override.
 *
 * ```tsx
 * // Auto-derive
 * <AdminBreadcrumb />
 *
 * // Explicit items
 * <AdminBreadcrumb items={[{ label: "Products", href: "/admin/products" }, { label: "Edit" }]} />
 *
 * // Inverse (white text for dark header backgrounds)
 * <AdminBreadcrumb variant="inverse" />
 * ```
 */
export function AdminBreadcrumb({
  items,
  variant = "default",
}: AdminBreadcrumbProps) {
  const pathname = usePathname();
  const allItems = items ?? deriveItems(pathname);

  const isInverse = variant === "inverse";

  // On mobile (sm and below) only show the last 2 segments
  // We use CSS to hide earlier items; semantically all items remain in the DOM
  const totalItems = allItems.length;

  const ancestorClass = isInverse
    ? "text-white/70 hover:text-white hover:underline transition-colors"
    : "text-secondary-500 hover:text-secondary-700 hover:underline transition-colors";

  const currentClass = isInverse
    ? "text-white font-semibold"
    : "text-secondary-800 font-medium";

  const separatorClass = isInverse
    ? "text-white/50"
    : "text-secondary-400";

  const navClass = isInverse
    ? "text-sm text-white/70"
    : "text-sm text-secondary-500";

  return (
    <nav aria-label="Breadcrumb" className={navClass}>
      <ol className="flex flex-wrap items-center gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          // On mobile, hide items that are not among the last 2
          const hideOnMobile = totalItems > 2 && index < totalItems - 2;

          return (
            <li
              key={index}
              className={[
                "flex items-center gap-1",
                hideOnMobile ? "hidden sm:flex" : "flex",
              ].join(" ")}
            >
              {/* Separator — not before the first visible item, but we always
                  render it and let CSS handle the first-child */}
              {index > 0 && (
                <ChevronRightIcon
                  className={`w-3.5 h-3.5 shrink-0 ${separatorClass}`}
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className={`truncate max-w-[160px] ${currentClass}`}
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={`truncate max-w-[160px] ${ancestorClass}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`truncate max-w-[160px] ${ancestorClass}`}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

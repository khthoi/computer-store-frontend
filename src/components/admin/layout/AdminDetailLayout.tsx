import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminDetailLayoutProps {
  children: ReactNode;
  aside: ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminDetailLayout — two-column layout for detail/edit pages.
 * Main content on the left, sidebar panel (320 px) on the right.
 * Stacks to a single column on mobile.
 *
 * Not a client component — safe to use in Server Components.
 *
 * ```tsx
 * <AdminDetailLayout aside={<ProductMetaPanel />}>
 *   <ProductForm />
 * </AdminDetailLayout>
 * ```
 */
export function AdminDetailLayout({
  children,
  aside,
  className = "",
}: AdminDetailLayoutProps) {
  return (
    <div
      className={[
        "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Main column */}
      <div className="min-w-0">{children}</div>

      {/* Right panel */}
      <aside className="flex flex-col gap-4">{aside}</aside>
    </div>
  );
}

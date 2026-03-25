"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsNavLinkProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SettingsNavLink — client sub-component that applies active styles via usePathname().
 * Must be client because usePathname() requires a client context.
 */
export function SettingsNavLink({ href, icon, children }: SettingsNavLinkProps) {
  const pathname = usePathname();

  // Exact match for the root settings page; prefix match for sub-pages
  const isActive =
    href === "/admin/settings"
      ? pathname === "/admin/settings"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-secondary-100 text-secondary-900"
          : "text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900",
      ].join(" ")}
    >
      <span
        className={[
          "shrink-0",
          isActive ? "text-primary-600" : "text-secondary-400",
        ].join(" ")}
        aria-hidden="true"
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}

"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSidebar } from "@/src/components/admin/layout/SidebarContext";
import { AdminBreadcrumb } from "@/src/components/admin/layout/AdminBreadcrumb";
import { AdminUserMenu, type AdminUser } from "@/src/components/admin/layout/AdminUserMenu";
import { NotificationBell, type AdminNotification } from "@/src/components/admin/layout/NotificationBell";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminHeaderProps {
  user: AdminUser;
  notifications: AdminNotification[];
  onSignOut: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// Re-export for consumers who import from this module
export type { AdminUser, AdminNotification };

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminHeader — sticky top bar with hamburger (mobile), breadcrumb,
 * notification bell, and user menu. Background uses bg-violet-700 per RULE 7.
 */
export function AdminHeader({
  user,
  notifications,
  onSignOut,
  onMarkRead,
  onMarkAllRead,
}: AdminHeaderProps) {
  const { toggleMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-violet-700 px-4 text-white shadow-sm">
      {/* Mobile hamburger — hidden on lg+ */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={toggleMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-violet-600/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden"
      >
        <Bars3Icon className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Breadcrumb — auto-derives from pathname */}
      <div className="flex-1 min-w-0">
        <AdminBreadcrumb variant="inverse" />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 shrink-0">
        <NotificationBell
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
        />
        <AdminUserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}

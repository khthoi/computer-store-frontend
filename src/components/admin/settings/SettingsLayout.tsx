import type { ReactNode } from "react";
import {
  Cog6ToothIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  CalculatorIcon,
  UsersIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SettingsNavLink } from "./SettingsNavLink";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/settings",
    label: "Chung",
    icon: <Cog6ToothIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/payment",
    label: "Thanh toán",
    icon: <CreditCardIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/shipping",
    label: "Vận chuyển",
    icon: <TruckIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/notifications",
    label: "Thông báo",
    icon: <BellIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/tax",
    label: "Thuế",
    icon: <CalculatorIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/staff",
    label: "Nhân viên & Phân quyền",
    icon: <UsersIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/integrations",
    label: "Tích hợp",
    icon: <PuzzlePieceIcon className="w-4 h-4" />,
  },
  {
    href: "/admin/settings/security",
    label: "Bảo mật",
    icon: <ShieldCheckIcon className="w-4 h-4" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SettingsLayout — server component providing two-column settings shell.
 * Active link detection is delegated to the client sub-component SettingsNavLink.
 */
export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-6 min-h-full">
      {/* Left nav */}
      <nav className="hidden lg:block w-56 shrink-0">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SettingsNavLink href={item.href} icon={item.icon}>
                {item.label}
              </SettingsNavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

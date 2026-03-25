"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarContextValue {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (v: boolean) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  mobileOpen: false,
  toggle: () => {},
  setCollapsed: () => {},
  toggleMobile: () => {},
  setMobileOpen: () => {},
});

const STORAGE_KEY = "admin_sidebar_collapsed";

function readStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "true";
  } catch {
    return false;
  }
}

function writeStorage(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore storage errors
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(false);
  const [mobileOpen, setMobileOpenState] = useState<boolean>(false);

  // Read persisted value after mount (client-only)
  useEffect(() => {
    setCollapsedState(readStorage());
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    writeStorage(v);
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      writeStorage(next);
      return next;
    });
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpenState((prev) => !prev);
  }, []);

  const setMobileOpen = useCallback((v: boolean) => {
    setMobileOpenState(v);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, toggle, setCollapsed, toggleMobile, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}

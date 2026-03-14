/**
 * ONLINE PC STORE — ADMIN DASHBOARD
 * Tailwind CSS v4 Design System Configuration
 *
 * ─── USAGE IN TAILWIND v4 ──────────────────────────────────────────────────
 * This file is the JS/TS reference for the design system. To activate it,
 * add the following directive at the top of your globals.css:
 *
 *   @config "./tailwind.config.ts";
 *
 * Alternatively, all tokens are defined via CSS @theme in globals.css
 * (the recommended v4 approach), which takes precedence over this file.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * ADMIN DIFFERENCES FROM STOREFRONT:
 *   - Font: DM Sans (instead of Inter) — more structured, table-friendly
 *   - Accent violet is the PRIMARY interface color (sidebar, nav, actions)
 *   - Layout: Fixed 280px sidebar + flex-1 content area
 *   - Dense information density (tighter spacing in data tables)
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    screens: {
      sm:    "640px",
      md:    "768px",
      lg:    "1024px",
      xl:    "1280px",
      "2xl": "1536px",
    },

    extend: {
      colors: {
        /**
         * PRIMARY — Brand Blue (same as storefront for cross-app consistency)
         * In admin: used for data highlights, links, secondary actions
         */
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8f",
          950: "#172554",
        },

        /**
         * SECONDARY — Slate
         * In admin: table rows, sidebar backgrounds, neutral UI chrome
         */
        secondary: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },

        /**
         * ACCENT — Violet (PRIMARY admin interface color)
         * Used for: admin nav/sidebar, admin CTAs, dashboard highlights,
         *           active menu items, admin-specific badges, feature tags
         * Example: bg-accent-600 (sidebar bg), text-accent-400 (nav icon hover)
         */
        accent: {
          50:  "#f5f3ff", // Admin sidebar hover background
          100: "#ede9fe", // Admin selected item background
          200: "#ddd6fe", // Admin active border
          300: "#c4b5fd", // Admin icon light state
          400: "#a78bfa", // Admin icon normal state
          500: "#8b5cf6", // Admin accent — stat highlights, chart colors
          600: "#7c3aed", // Admin sidebar background, primary admin CTA
          700: "#6d28d9", // Admin sidebar dark (contrast stripe)
          800: "#5b21b6", // Admin active nav item background
          900: "#4c1d95", // Admin deep dark (footer, heavy emphasis)
          950: "#2e1065", // Admin near-black accent
        },

        /**
         * SUCCESS — Green
         * Admin usage: payment success, order completed, stock available,
         *              positive KPI indicators in stats cards
         */
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },

        /**
         * WARNING — Amber
         * Admin usage: low stock threshold, pending orders, flagged reviews,
         *              expiring promotions, negative KPI indicators
         */
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        /**
         * ERROR — Red
         * Admin usage: failed payments, cancelled orders, critical alerts,
         *              destructive action confirmations, system errors
         */
        error: {
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        /**
         * INFO — Cyan
         * Admin usage: informational alerts, help tooltips, system notices,
         *              neutral status indicators, data annotations
         */
        info: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
      },

      fontFamily: {
        /**
         * sans — Admin Dashboard (DM Sans)
         * DM Sans is optimized for UI-dense interfaces — clear at small sizes,
         * excellent tabular readability, strong hierarchy without visual noise.
         * CSS var: --font-sans → set to --font-dm-sans in layout.tsx
         */
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],

        /**
         * mono — SKUs, IDs, specs, order numbers (JetBrains Mono)
         * CSS var: --font-mono → set to --font-jetbrains-mono in layout.tsx
         */
        mono: ["var(--font-mono)", "JetBrains Mono", "Menlo", "monospace"],
      },

      fontSize: {
        xs:    ["0.75rem",  { lineHeight: "1rem",    letterSpacing: "0.025em"  }],
        sm:    ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em"   }],
        base:  ["1rem",     { lineHeight: "1.5rem",  letterSpacing: "0em"      }],
        lg:    ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.005em" }],
        xl:    ["1.25rem",  { lineHeight: "1.75rem", letterSpacing: "-0.01em"  }],
        "2xl": ["1.5rem",   { lineHeight: "2rem",    letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em"  }],
        "4xl": ["2.25rem",  { lineHeight: "2.5rem",  letterSpacing: "-0.025em" }],
        "5xl": ["3rem",     { lineHeight: "1.1",     letterSpacing: "-0.03em"  }],
      },

      fontWeight: {
        regular:  "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
      },

      spacing: {
        "section-gap":  "80px",
        "card-padding": "24px",
        "form-gap":     "16px",
        "sidebar-width":"280px",
        // Admin-specific dense spacing
        "table-cell-x": "12px",   // Horizontal padding in table cells
        "table-cell-y": "10px",   // Vertical padding in table cells
        "stat-card-p":  "20px",   // Stats card padding (slightly tighter than card-padding)
      },

      borderRadius: {
        none:    "0px",
        sm:      "4px",
        DEFAULT: "8px",
        md:      "12px",
        lg:      "16px",
        xl:      "20px",
        "2xl":   "24px",
        full:    "9999px",
      },

      boxShadow: {
        xs:          "0 1px 2px rgba(0,0,0,0.04)",
        sm:          "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md:          "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
        lg:          "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)",
        xl:          "0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.03)",
        "2xl":       "0 25px 50px rgba(0,0,0,0.12)",
        card:        "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
        "card-hover":"0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.03)",
        modal:       "0 25px 50px rgba(0,0,0,0.20), 0 12px 24px rgba(0,0,0,0.10)",
        // Admin-specific
        sidebar:     "2px 0 8px rgba(0,0,0,0.08)",                              // Sidebar right edge shadow
        "input-accent": "0 0 0 3px rgba(124,58,237,0.20)",                      // Admin input focus (violet)
        input:       "0 0 0 3px rgba(37,99,235,0.15)",
        none:        "none",
      },
    },
  },

  plugins: [],
};

export default config;

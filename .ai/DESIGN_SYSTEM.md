# Online PC Store — Design System Reference

> **Version:** 1.0
> **Stack:** Next.js 16 (App Router) · TypeScript · TailwindCSS v4 · CSS Custom Properties
> **Updated:** 2026-03

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing Scale](#4-spacing-scale)
5. [Grid System](#5-grid-system)
6. [Border Radius](#6-border-radius)
7. [Shadow Scale](#7-shadow-scale)
8. [Design Tokens Reference](#8-design-tokens-reference)
9. [Component Patterns](#9-component-patterns)
10. [Interface Differences: Storefront vs Admin](#10-interface-differences-storefront-vs-admin)

---

## 1. Overview & Architecture

### Dual-interface Design System

This system serves two Next.js applications with a shared token vocabulary:

| | Customer Storefront | Admin Dashboard |
|---|---|---|
| **Directory** | `computer-store-frontend/` | `computer-store-admin/` |
| **Font** | Inter | DM Sans |
| **Primary color** | Blue (`primary-600`) | Violet (`accent-600`) |
| **Interface density** | Standard retail UX | Dense data / back-office |
| **Layout** | Fluid + responsive | Fixed sidebar + content |

### Token Architecture

```
globals.css                     ← Authoritative source
  @theme { ... }                ← Becomes Tailwind utilities
  :root  { ... }                ← Semantic CSS vars for components

tailwind.config.ts              ← JS reference (activate with @config)
src/lib/design-tokens.ts        ← JS constants for charts, tests, PDFs
```

### TailwindCSS v4 — CSS-First Config

Tailwind v4 uses `@theme` blocks in CSS instead of a JS config file.
Every token defined under `@theme` **automatically generates utility classes**:

```css
/* globals.css */
@theme {
  --color-primary-600: #2563eb;
}
```

```tsx
/* Component usage — auto-generated classes */
<button className="bg-primary-600 hover:bg-primary-700 text-white">
  Add to Cart
</button>
```

To activate the JS config file instead, add to `globals.css`:
```css
@config "./tailwind.config.ts";
```

---

## 2. Color Palette

### 2.1 Primary — Brand Blue

Used for: CTAs, links, focus rings, active navigation states, interactive elements.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `primary-50`  | `#eff6ff` | `bg-primary-50`  | Hover background, subtle highlight fills |
| `primary-100` | `#dbeafe` | `bg-primary-100` | Selected state, focus ring fill |
| `primary-200` | `#bfdbfe` | `bg-primary-200` | Active pill background |
| `primary-300` | `#93c5fd` | `text-primary-300` | Disabled button text |
| `primary-400` | `#60a5fa` | `text-primary-400` | Secondary button border |
| `primary-500` | `#3b82f6` | `text-primary-500` | Icons, accent strokes |
| **`primary-600`** | **`#2563eb`** | **`bg-primary-600`** | **★ Primary CTA button background** |
| `primary-700` | `#1d4ed8` | `bg-primary-700` | CTA hover state |
| `primary-800` | `#1e40af` | `bg-primary-800` | CTA active/pressed, dark links |
| `primary-900` | `#1e3a8f` | `text-primary-900` | High-contrast text on light bg |
| `primary-950` | `#172554` | `text-primary-950` | Deepest blue emphasis |

**Usage examples:**
```tsx
// Primary CTA button
<button className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-lg px-6 py-3">
  Add to Cart
</button>

// Link
<a className="text-primary-600 hover:text-primary-700">View Details</a>

// Focus ring (via :focus-visible in base styles, or manually)
<input className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
```

---

### 2.2 Secondary — Slate

Used for: text hierarchy, borders, backgrounds, neutral UI surfaces.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `secondary-50`  | `#f8fafc` | `bg-secondary-50`  | Page background |
| `secondary-100` | `#f1f5f9` | `bg-secondary-100` | Card / section fills |
| `secondary-200` | `#e2e8f0` | `border-secondary-200` | Borders, dividers, table lines |
| `secondary-300` | `#cbd5e1` | `border-secondary-300` | Disabled borders |
| `secondary-400` | `#94a3b8` | `text-secondary-400` | Placeholder text, muted icons |
| `secondary-500` | `#64748b` | `text-secondary-500` | Secondary text, metadata, labels |
| `secondary-600` | `#475569` | `text-secondary-600` | Supporting text, breadcrumbs |
| **`secondary-700`** | **`#334155`** | **`text-secondary-700`** | **★ Body text (primary reading)** |
| `secondary-800` | `#1e293b` | `text-secondary-800` | Headings, strong emphasis |
| `secondary-900` | `#0f172a` | `text-secondary-900` | Page titles, maximum emphasis |
| `secondary-950` | `#020617` | `text-secondary-950` | Near-black, max contrast |

---

### 2.3 Accent — Violet

Storefront: premium badges, featured labels, sale highlights, promo tags.
Admin: **primary interface color** — sidebar, nav active states, admin CTAs.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `accent-50`  | `#f5f3ff` | `bg-accent-50`  | Soft highlight background |
| `accent-100` | `#ede9fe` | `bg-accent-100` | Badge/hover background |
| `accent-200` | `#ddd6fe` | `border-accent-200` | Light accent border |
| `accent-300` | `#c4b5fd` | `text-accent-300` | Sidebar nav text (default) |
| `accent-400` | `#a78bfa` | `text-accent-400` | Sidebar icons |
| `accent-500` | `#8b5cf6` | `text-accent-500` | Featured labels, chart highlights |
| **`accent-600`** | **`#7c3aed`** | **`bg-accent-600`** | **★ Admin CTA / admin nav active bg** |
| `accent-700` | `#6d28d9` | `bg-accent-700` | Admin hover |
| `accent-800` | `#5b21b6` | `bg-accent-800` | Admin active/pressed |
| `accent-900` | `#4c1d95` | `text-accent-900` | Dark emphasis |
| `accent-950` | `#2e1065` | `text-accent-950` | Deepest accent |

**Admin sidebar special colors** (not in the Tailwind scale — use CSS vars or JS tokens):

| Variable | Hex | Usage |
|----------|-----|-------|
| `--sidebar-bg` | `#1E1B4B` | Sidebar background shell |
| `--sidebar-bg-hover` | `#2D2A5A` | Nav item hover background |
| `--sidebar-active-bg` | `#7C3AED` | Active nav item background (`accent-600`) |
| `--sidebar-text` | `#C4B5FD` | Default nav text (`accent-300`) |
| `--sidebar-icon` | `#A78BFA` | Default nav icon (`accent-400`) |

---

### 2.4 Success — Green

Used for: in stock, order completed, payment success, positive confirmations, positive KPI deltas.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `success-50`  | `#f0fdf4` | `bg-success-50`  | Banner/notification bg |
| `success-100` | `#dcfce7` | `bg-success-100` | Badge background |
| `success-200` | `#bbf7d0` | `border-success-200` | Badge border |
| `success-500` | `#22c55e` | `text-success-500` | Status dot, progress bar |
| **`success-600`** | **`#16a34a`** | **`text-success-600`** | **★ "In Stock" label text** |
| `success-700` | `#15803d` | `text-success-700` | Hover / emphasis |

**Usage:**
```tsx
// Stock badge
<span className="badge badge-success">In Stock</span>

// Or manually:
<span className="bg-success-100 text-success-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
  In Stock
</span>

// Admin stat delta (positive)
<span className="stat-delta-up">+12.5% MoM</span>
```

---

### 2.5 Warning — Amber

Used for: low stock alerts, pending order status, expiring promotions, caution states.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `warning-50`  | `#fffbeb` | `bg-warning-50`  | Banner background |
| `warning-100` | `#fef3c7` | `bg-warning-100` | Badge background |
| `warning-200` | `#fde68a` | `border-warning-200` | Badge border |
| `warning-500` | `#f59e0b` | `text-warning-500` | Status dot |
| **`warning-600`** | **`#d97706`** | **`text-warning-600`** | **★ "Low Stock" label text** |
| `warning-700` | `#b45309` | `text-warning-700` | Strong warning emphasis |

---

### 2.6 Error — Red

Used for: payment failed, out of stock, form validation errors, destructive actions.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `error-50`  | `#fef2f2` | `bg-error-50`  | Error banner / field error bg |
| `error-100` | `#fee2e2` | `bg-error-100` | Badge background |
| `error-200` | `#fecaca` | `border-error-200` | Badge border, error field border |
| `error-500` | `#ef4444` | `text-error-500` | Status dot |
| **`error-600`** | **`#dc2626`** | **`text-error-600`** | **★ "Out of Stock" / form error text** |
| `error-700` | `#b91c1c` | `text-error-700` | Destructive button, hover |

**Usage:**
```tsx
// Form error
<p className="form-error">This field is required</p>

// Or manually:
<p className="text-xs text-error-600 mt-1">This field is required</p>

// Error banner
<div className="alert alert-error">
  Payment failed. Please check your card details.
</div>
```

---

### 2.7 Info — Cyan

Used for: informational banners, tooltips, help text, neutral notifications.

| Token | Hex | Tailwind Class | Semantic Usage |
|-------|-----|----------------|----------------|
| `info-50`  | `#ecfeff` | `bg-info-50`  | Banner background |
| `info-100` | `#cffafe` | `bg-info-100` | Badge background |
| `info-200` | `#a5f3fc` | `border-info-200` | Badge border |
| `info-500` | `#06b6d4` | `text-info-500` | Status dot |
| **`info-600`** | **`#0891b2`** | **`text-info-600`** | **★ Informational text** |

---

## 3. Typography

### 3.1 Font Families

| Interface | Font | CSS Variable | Purpose |
|-----------|------|--------------|---------|
| **Storefront** | Inter | `--font-inter` → `--font-sans` | Clean, humanist — ideal for retail UX and product copy |
| **Admin** | DM Sans | `--font-dm-sans` → `--font-sans` | Structured, high legibility — suits dense tables/dashboards |
| **Monospace** | JetBrains Mono | `--font-jetbrains-mono` → `--font-mono` | Specs, SKUs, order IDs, code, price in tables |

Fonts are loaded via **Next.js font optimization** in each `layout.tsx`. They are self-hosted (zero CDN requests), have `display: swap`, and inject CSS variables that `globals.css` picks up automatically.

### 3.2 Type Scale

| Token | Size (rem) | Size (px) | Line Height | Letter Spacing | Primary Usage |
|-------|-----------|-----------|-------------|----------------|---------------|
| `text-xs`   | 0.75rem  | 12px | 1.5  | +0.025em | Badges, captions, timestamps, meta |
| `text-sm`   | 0.875rem | 14px | 1.5  | +0.01em  | ★ Labels, table cells, secondary text |
| `text-base` | 1rem     | 16px | 1.5  | 0        | ★ Body text, product descriptions |
| `text-lg`   | 1.125rem | 18px | 1.5  | -0.005em | Lead paragraphs, subheadings |
| `text-xl`   | 1.25rem  | 20px | 1.4  | -0.01em  | ★ Product names, section labels |
| `text-2xl`  | 1.5rem   | 24px | 1.3  | -0.015em | ★ Price display, card headings |
| `text-3xl`  | 1.875rem | 30px | 1.2  | -0.02em  | ★ Admin stat values, section titles |
| `text-4xl`  | 2.25rem  | 36px | 1.1  | -0.025em | Hero headings, page titles |
| `text-5xl`  | 3rem     | 48px | 1.1  | -0.03em  | Hero display text, marketing splash |

### 3.3 Font Weights

| Weight | Value | Tailwind | Usage |
|--------|-------|----------|-------|
| Regular  | 400 | `font-normal`   | Body text, descriptions, secondary info |
| Medium   | 500 | `font-medium`   | Labels, nav items, table headers, spec values |
| Semibold | 600 | `font-semibold` | ★ Product names, CTA labels, card titles |
| Bold     | 700 | `font-bold`     | ★ Prices, primary headings, emphasis |

### 3.4 Special Typography Patterns

These patterns are defined as CSS utility classes in `globals.css`:

#### Product Name
```
font-semibold text-xl leading-tight text-secondary-900
→ CSS class: .product-name
```
```tsx
<h3 className="product-name">Intel Core i9-14900K</h3>
```

#### Current Price Display
```
font-bold text-2xl text-primary-600 (tabular-nums)
→ CSS class: .price-current
```
```tsx
<span className="price-current">$599.00</span>
```

#### Original Price (Strikethrough)
```
line-through text-sm text-secondary-400 font-normal
→ CSS class: .price-original
```
```tsx
<span className="price-original">$699.00</span>
```

#### Spec Label
```
font-medium text-sm text-secondary-500 uppercase tracking-wide (JetBrains Mono)
→ CSS class: .spec-label
```
```tsx
<dt className="spec-label">Socket</dt>
```

#### Table Header (Admin)
```
font-semibold text-xs text-secondary-500 uppercase tracking-wide
→ Tailwind: text-xs font-semibold text-secondary-500 uppercase tracking-wide
→ CSS class: .th
```

#### Stat Value (Admin Dashboard)
```
font-bold text-3xl text-secondary-900 leading-tight (tabular-nums)
→ CSS class: .stat-value
```
```tsx
<p className="stat-value">1,284</p>
```

---

## 4. Spacing Scale

**Base unit: 4px = 0.25rem**. Tailwind's `p-*`, `m-*`, `gap-*` utilities use this scale directly.

| Token | px | rem | Tailwind | Semantic Usage |
|-------|----|-----|----------|----------------|
| `space-1`  |  4px | 0.25rem | `p-1`  | Icon padding, tight gaps |
| `space-2`  |  8px | 0.5rem  | `p-2`  | Badge padding, micro spacing |
| `space-3`  | 12px | 0.75rem | `p-3`  | Small button padding, tight cards |
| `space-4`  | 16px | 1rem    | `p-4`  | ★ Form gap, standard inner padding |
| `space-5`  | 20px | 1.25rem | `p-5`  | Stat card padding, medium gap |
| `space-6`  | 24px | 1.5rem  | `p-6`  | ★ Card padding, section inner gap |
| `space-8`  | 32px | 2rem    | `p-8`  | Large card padding, section gap |
| `space-10` | 40px | 2.5rem  | `p-10` | Panel padding, component gap |
| `space-12` | 48px | 3rem    | `p-12` | Section inner padding |
| `space-16` | 64px | 4rem    | `p-16` | Page section padding, large gap |
| `space-20` | 80px | 5rem    | `p-20` | ★ Section gap (between page sections) |
| `space-24` | 96px | 6rem    | `p-24` | Hero section padding |

### Semantic Aliases

| Alias | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| Section gap | 80px | `--spacing-section-gap` | Vertical space between major page sections |
| Card padding | 24px | `--spacing-card-padding` | Internal padding for cards and panels |
| Form gap | 16px | `--spacing-form-gap` | Vertical space between form fields |
| Sidebar width | 280px | `--spacing-sidebar-width` | Fixed width for admin sidebar |
| Sidebar collapsed | 72px | `--spacing-sidebar-collapsed` | Icon-only collapsed admin sidebar |
| Header height | 64px | `--spacing-header-height` | Sticky nav/admin header height |

---

## 5. Grid System

### 5.1 Customer Storefront

#### Page Container
```tsx
// CSS class (defined in globals.css)
<div className="container-page">

// Equivalent Tailwind:
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```
Max width: **1280px** | Padding: `px-4` → `sm:px-6` → `lg:px-8`

#### Product Grid
```tsx
// CSS class:
<div className="product-grid">

// Equivalent Tailwind:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

| Breakpoint | Columns | Width |
|------------|---------|-------|
| Mobile (< 640px) | 1 | Full width |
| Small (640px+) | 2 | ~50% each |
| Large (1024px+) | 3 | ~33% each |
| XLarge (1280px+) | 4 | ~25% each |

#### Catalog Layout (sidebar + products)
```tsx
<div className="catalog-layout">
  <aside className="...">Filters (280px)</aside>
  <main className="...">Product grid</main>
</div>

// Equivalent:
<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
```

### 5.2 Admin Dashboard

#### Shell Layout
```tsx
<div className="admin-shell">
  <aside className="admin-sidebar">Nav (280px fixed)</aside>
  <div className="admin-main">
    <header className="admin-header">Header (64px sticky)</header>
    <main className="admin-content">Content area</main>
  </div>
</div>
```

| Element | Width | Position | CSS Class |
|---------|-------|----------|-----------|
| Sidebar | 280px (72px collapsed) | Fixed left | `.admin-sidebar` |
| Main area | `flex-1` | `margin-left: 280px` | `.admin-main` |
| Header | 100% of main area | Sticky top | `.admin-header` |
| Content | `flex-1` | Scrollable | `.admin-content` |

#### Stats Grid
```tsx
<div className="stats-grid">
  <div className="stat-card">...</div>  {/* × 4 */}
</div>

// Equivalent:
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
```

#### Data Table
```tsx
<div className="table-container">
  <table>
    <thead>
      <tr>
        <th className="th">Order ID</th>
        <th className="th">Customer</th>
      </tr>
    </thead>
    <tbody>
      <tr className="tr-hover">
        <td className="td font-mono">ORD-00142</td>
        <td className="td">Nguyen Van A</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 6. Border Radius

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| `none`    | 0px    | `rounded-none` | Tables, full-bleed images |
| `sm`      | 4px    | `rounded-sm`   | Tooltips, small chips, micro-badges |
| `DEFAULT` | 8px    | `rounded`      | ★ Buttons, input fields, dropdowns |
| `md`      | 12px   | `rounded-md`   | ★ Cards, product panels |
| `lg`      | 16px   | `rounded-lg`   | Modals, drawers, large panels |
| `xl`      | 20px   | `rounded-xl`   | Feature cards, marketing blocks |
| `2xl`     | 24px   | `rounded-2xl`  | Hero cards, large sections |
| `full`    | 9999px | `rounded-full` | ★ Badges, pills, avatars, toggles |

### Usage Rules

| Component | Radius | Token |
|-----------|--------|-------|
| **Button** | 8px | `rounded` (DEFAULT) |
| **Input field** | 8px | `rounded` (DEFAULT) |
| **Dropdown menu** | 8px | `rounded` (DEFAULT) |
| **Product card** | 12px | `rounded-md` |
| **Admin panel** | 12px | `rounded-md` |
| **Modal / Drawer** | 16px | `rounded-lg` |
| **Feature card** | 20px | `rounded-xl` |
| **Badge / Pill** | 9999px | `rounded-full` |
| **Avatar** | 9999px | `rounded-full` |
| **Tooltip** | 4px | `rounded-sm` |

```tsx
// Button — rounded (8px)
<button className="bg-primary-600 text-white rounded px-4 py-2">Add to Cart</button>

// Card — rounded-md (12px)
<div className="bg-white rounded-md shadow-card p-6">...</div>

// Badge — rounded-full (9999px)
<span className="bg-success-100 text-success-700 rounded-full px-2.5 py-0.5 text-xs">
  In Stock
</span>

// Modal
<div className="bg-white rounded-lg shadow-modal p-8">...</div>
```

---

## 7. Shadow Scale

Each level uses layered shadows for realistic depth. Values are intentionally subtle to work across white and off-white backgrounds.

| Token | CSS Value | Tailwind Class | Usage |
|-------|-----------|----------------|-------|
| `xs`  | `0 1px 2px rgba(0,0,0,0.04)` | `shadow-xs` | Subtle lift (inline elements, micro-cards) |
| `sm`  | `0 1px 3px …0.08, 0 1px 2px …0.04` | `shadow-sm` | Product card default, buttons |
| `md`  | `0 4px 6px …0.07, 0 2px 4px …0.04` | `shadow-md` | Dropdowns, hovered cards |
| `lg`  | `0 10px 15px …0.08, 0 4px 6px …0.04` | `shadow-lg` | Elevated panels, sticky elements |
| `xl`  | `0 20px 25px …0.08, 0 8px 10px …0.03` | `shadow-xl` | Floating panels, focused modal |
| `2xl` | `0 25px 50px rgba(0,0,0,0.12)` | `shadow-2xl` | Deepest depth |

### Semantic Shadows

| Alias | Value | Usage |
|-------|-------|-------|
| `shadow-card` | = `shadow-md` | Product card / admin panel default |
| `shadow-card-hover` | = `shadow-xl` | Product card on hover (transition) |
| `shadow-modal` | large + opacity 0.20 | Modal dialog overlay |
| `shadow-sidebar` | `2px 0 8px rgba(0,0,0,0.15)` | Admin sidebar right edge |
| `shadow-input-focus` | `0 0 0 3px rgba(37,99,235,0.15)` | Input/button focus ring (blue) |
| `shadow-input-focus-accent` | `0 0 0 3px rgba(124,58,237,0.20)` | Admin input focus ring (violet) |

### Card Hover Transition
```tsx
// Product card with shadow transition on hover
<div className="
  bg-white rounded-md border border-secondary-200
  shadow-card hover:shadow-card-hover
  transition-shadow duration-300
  hover:-translate-y-0.5 transition-transform
">
  {/* — or use the CSS class: */}
</div>

<div className="product-card">...</div>
```

---

## 8. Design Tokens Reference

### 8.1 File Locations

| File | Purpose | How to use |
|------|---------|------------|
| `computer-store-frontend/tailwind.config.ts` | Storefront JS token reference | Activate with `@config` in CSS |
| `computer-store-admin/tailwind.config.ts` | Admin JS token reference | Activate with `@config` in CSS |
| `computer-store-frontend/app/globals.css` | ★ Storefront CSS tokens + components | `@import` via layout.tsx |
| `computer-store-admin/app/globals.css` | ★ Admin CSS tokens + components | `@import` via layout.tsx |
| `computer-store-frontend/src/lib/design-tokens.ts` | JS constants for charts, tests, PDFs | `import { colors } from "@/lib/design-tokens"` |
| `computer-store-admin/src/lib/design-tokens.ts` | Same, admin copy | `import { colors } from "@/lib/design-tokens"` |

### 8.2 CSS Variables Quick Reference

```css
/* Colors */
--color-primary-600      /* #2563eb — CTA buttons */
--color-secondary-700    /* #334155 — body text */
--color-accent-600       /* #7c3aed — admin primary */
--color-success-600      /* #16a34a — in stock */
--color-warning-600      /* #d97706 — low stock */
--color-error-600        /* #dc2626 — errors */
--color-info-600         /* #0891b2 — informational */

/* Fonts */
--font-sans              /* Inter (storefront) / DM Sans (admin) */
--font-mono              /* JetBrains Mono */

/* Spacing */
--spacing-section-gap    /* 80px */
--spacing-card-padding   /* 24px */
--spacing-form-gap       /* 16px */
--spacing-sidebar-width  /* 280px */

/* Radius */
--radius                 /* 8px — buttons, inputs */
--radius-md              /* 12px — cards */
--radius-lg              /* 16px — modals */
--radius-full            /* 9999px — badges, pills */

/* Shadows */
--shadow-card            /* product card default */
--shadow-card-hover      /* product card hover */
--shadow-modal           /* modal dialog */
--shadow-input-focus     /* blue focus ring */

/* Semantic aliases (component layer) */
--sidebar-bg             /* #1E1B4B — admin sidebar */
--sidebar-active-bg      /* #7C3AED — admin active nav */
--sidebar-text           /* #C4B5FD — sidebar nav text */
--status-in-stock        /* = --color-success-600 */
--status-low-stock       /* = --color-warning-600 */
--status-out-of-stock    /* = --color-error-600 */
```

### 8.3 JS Tokens Quick Reference

```ts
import {
  colors,             // Full color palette
  colorPrimary,       // Blue scale
  colorAccent,        // Violet scale
  colorSuccess,       // Green scale
  adminColors,        // Sidebar-specific colors
  typography,         // Type scale, weights, patterns
  spacingPx,          // Spacing in px
  borderRadius,       // Radius values in px
  shadows,            // Shadow CSS strings
  breakpoints,        // Breakpoint px values
  stockStatusColors,  // Stock status → color map
  orderStatusColors,  // Order status → color map
  chartColors,        // Ordered chart palette
  rechartsTheme,      // Recharts theme config
  getStockBadgeClasses,  // Helper: stock → Tailwind classes
  getOrderBadgeClasses,  // Helper: order → Tailwind classes
} from "@/lib/design-tokens";

// Recharts example
<Bar dataKey="revenue" fill={colors.primary[600]} />
<Line dataKey="orders" stroke={colors.accent[500]} />

// Dynamic badge classes
<span className={getStockBadgeClasses(product.stockStatus)}>
  {stockStatusColors[product.stockStatus].label}
</span>
```

---

## 9. Component Patterns

### 9.1 Pre-built CSS Classes (globals.css)

These classes are defined in `@layer components` and can be used directly in JSX.

#### Storefront Components

| Class | Description | Usage |
|-------|-------------|-------|
| `.container-page` | Responsive max-w-7xl container | Page wrapper |
| `.section` | 80px vertical padding section | Page sections |
| `.product-grid` | Responsive 1→2→3→4 col grid | Product listings |
| `.catalog-layout` | Sidebar + product area grid | Category pages |
| `.product-card` | White card with hover shadow lift | Product tiles |
| `.product-name` | Semibold xl leading-tight | Product titles |
| `.price-current` | Bold 2xl primary-600 tabular | Price display |
| `.price-original` | Line-through sm secondary-400 | Original price |
| `.spec-label` | Mono sm 500 uppercase tracking | Spec/feature labels |
| `.spec-value` | Mono sm 500 body | Spec values |
| `.btn-primary` | Blue CTA button | Add to cart, Buy Now |
| `.btn-secondary` | White + border button | Compare, Wishlist |
| `.btn-ghost` | Text-only blue button | "View All" links |
| `.form-input` | Standard text input | All form inputs |
| `.form-label` | Input label | Form labels |
| `.form-helper` | Help text below input | Input hints |
| `.form-error` | Error text below input | Validation messages |
| `.badge` | Base pill badge | All badges |
| `.badge-success` | Green badge | In Stock |
| `.badge-warning` | Amber badge | Low Stock |
| `.badge-error` | Red badge | Out of Stock |
| `.badge-info` | Cyan badge | Coming Soon |
| `.badge-accent` | Violet badge | Featured, Premium |
| `.alert` | Base alert banner | Notifications |
| `.alert-success/warning/error/info` | Colored banners | Status messages |
| `.nav-bar` | Sticky white top nav | Site header |
| `.nav-link` | Nav anchor with hover | Navigation links |
| `.tooltip` | Dark small tooltip | Help hints |
| `.skeleton` | Animated shimmer | Loading placeholders |

#### Admin Components

| Class | Description | Usage |
|-------|-------------|-------|
| `.admin-shell` | Full-screen flex layout | Root admin layout |
| `.admin-sidebar` | Fixed 280px violet sidebar | Admin nav |
| `.admin-main` | Content area (margin-left 280px) | Main area |
| `.admin-header` | Sticky white 64px header | Admin header |
| `.admin-content` | Padded scrollable content | Page content |
| `.admin-card` | White panel card | Dashboard panels |
| `.sidebar-item` | Sidebar nav link | Nav items |
| `.sidebar-section-label` | Uppercase section label | Nav sections |
| `.stats-grid` | 1→2→4 col stats grid | Dashboard KPIs |
| `.stat-card` | Stat card container | KPI cards |
| `.stat-value` | Bold 3xl stat number | KPI values |
| `.stat-label` | Muted sm stat title | KPI labels |
| `.stat-delta-up` | Green positive change | +N% indicators |
| `.stat-delta-down` | Red negative change | -N% indicators |
| `.table-container` | Scrollable table wrapper | Data tables |
| `.th` | Table header cell | `<th>` elements |
| `.td` | Table data cell | `<td>` elements |
| `.tr-hover` | Row hover highlight | `<tr>` elements |
| `.btn-admin` | Violet admin CTA | Admin primary actions |
| `.btn-admin-secondary` | White outlined admin btn | Admin secondary |
| `.btn-danger` | Red destructive button | Delete, Cancel actions |
| `.badge-pending/confirmed/shipping/delivered/cancelled` | Order status badges | Order status |
| `.badge-stock-ok/low/out` | Stock status badges | Stock status |
| `.page-header` | Page title + actions row | Page top |
| `.page-title` | Bold 2xl page title | Section titles |

### 9.2 Complete Component Examples

#### Product Card
```tsx
<div className="product-card">
  <div className="aspect-square bg-secondary-100 rounded-md mb-4 overflow-hidden">
    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
  </div>

  <div className="mb-1">
    <span className="badge badge-success">In Stock</span>
  </div>

  <h3 className="product-name mt-2 mb-1">{product.name}</h3>

  <p className="text-sm text-secondary-500 mb-3">{product.shortDesc}</p>

  <dl className="space-y-1 mb-4">
    <div className="flex justify-between">
      <dt className="spec-label">CPU</dt>
      <dd className="spec-value">Intel Core i9-14900K</dd>
    </div>
    <div className="flex justify-between">
      <dt className="spec-label">RAM</dt>
      <dd className="spec-value">32GB DDR5</dd>
    </div>
  </dl>

  <div className="flex items-end gap-2 mb-4">
    <span className="price-current">{formatVND(product.price)}</span>
    {product.originalPrice && (
      <span className="price-original">{formatVND(product.originalPrice)}</span>
    )}
  </div>

  <button className="btn-primary w-full">Add to Cart</button>
</div>
```

#### Admin Stat Card
```tsx
<div className="stat-card">
  <p className="stat-label">Total Orders</p>
  <p className="stat-value">{formatNumber(stats.totalOrders)}</p>
  <div className="flex items-center gap-1 mt-1">
    <span className="stat-delta-up">+12.5%</span>
    <span className="text-xs text-secondary-400">vs last month</span>
  </div>
</div>
```

#### Status Badge (data-driven)
```tsx
import { getStockBadgeClasses, stockStatusColors } from "@/lib/design-tokens";

<span className={getStockBadgeClasses(product.stockStatus)}>
  {stockStatusColors[product.stockStatus].label}
</span>
```

---

## 10. Interface Differences: Storefront vs Admin

### Typography

| Element | Storefront | Admin |
|---------|-----------|-------|
| Font | Inter | DM Sans |
| Body size | 16px (`text-base`) | 14px (`text-sm`) — denser |
| H1 | 36px | 30px |
| Focus ring | Blue (primary-500) | Violet (accent-500) |

### Layout

| Element | Storefront | Admin |
|---------|-----------|-------|
| Max width | 1280px centered | n/a (sidebar-based) |
| Sidebar | Filter sidebar (280px, collapsible on mobile) | Fixed 280px (72px collapsed) |
| Header | Sticky white top nav | Sticky white header within content area |
| Background | `secondary-50` (#f8fafc) | `secondary-50` (#f8fafc) |

### Color Roles

| Role | Storefront | Admin |
|------|-----------|-------|
| Primary action | `primary-600` blue | `accent-600` violet |
| Interface chrome | White / light blue | Deep violet sidebar |
| Focus ring | Blue | Violet |
| Input focus shadow | `rgba(37,99,235,0.15)` | `rgba(124,58,237,0.20)` |

### Spacing Density

| Context | Storefront | Admin |
|---------|-----------|-------|
| Card padding | 24px (`card-padding`) | 24px (`card-padding`) |
| Section gap | 80px | 24px (`space-y-6`) |
| Table cell | n/a | 10px × 12px |
| Stat card padding | n/a | 20px (`stat-card-p`) |

---

## Quick Reference: Color → Tailwind Class

```
PRIMARY BLUE:
  bg-primary-600  text-primary-600  border-primary-600
  bg-primary-50   text-primary-900  (+ all 50–950 shades)

SLATE GRAY:
  bg-secondary-50   text-secondary-700  border-secondary-200
  bg-secondary-100  text-secondary-900  (+ all 50–950 shades)

VIOLET ACCENT:
  bg-accent-600  text-accent-500  border-accent-200
  (+ all 50–950 shades)

STATUS COLORS:
  bg-success-50   text-success-600  border-success-200
  bg-warning-50   text-warning-600  border-warning-200
  bg-error-50     text-error-600    border-error-200
  bg-info-50      text-info-600     border-info-200
  (+ all 50–950 shades for each)
```

---

*This document is the canonical reference for the PC Store design system. Keep it in sync with `globals.css` and `design-tokens.ts` when making changes.*

# SKILL.md — Technical Mastery Reference
## Online PC Store System · Frontend Monorepo

> **Scope:** `computer-store-client-frontend` (customer storefront) +
> `computer-store-admin-frontend` (back-office dashboard)
> **Generated from:** codebase analysis · package.json · .ai/*.md documentation · component source

---

## Table of Contents

1. [Core Technology Stack](#1-core-technology-stack)
2. [Architectural Patterns](#2-architectural-patterns)
3. [Engineering Competencies](#3-engineering-competencies)
4. [Complex Business Logic](#4-complex-business-logic)
5. [Coding Standards](#5-coding-standards)

---

## 1. Core Technology Stack

### 1.1 Primary Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | Next.js App Router | 16.1.6 | Server Components by default reduce JS bundle; built-in ISR for catalog caching; route groups cleanly separate storefront / auth / account / admin |
| **UI Library** | React | 19.2.3 | Concurrent rendering improvements; `use()` hook for async Server Components; forward-compatible with Next.js 16 |
| **Language** | TypeScript | ^5 (strict) | Zero-`any` enforcement catches shape mismatches between API and UI at compile time — critical for a product catalog with heterogeneous spec data |
| **Styling** | TailwindCSS | ^4 | CSS-first `@theme` blocks replace a separate design-token file; JIT purging keeps production CSS minimal; v4 removes the need for a PostCSS config |
| **Animations** | Framer Motion | ^12 | `AnimatePresence` + `motion.div` power the compare-bar entry/exit and product-card layout animations with minimal boilerplate |
| **Positioning** | @floating-ui/react | ^0.27.19 | Tooltip and dropdown portals with flip/shift middleware — avoids overflow clipping inside `overflow-hidden` containers |
| **Icons** | @heroicons/react | ^2.2.0 | Single approved icon set (outline `/24` default, solid `/24` for emphasis); enforced by team policy to prevent visual inconsistency |
| **Carousel** | embla-carousel-react | ^8.6.0 | Touch-native, zero-dependency slider for hero banners and product image galleries |

### 1.2 State & Data Layer

| Concern | Technology | Version | Rationale |
|---|---|---|---|
| **Server data** | TanStack React Query | (via shared UI) | Declarative caching with fine-grained `staleTime` control: 30 s for admin (always fresh), 3600 s for storefront catalog; prevents waterfall `useEffect` fetches |
| **Client state** | Zustand | (via shared UI) | Lightweight store slices for cart, auth session, compare list, Build PC selections, sidebar collapse — none of which are server-derived |
| **Forms** | react-hook-form + Zod | (admin) | Uncontrolled inputs for performance; Zod schema validation shared between frontend and backend contract |
| **Authentication** | NextAuth.js | (both projects) | JWT stored in httpOnly cookie; session available server-side in layouts — avoids exposing access token to client JS |
| **HTTP client** | Axios | (both projects) | Interceptors attach Bearer token and handle 401 refresh; BFF Route Handlers in `app/api/[...path]` proxy all calls to NestJS |

### 1.3 Shared Package

| Package | Purpose |
|---|---|
| `@computer-store/ui` | Published internal package containing Button, Input, Modal, Badge, Alert, Toast, Skeleton, DataTable, StatCard, ChartWidget, FileUpload, ConfirmDialog, Tabs, Accordion, Tooltip, EmptyState — consumed by both projects to enforce design consistency |

### 1.4 Backend (Integration Target)

| Layer | Technology | Notes |
|---|---|---|
| **API Server** | NestJS (port 4000) | REST endpoints prefixed `/admin/*` require RBAC roles; `/api/*` for customer-facing |
| **Charts** | Recharts | Admin dashboard revenue/order charts — better React integration than Chart.js |

---

## 2. Architectural Patterns

### 2.1 Rendering Strategy Matrix

| Route Group | Pattern | Cache / Revalidation | Rationale |
|---|---|---|---|
| `/` (home) | ISR | `revalidate: 3600` | Hero banner and top-category data changes infrequently |
| `/products/[slug]` | ISR | `revalidate: 1800` | Product specs and pricing update a few times per day |
| `/cart`, `/checkout`, `/buildpc` | Client-render | No cache | User-session-bound data must never be shared across CDN edges |
| `/account/**` | Protected Client | JWT validated in middleware | Personal order history, addresses |
| `(dashboard)/**` (admin) | `force-dynamic` | **No cache** | Admin must always see live inventory, order status, ticket queue |

### 2.2 System Layer Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                           │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   React Query Cache  │  │  Zustand Stores  │  │  NextAuth.js  │  │
│  │  (server data TTL)   │  │  (client state)  │  │  (JWT Cookie) │  │
│  └──────────┬──────────┘  └────────┬─────────┘  └──────┬────────┘  │
└─────────────┼────────────────────────────────────────────┼──────────┘
              │ RSC / Route Handlers                        │ Session
┌─────────────▼────────────────────────────────────────────▼──────────┐
│                    Next.js App Router (SSR / ISR)                   │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ middleware.ts│  │  Server Components│  │  BFF Route Handlers  │  │
│  │ JWT + RBAC   │  │  (default, no JS) │  │  app/api/[...path]   │  │
│  └──────────────┘  └──────────────────┘  └──────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │ HTTPS / REST (Bearer JWT)
┌──────────────────────────────────────▼──────────────────────────────┐
│                         NestJS Backend (4000)                       │
│    /admin/* — @Roles('admin','staff',...)                           │
│    /api/*   — public + protected endpoints                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Folder Structure as Architecture Enforcer

```
src/
├── app/                        ← Routing layer ONLY (thin pages)
│   ├── (storefront)/           ← Public layout group (Navbar + Footer)
│   ├── (auth)/                 ← Auth layout group (centered card)
│   ├── (account)/              ← Protected layout group (sidebar nav)
│   └── api/[...path]/          ← BFF proxy to NestJS
│
├── components/                 ← Reusable presentation layer
│   ├── ui/                     ← Atomic: Button, Badge, Tooltip, Modal
│   ├── layout/                 ← Structural: Header, Footer, Breadcrumb
│   ├── product/                ← Domain: ProductCard, PriceTag, RatingStars
│   ├── commerce/               ← Domain: CartItem, CheckoutForm, OrderTimeline
│   ├── compare-ui/             ← Feature slice: Compare Page components
│   └── buildpc/                ← Feature slice: PC Builder components
│
├── store/                      ← Client-side global state (Zustand + Context)
│   ├── compare.store.tsx       ← useReducer + Context pattern for compare
│   ├── cart.store.ts           ← Zustand (persisted to localStorage)
│   └── auth.store.ts           ← Zustand (synced with NextAuth session)
│
├── services/                   ← Data-fetching abstraction layer
│   └── {resource}.service.ts   ← typed async functions, never inline fetch
│
├── hooks/                      ← Custom React hooks (useCart, useWishlist)
├── types/                      ← Domain type contracts ({domain}.types.ts)
└── lib/                        ← Pure utilities (format.ts, design-tokens.ts)
```

**Key enforcement:** Pages never fetch data directly — they call `services/`. Components never manage server state — they use React Query hooks. The store layer never caches API responses — only client-only state.

### 2.4 Design Patterns Applied

| Pattern | Where Used | Implementation |
|---|---|---|
| **Server-first composition** | All page routes | `page.tsx` is a Server Component; only leaf nodes that need interactivity get `"use client"` |
| **Feature-sliced components** | `compare-ui/`, `buildpc/`, `commerce/` | Each feature owns its full component tree, types, and store slice |
| **Reducer + Context** | `compare.store.tsx` | Complex multi-action state (ADD, REMOVE, HYDRATE, TOAST, DRAWER) modeled as a typed discriminated union reducer |
| **BFF (Backend for Frontend)** | `app/api/[...path]` | Next.js Route Handlers proxy NestJS — frontend never exposes internal API URL or token in browser code |
| **Component Resolution Order** | Team convention | Shared package → local `src/components/` → colocate in page folder; prevents duplicate UI primitives |
| **Barrel exports** | Every `components/` subfolder | `index.ts` centralizes imports; prevents deep relative paths |

---

## 3. Engineering Competencies

### 3.1 Next.js App Router Mastery

- **Route Groups** `(storefront)`, `(auth)`, `(account)`, `(dashboard)` — shared layouts without URL segments
- **`loading.tsx` + `error.tsx`** required on every page — streaming Suspense boundaries and error boundaries
- **`export const dynamic = "force-dynamic"`** on all admin pages — bypasses ISR/CDN edge cache for live data
- **Parallel Routes** and **Intercepting Routes** for modal overlays (product quick-view, variant drawer)
- **Middleware** (`middleware.ts`) — JWT validation and RBAC redirect before page renders, protecting both route groups and API handlers
- **Server Actions** integration pattern alongside BFF Route Handlers

### 3.2 TypeScript Engineering

- `strict: true` mode — `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` all active
- **Discriminated union actions** for store reducers:
  ```typescript
  type CompareAction =
    | { type: "ADD_PRODUCT"; payload: CompareProduct }
    | { type: "REMOVE_PRODUCT"; payload: string }
    | { type: "HYDRATE"; payload: Pick<CompareState, "compareList" | "activeCategory"> };
  ```
- **Generic service functions** with typed return values — zero `any` in API response handling
- `import type { X }` for type-only imports — avoids runtime import side effects
- `interface ComponentNameProps` pattern — explicit, extendable component contracts

### 3.3 State Management Architecture

- **React Query** for all server state: `queryKey` design (resource + params), `staleTime` calibrated per data volatility, `initialData` from Server Components
- **Zustand** for client-only state: isolated slices (cart, auth, compare, buildpc, sidebar), `persist` middleware for localStorage sync
- **useReducer + Context** for feature state requiring complex multi-action workflows (compare list)
- **`productCatalogue` Map pattern** (`useRef(new Map(...))`) for O(1) spec-data enrichment without re-renders — solves spec loss on product re-add in the compare feature
- **localStorage hydration enrichment** — on restore, each stored product is re-enriched from the in-memory catalogue map to recover data stripped during serialization

### 3.4 CSS & Design System Engineering

- **Tailwind v4 CSS-first tokens** — `@theme` blocks in `globals.css` as single source of truth; no runtime CSS-in-JS
- **Dual design systems** — storefront (Inter, blue primary) vs. admin (DM Sans, violet primary) sharing the same token structure but different aesthetic personalities
- **Systematic spacing tokens** — `table-cell-x: 12px`, `sidebar-width: 280px`, `header-height: 64px` — no magic numbers in component JSX
- **Cross-browser CSS Grid** — removed `position: sticky` from `overflow-x: auto` containers (Edge/Chrome spec compliance: overflow-x auto implicitly sets overflow-y auto, breaking sticky context)
- **`display: contents` wrapper pattern** for ARIA-semantic grid rows
- **`h-full` + `flex-1` + `mt-auto` card alignment technique** — equal-height column headers without JavaScript height synchronization

### 3.5 Component Architecture

- **Compound component pattern** — `CompareHeaderCardList` owns animation/layout; `CompareHeaderCard` owns visual rendering; clean separation of concerns
- **`size` prop variants** (`"sm" | "md"`) on shared components to serve multiple contexts (mini card in CompareBar vs. full column header in table)
- **Tooltip wrapping pattern** with `@floating-ui` portals — renders above overflow containers without z-index wars
- **Framer Motion `AnimatePresence` + `mode="popLayout"`** — smooth animated card entry/exit maintaining layout continuity during product add/remove

### 3.6 Authentication & Authorization

- **Dual-layer RBAC** — middleware route guard (redirect before render) + `useRoleGuard()` hook (component-level fallback)
- **Four admin roles** — Admin, Staff, Warehouse, CSKH — each with distinct page access matrices
- **JWT httpOnly cookie** — token never accessible to browser JS; CSRF-safe via SameSite attribute
- **NextAuth session propagation** — session available server-side in Server Components and layouts; client-side via `useSession()`

### 3.7 Form Engineering

- **react-hook-form + Zod** — schema-driven validation with `zodResolver`; shared Zod schemas between frontend and backend API contract
- **Uncontrolled inputs** — react-hook-form avoids re-renders on every keystroke; critical for large forms (product create with 20+ fields, spec variants)
- **Dynamic row forms** — `useFieldArray` for batch coupon generation, stock import entries

### 3.8 Performance Engineering

- **Server Components by default** — zero JS shipped for static UI; only interactive subtrees are client bundles
- **`loading="lazy" decoding="async"`** on all `<img>` elements — browser-native deferred image decode
- **ISR cache tiers** — home (1h), product detail (30m), admin (no-cache) — calibrated to actual data update frequency
- **`useMemo` for expensive derivations** — `mergedGroups` computation in `CompareTable` recalculates only when `products` array reference changes
- **Passive event listeners** — `{ passive: true }` on all scroll/resize handlers

---

## 4. Complex Business Logic

### 4.1 Product Comparison Engine

**Complexity:** Spec-data merging across heterogeneous product types, cross-browser layout, state persistence

- **Multi-product spec merge** — uses the first product with a non-empty `specGroups` as the template; iterates all other products to look up their own values per group/row key; falls back to the template's `values` map (supporting the legacy flat format)
- **Category locking** — once the first product is added, `activeCategory` is set; subsequent adds are rejected if the category doesn't match, with a toast notification explaining why
- **Max 4 products** — enforced in reducer before dispatch; toast fired on attempt to exceed
- **Spec data survival through remove/re-add** — the `productCatalogue` Map ref in the store enriches any incoming product from the full catalogue, making the minimal drawer objects harmless
- **`HYDRATE` action with enrichment** — localStorage restore re-maps each product through the catalogue map so serialization stripping (e.g., `specGroups: []`) doesn't cause permanent data loss

### 4.2 Build PC Compatibility System

**Complexity:** Multi-dimensional constraint propagation across sequential part selections

- **Step-sequenced selection** — CPU → Mainboard → RAM → Storage → GPU → Case → PSU → Cooler; each step filters the next step's product list
- **Socket compatibility** — `cpu.socket === mainboard.socket` (e.g., AM5, LGA1700)
- **Memory generation compatibility** — `ram.ddrGen === mainboard.supportedDDR` (DDR4 vs DDR5)
- **Real-time constraint checking** — after each selection, API returns compatible options for remaining steps
- **`CompatibilityAlert`** — visual badge indicating which part introduces a conflict; non-blocking (user can still proceed with warning)
- **Save build** — requires authentication; guest users prompted to log in with `redirect` param preserving build state

### 4.3 Role-Based Access Control (Admin)

**Complexity:** Four roles, 17 feature modules, dual-layer validation

| Role | Accessible Modules |
|---|---|
| **Admin** | All modules + Staff management + Reports + System settings |
| **Staff** | Products, Orders, Reviews, Promotions, Coupons |
| **Warehouse** | Inventory in/out, Order fulfillment (packing/shipping) |
| **CSKH** | Support tickets, Returns, Customer contact |

- Middleware checks `token.role` against route prefix before rendering the page
- `useRoleGuard()` hook renders `null` or a 403 UI for component-level gating
- Backend `@Roles()` decorator provides the authoritative third-layer check
- Role checks are **never** the sole UI hiding mechanism — backend always validates

### 4.4 Order Status Lifecycle

**Complexity:** Finite state machine with role-gated transitions and audit trail

```
pending → confirmed → packing → shipping → delivered
                                          ↓
                    cancelled (only from pending)
                                          ↓
                    return_requested → return_approved → refunded
```

- Admin can advance status; customer can cancel only from `pending`
- Each transition is recorded in `OrderTimeline` with timestamp and actor
- `OrderStatusBadge` maps status to semantic color token (warning = pending, success = delivered, error = cancelled)
- SLA indicator on support tickets: open > 24 h triggers warning color on the ticket row

### 4.5 Cart & Stock Management

**Complexity:** Guest/authenticated cart merge, multi-point stock validation

- **Guest cart** stored in localStorage; on login, merged with server-side cart (server wins on conflict)
- **Stock validation at three checkpoints:** add-to-cart, checkout start, payment confirmation — prevents overselling
- **Coupon validation** — real-time API check on coupon code entry; applies discount to order summary
- **Variant-aware pricing** — unit price may differ per variant (RAM tier, storage size); cart item stores `variantId`
- **Quantity bounds** — stepper enforces `min: 1`, `max: stockCount`; out-of-stock items render with disabled stepper

### 4.6 Checkout Wizard (3-Step)

**Complexity:** Multi-step form with dependent async validation at each step

- **Step 1 — Address:** renders saved address cards; "Add new" opens modal with Google Maps autocomplete; selection stored in wizard state
- **Step 2 — Payment:** COD, bank transfer, e-wallet, installment; each method renders a different confirmation UI
- **Step 3 — Review:** full order summary with final stock re-check before submitting
- Wizard state preserved across steps; back-navigation doesn't clear later steps
- Order placed via `POST /api/orders`; on success redirects to `/account/orders/{id}`

### 4.7 Review Moderation Pipeline

**Complexity:** Purchase-gated submission with staff approval workflow

- Only customers with a `delivered` order containing the product can submit a review
- Submitted reviews land in `pending` state; not visible on product page
- Admin Staff role sees pending reviews in the moderation queue; can approve or reject with a note
- Approved reviews increment `product.reviewCount` and recalculate `product.rating` (weighted average)
- `RatingStars` displays fractional star fill using CSS gradient mask

---

## 5. Coding Standards

### 5.1 TypeScript

| Rule | Enforcement |
|---|---|
| `strict: true` | `tsconfig.json` |
| Zero `any` | Team policy + linting |
| Named exports only (no `default export` on components) | Team policy |
| `import type { X }` for type-only imports | Team policy |
| All API responses explicitly typed | Code review gate |
| All component props via explicit `interface ComponentNameProps` | Code review gate |

### 5.2 Linting & Formatting

```json
// eslint.config.mjs (both projects)
{ extends: ["next/core-web-vitals"] }
```

- **ESLint + `eslint-config-next`** — includes React Hooks rules, Next.js-specific checks (no `<img>` without `next/image` warnings, no `<a>` wrapping `<Link>`, etc.)
- **`@next/next/no-img-element`** rule disabled per-file with `// eslint-disable-next-line` only where intentional (compare cards, product gallery — intentional for performance control)
- **Prettier** — implied by team convention; no explicit config found; enforced via IDE settings

### 5.3 Component Conventions

```
✅  export function ProductCard(props: ProductCardProps) { ... }
✅  export interface ProductCardProps { ... }
✅  "use client" at top only when state/effects/browser APIs are needed
✅  loading.tsx + error.tsx alongside every page.tsx
✅  index.ts barrel export updated immediately after creating a component
❌  export default ProductCard
❌  fetch() or axios inside component body
❌  Hardcoded colors: text-[#2563eb] (use text-primary-600)
❌  Storing server data in Zustand (use React Query)
❌  ISR on admin pages
```

### 5.4 File Naming

| Asset | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase + `use` prefix | `useCart.ts` |
| Services | camelCase + `.service` | `product.service.ts` |
| Types | camelCase + `.types` | `product.types.ts` |
| Stores | camelCase + `.store` | `compare.store.tsx` |
| Pages | lowercase `page.tsx` | `page.tsx` |
| Config | lowercase | `tailwind.config.ts` |

### 5.5 Testing

> **Current state:** No automated test suite is configured in `package.json` (no Jest, Vitest, Playwright, or Cypress dependency).

| Test type | Status | Recommended tooling |
|---|---|---|
| Unit tests | Not configured | Vitest + React Testing Library |
| Integration tests | Not configured | Vitest + MSW (mock NestJS responses) |
| E2E tests | Not configured | Playwright |
| Accessibility | Not configured | axe-core via `@axe-core/react` |

- Zod schemas serve as implicit runtime validation contracts at form submission
- TypeScript strict mode eliminates a significant class of runtime bugs at compile time
- `ui-demo/` pages in the client frontend serve as visual regression manual tests for UI components

### 5.6 Build & Scripts

```bash
# Both projects
npm run dev      # Next.js dev server (storefront: 3000, admin: 3001)
npm run build    # Production build (type-check + optimize)
npm run start    # Production server
npm run lint     # ESLint check across src/
```

### 5.7 Environment Variables

| Variable | Used By |
|---|---|
| `NEXT_PUBLIC_API_URL` | Axios base URL for client-side requests |
| `NEXTAUTH_SECRET` | JWT signing key |
| `NEXTAUTH_URL` | Canonical URL for NextAuth callbacks |

### 5.8 AI-Assisted Development Guardrails

Both projects maintain an `.ai/` directory with 11 documentation files enforcing:

- **Pre-task checklist** — read CODING_RULES.md + SYSTEM_ARCHITECTURE.md before any implementation
- **Feature spec IDs** — CS-01…CS-20 (storefront) and AD-01…AD-17 (admin) map every screen to API endpoints
- **Task recipes** — step-by-step patterns for common tasks (CRUD page, form with validation, chart widget)
- **Icon enforcement** — Heroicons only; `@heroicons/react/24/outline` default, `/24/solid` for active/emphasis states
- **Design system reference** — 31–32 KB `DESIGN_SYSTEM.md` as single token reference; no hardcoded values permitted

---

*Generated via deep codebase analysis · `computer-store-client-frontend` + `computer-store-admin-frontend`*

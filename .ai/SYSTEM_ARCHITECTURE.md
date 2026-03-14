# SYSTEM ARCHITECTURE — computer-store-admin

## Architecture Overview
Pattern   : Admin SPA-like within Next.js App Router
Auth      : NextAuth.js with JWT + role claims
Data      : React Query (staleTime: 30s — admin needs fresh data)
Layout    : Fixed sidebar + scrollable main content
No SSG/ISR: Admin pages always server-rendered fresh (no cache)

## Layer Diagram

┌──────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                       │
│  Zustand: sidebar state, notification queue               │
│  React Query: all server data (staleTime: 30s)            │
│  NextAuth session: user info + role + accessToken         │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────────────┐
│              NEXT.JS ADMIN APP (Port 3001)                │
│                                                           │
│  middleware.ts                                            │
│  ├── All /(dashboard)/* → require valid JWT               │
│  ├── Role check per route group:                          │
│  │   /staff → role === "admin" only                       │
│  │   /inventory → role in ["warehouse","admin"]           │
│  │   /support → role in ["cskh","admin"]                  │
│  │   /products → role in ["staff","admin"]                │
│  └── Unauthorized → redirect /login?redirect=...          │
│                                                           │
│  Route Groups:                                            │
│  (auth)/      → login page (no guard)                     │
│  (dashboard)/ → AdminShell layout (sidebar + header)      │
│    └── All pages here are Server Components by default    │
│                                                           │
│  AdminShell layout.tsx:                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ AdminSidebar (fixed 280px) │ main content (flex-1)  │  │
│  │                           │ AdminHeader (top 64px)  │  │
│  │  - Logo                   │ ─────────────────────── │  │
│  │  - Nav groups             │ <page content>          │  │
│  │  - Role-filtered links    │                         │  │
│  │  - Collapse toggle        │                         │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ REST API (JWT Bearer)
┌────────────────────▼─────────────────────────────────────┐
│         NESTJS BACKEND — /admin/* endpoints               │
│  All admin endpoints: require staff/admin JWT             │
│  Role enforcement: NestJS Guards (@Roles decorator)       │
└──────────────────────────────────────────────────────────┘

## Component Architecture

┌─────────────────────────────────────────────────────────┐
│              @computer-store/ui (SHARED PACKAGE)         │
│  Button, Input, Modal, Badge, Alert, Toast, Skeleton      │
│  DataTable, StatCard, ChartWidget, FileUpload             │
│  Tabs, Accordion, Tooltip, ConfirmDialog, EmptyState      │
└────────────────┬────────────────────────────────────────┘
                 │ imported by admin repo
┌────────────────▼────────────────────────────────────────┐
│         computer-store-admin LOCAL COMPONENTS             │
│  layout/     : AdminShell, AdminSidebar, AdminHeader     │
│  dashboard/  : RevenueChart, OrderStatusChart, Alerts    │
│  products/   : ProductForm, VariantBuilder, ImageUploader│
│  orders/     : OrderStatusSelect, OrderDetail            │
│  inventory/  : ImportForm, StockHistoryTable             │
│  promotions/ : PromotionForm, DateRangePicker            │
│  support/    : TicketThread, InternalNote, AssignStaff   │
└─────────────────────────────────────────────────────────┘

## Data Fetching Strategy (Admin-specific)

### NO ISR / NO static generation in admin
# Admin needs real-time accurate data. All pages are dynamic.
# React Query config for admin:
# staleTime: 30 * 1000   (30 seconds)
# refetchOnWindowFocus: true
# refetchInterval: false  (only refetch on action)

### Pattern A: Server Component (initial load)
  Admin page → fetch data server-side → pass as initialData to React Query
  This gives instant page render + client-side refresh capability

### Pattern B: Client Component (interactive tables)
  DataTable pages → useQuery with pagination, filter, sort params
  Changes in filter → new query key → auto refetch

## Role-Based UI Rendering
# In components, use useRoleGuard hook:
  const { canAccess } = useRoleGuard();
  if (!canAccess('products', 'delete')) return null;

# AdminSidebar filters nav links based on role:
  role === 'admin'     → all nav items
  role === 'staff'     → products, orders, promotions, reviews
  role === 'warehouse' → inventory, orders (fulfillment)
  role === 'cskh'      → support, returns, customers

## Key Technical Decisions
1. Recharts for charts (not Chart.js) — better React integration
2. @tanstack/react-table for DataTable (headless, custom styled)
3. No Zustand for server data — React Query handles everything
4. Zustand only for: sidebar collapse state, notification queue
5. All forms: react-hook-form + Zod validation
6. Real-time notifications: Server-Sent Events (SSE) from backend
7. Report export: trigger backend endpoint → download file response

computer-store-admin/
├── .ai/                              # AI instruction files (10 .md files)
│   ├── README.md
│   ├── PROJECT_CONTEXT.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── CODING_RULES.md
│   ├── UI_DESIGN_SYSTEM.md
│   ├── COMPONENT_GUIDELINES.md
│   ├── FEATURE_SPEC.md
│   ├── API_CONTRACT.md
│   ├── FOLDER_STRUCTURE.md
│   └── AI_DEVELOPMENT_GUIDE.md
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Public — not protected
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx            # Minimal layout (no sidebar)
│   │   ├── (dashboard)/              # Protected by middleware
│   │   │   ├── layout.tsx            # AdminShell: sidebar + header
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # AD-01 Overview
│   │   │   │   └── loading.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # AD-02 Product list
│   │   │   │   ├── new/page.tsx      # AD-03 Add product
│   │   │   │   └── [id]/edit/page.tsx # AD-03 Edit product
│   │   │   ├── categories/page.tsx   # AD-04
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # AD-05 Order list
│   │   │   │   └── [id]/page.tsx     # AD-06 Order detail
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx          # AD-09 Stock overview
│   │   │   │   └── import/page.tsx   # AD-08 Import stock
│   │   │   ├── promotions/
│   │   │   │   ├── page.tsx          # AD-10 Promotions
│   │   │   │   └── coupons/page.tsx  # AD-11 Coupons
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx          # AD-12 Customer list
│   │   │   │   └── [id]/page.tsx     # Customer detail
│   │   │   ├── returns/
│   │   │   │   ├── page.tsx          # AD-13 Return requests
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── support/
│   │   │   │   ├── page.tsx          # AD-14 Ticket list
│   │   │   │   └── [id]/page.tsx     # Ticket detail + reply
│   │   │   ├── reviews/page.tsx      # AD-15 Review moderation
│   │   │   ├── reports/page.tsx      # AD-16 Business reports
│   │   │   └── staff/page.tsx        # Staff + roles (Admin only)
│   │   ├── api/
│   │   │   └── [...path]/route.ts    # BFF proxy to NestJS
│   │   ├── globals.css
│   │   └── layout.tsx                # Root (fonts, providers)
│   ├── components/
│   │   ├── ui/                       # ★ FROM SHARED PACKAGE
│   │   │   └── [re-exported from @computer-store/ui]
│   │   ├── layout/                   # Admin shell layout
│   │   │   ├── AdminShell.tsx        # Sidebar + Header wrapper
│   │   │   ├── AdminSidebar.tsx      # Left nav (collapsible)
│   │   │   ├── AdminHeader.tsx       # Top bar: breadcrumb + user
│   │   │   └── AdminBreadcrumb.tsx
│   │   ├── dashboard/
│   │   │   ├── RevenueChart.tsx      # Line chart (Recharts)
│   │   │   ├── OrderStatusChart.tsx  # Donut chart
│   │   │   ├── TopProductsTable.tsx
│   │   │   └── AlertBanner.tsx       # Low stock / system alerts
│   │   ├── products/
│   │   │   ├── ProductForm.tsx       # Create / edit product form
│   │   │   ├── VariantBuilder.tsx    # Manage product variants
│   │   │   ├── ImageUploader.tsx     # Multi-image drag-and-drop
│   │   │   ├── SpecEditor.tsx        # Technical specs table editor
│   │   │   └── CategoryPicker.tsx    # Tree category selector
│   │   ├── orders/
│   │   │   ├── OrderStatusSelect.tsx # Update status dropdown
│   │   │   ├── OrderTimeline.tsx     # ★ REUSED from shared types
│   │   │   └── OrderDetail.tsx
│   │   ├── inventory/
│   │   │   ├── StockLevelBadge.tsx
│   │   │   ├── ImportForm.tsx        # Phiếu nhập kho
│   │   │   └── StockHistoryTable.tsx
│   │   ├── promotions/
│   │   │   ├── PromotionForm.tsx
│   │   │   ├── CouponForm.tsx
│   │   │   └── DateRangePicker.tsx
│   │   ├── support/
│   │   │   ├── TicketThread.tsx
│   │   │   ├── InternalNote.tsx      # Staff-only note (hidden from customer)
│   │   │   └── AssignStaffSelect.tsx
│   │   └── reports/
│   │       ├── ReportFilters.tsx
│   │       └── ExportButton.tsx
│   ├── hooks/
│   │   ├── useAuth.ts                # Admin session + role check
│   │   ├── useTable.ts               # DataTable state management
│   │   ├── useNotifications.ts       # Real-time alerts
│   │   └── useRoleGuard.ts           # Page-level role permission
│   ├── lib/
│   │   ├── api.ts                    # Axios (admin JWT)
│   │   ├── auth.ts                   # NextAuth admin config
│   │   ├── formatters.ts             # VND, dates, percentages
│   │   ├── permissions.ts            # Role → allowed actions map
│   │   └── validators.ts             # Zod schemas for admin forms
│   ├── services/
│   │   ├── product.service.ts        # Admin CRUD
│   │   ├── order.service.ts
│   │   ├── inventory.service.ts
│   │   ├── promotion.service.ts
│   │   ├── customer.service.ts
│   │   ├── ticket.service.ts
│   │   ├── review.service.ts
│   │   ├── report.service.ts
│   │   └── staff.service.ts
│   ├── stores/
│   │   ├── sidebar.store.ts          # Sidebar collapsed state
│   │   └── notification.store.ts     # Alert queue
│   └── types/
│       ├── product.types.ts
│       ├── order.types.ts
│       ├── inventory.types.ts
│       ├── staff.types.ts
│       ├── report.types.ts
│       └── api.types.ts
├── public/
├── middleware.ts                     # JWT guard + role check
├── CLAUDE.md
├── .cursorrules
├── tailwind.config.ts                # Extends shared + admin theme
├── tsconfig.json
├── next.config.ts
├── .env.example
└── package.json

# ADMIN PLACEMENT RULES

? New admin page
  → src/app/(dashboard)/{route}/page.tsx
  → src/app/(dashboard)/{route}/loading.tsx
  → Add role check in middleware.ts OR useRoleGuard in page

? New DataTable page (most common pattern)
  → page.tsx uses DataTable from "@computer-store/ui"
  → service function in src/services/{resource}.service.ts
  → types in src/types/{resource}.types.ts
  → column definitions inline in page (unless reused elsewhere)

? New form (ProductForm, ImportForm, etc.)
  → src/components/{domain}/{ResourceName}Form.tsx
  → Zod schema → src/lib/validators.ts
  → Uses react-hook-form + zod resolver

? New chart
  → src/components/dashboard/{ChartName}.tsx
  → Use Recharts (never D3 or Chart.js)

? New role-restricted action
  → Check role in middleware.ts (route-level)
  → Or: useRoleGuard hook (component-level)
  → Never rely on UI hiding alone — backend enforces roles too

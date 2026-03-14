# PROJECT CONTEXT — computer-store-admin

## System Type
Internal back-office dashboard. NOT public-facing.
Manages the retail operation: products, orders, inventory, customers, support.

## User Roles (RBAC)
Staff     : Products CRUD, Promotions, Reviews moderation, Order viewing
Warehouse : Inventory in/out, Order fulfillment (packing + shipping)
CSKH      : Support tickets, Return/refund processing, Customer contact
Admin     : Full access + Business reports + Staff management + System config

## Core Modules
DASHBOARD     : KPIs, revenue charts, recent orders, low-stock alerts
PRODUCTS      : Create/edit product + variants + specs + images
CATEGORIES    : Category tree management (CRUD)
ORDERS        : View list, update status, view detail + timeline
INVENTORY     : Stock levels, import stock (PhieuNhapKho), history
PROMOTIONS    : Flash Sale, vouchers, category promotions
CUSTOMERS     : View list, detail, purchase history
RETURNS       : Review return requests, approve/reject, trigger refund
SUPPORT       : Handle tickets, assign to staff, internal notes
REVIEWS       : Moderate product reviews (approve/hide/respond)
REPORTS       : Revenue, best sellers, inventory value, export PDF/Excel
STAFF         : Create staff accounts, assign roles (Admin only)

## Screen IDs (reference from UI/UX doc)
AD-01 Dashboard  | AD-02 Product List  | AD-03 Product Form
AD-04 Categories | AD-05 Order List    | AD-06 Order Detail
AD-07 Fulfillment| AD-08 Import Stock  | AD-09 Inventory
AD-10 Promotions | AD-11 Coupons       | AD-12 Customers
AD-13 Returns    | AD-14 Support       | AD-15 Reviews
AD-16 Reports    | AD-17 Staff         | AD-18 Login

## Critical Business Rules
1. Role check on every protected page (middleware + useRoleGuard hook)
2. Admin-only pages: /staff, /reports (full), system config
3. Order status flow: pending→confirmed→packing→shipping→delivered
4. Stock update: automatic on order confirmed (deduct), on return (restore)
5. Low stock threshold: configurable per product variant (default: 10 units)
6. Ticket SLA: open tickets > 24h → show warning indicator
7. Review moderation: default pending → staff approves before public display
8. All monetary values: VND, use formatVND() from @/lib/formatters.ts
9. Data in admin is ALWAYS fresh: no ISR, use React Query with short stale time

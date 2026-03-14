# FEATURE SPECIFICATIONS — computer-store-admin

## AD-01: Dashboard Overview
Route: /dashboard  | Roles: All
Components (shared): StatCard x4, DataTable (recent orders)
Components (local): RevenueChart (LineChart), OrderStatusChart (PieChart)
                    TopProductsTable, AlertBanner (low stock)
API: GET /admin/dashboard/stats
     GET /admin/dashboard/revenue-chart?period=30d
     GET /admin/orders?limit=10&sort=-createdAt
     GET /admin/inventory?lowStock=true&limit=5

## AD-02 + AD-03: Product Management
Routes: /products (list) | /products/new | /products/:id/edit
Roles: Staff, Admin
List: DataTable (columns: Image, Name, Category, Price, Stock, Status, Actions)
Form: ProductForm (shared Input/Select/FileUpload + local VariantBuilder, SpecEditor)
API: GET /admin/products | POST /admin/products
     PUT /admin/products/:id | DELETE /admin/products/:id
     POST /admin/media/upload (multipart)
Rules: Delete requires ConfirmDialog. Cannot delete if has active orders.

## AD-05 + AD-06: Order Management
Routes: /orders (list) | /orders/:id (detail)
Roles: Staff, Admin | Warehouse (fulfillment actions only)
List: DataTable with status filter tabs (same as frontend enum)
Detail: OrderDetail + OrderTimeline + status update dropdown + note input
API: GET /admin/orders?status=&page= | GET /admin/orders/:id
     PUT /admin/orders/:id/status {status, note}
Rules: Status can only move forward (pending→confirmed→packing→shipping→delivered)
       Except: any status → cancelled (if allowed by business rule)

## AD-08 + AD-09: Inventory Management
Routes: /inventory | /inventory/import
Roles: Warehouse, Admin
Overview: DataTable (Product, SKU, Stock, Min threshold, Status, Actions)
Import: ImportForm (Supplier select, date, dynamic rows: product+qty+cost)
API: GET /admin/inventory?lowStock=&category=
     POST /admin/inventory/import (creates PhieuNhapKho)
     GET /admin/inventory/:productId/history

## AD-10 + AD-11: Promotions
Routes: /promotions | /promotions/coupons
Roles: Staff, Admin
Promotions: DataTable (Tabs: Active/Upcoming/Ended) + PromotionForm
Coupons: DataTable + CouponForm (single or batch generate)
API: GET|POST /admin/promotions | GET|POST /admin/coupons
     PUT /admin/promotions/:id | DELETE /admin/promotions/:id

## AD-14: Support Ticket Handling
Routes: /support | /support/:id
Roles: CSKH, Admin
List: DataTable (filter: status, category, assigned) + priority indicator
Detail: TicketThread + InternalNote (staff-only) + AssignStaffSelect
        + status change actions
API: GET /admin/tickets | GET /admin/tickets/:id
     PUT /admin/tickets/:id/assign {staffId}
     PUT /admin/tickets/:id/status {status}
     POST /admin/tickets/:id/messages {content, isInternal: bool}

## AD-15: Review Moderation
Route: /reviews
Roles: Staff, Admin
List: DataTable (Product, Reviewer, Rating, Content preview, Status, Actions)
Actions: Approve | Hide | Add staff reply
Filter: Pending / Approved / Hidden | By product | By rating
API: GET /admin/reviews?status=pending
     PUT /admin/reviews/:id/approve | PUT /admin/reviews/:id/hide
     POST /admin/reviews/:id/reply {content}

## AD-16: Business Reports
Route: /reports
Roles: Admin only
Sections: Revenue (date range, line chart), Top Products (table),
           Inventory Value (current snapshot), Customer activity
Export: ExportButton → GET /admin/reports/export?type=&format=excel|pdf
API: GET /admin/reports/revenue?from=&to=
     GET /admin/reports/top-products?from=&to=&limit=
     GET /admin/reports/inventory-value

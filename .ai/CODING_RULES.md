# CODING RULES — computer-store-admin
# All rules from frontend repo apply PLUS these admin-specific rules.

## RULE 1: Shared components first (same as frontend)
# ls node_modules/@computer-store/ui/src/components/
# Import from "@computer-store/ui" if exists. Never recreate.

## RULE 2: Role check on every page (admin-specific)
# Every page in (dashboard)/ must include role validation:
# Option A: middleware.ts route-level guard (preferred)
# Option B: useRoleGuard() hook in page component
# NEVER skip role check assuming middleware handles it — double-check.

## RULE 3: No ISR, no static — admin data must be fresh
# Do NOT use: export const revalidate = 3600
# Do NOT use: { cache: "force-cache" } in fetch
# DO use: React Query with staleTime: 30000
# DO use: export const dynamic = "force-dynamic" on admin pages

## RULE 4: DataTable from shared package
# NEVER build a custom table from <table> tags.
# ALWAYS use: import { DataTable } from "@computer-store/ui"
# DataTable accepts: columns (TanStack Table config), data, loading, onFilter

## RULE 5: Form validation is mandatory
# Every admin form (ProductForm, ImportForm, PromotionForm...)
# MUST use: react-hook-form + Zod schema validation
# Zod schemas go in: src/lib/validators.ts

## RULE 6: Destructive actions require ConfirmDialog
# Delete product, reject return, close ticket, ban customer
# MUST show: import { ConfirmDialog } from "@computer-store/ui"
# With typed confirmation for extra-destructive actions

## RULE 7: Violet accent — admin sidebar/header only
# bg-violet-600 and text-violet-* ONLY for AdminSidebar and AdminHeader
# Content area uses same blue primary tokens as frontend (shared)
# Admin badge status colors: same semantic colors as frontend (success/warning/error)

## RULE 8: Always show loading + error + empty in DataTable
# loading: <DataTable isLoading={true} />
# error: <DataTable error="Không thể tải dữ liệu" />
# empty: <DataTable emptyText="Không có kết quả" />

## RULE 9: No client-side role escalation
# Role info comes from JWT (server-verified). Never compute role client-side.
# Use: const { user } = useSession() — trust session.user.role only.

## RULE 10: Export reports via backend
# Never generate PDF/Excel in the browser.
# Call: GET /admin/reports/export?type=revenue&format=excel → file download

# AI DEVELOPMENT GUIDE — computer-store-admin
# Follow this workflow for every task in this repo.

## MANDATORY PRE-TASK CHECKLIST
□ Read .ai/CODING_RULES.md (admin edition)
□ Read .ai/FEATURE_SPEC.md — find the admin screen (AD-xx)
□ Check: ls node_modules/@computer-store/ui/src/components/
□ Check: find src/components -name "*.tsx" | sort
□ Identify required role for this feature

## ADMIN TASK RECIPES

# RECIPE: New CRUD page (most common)
1. Find spec in FEATURE_SPEC.md (e.g., AD-02 Products)
2. Add types to src/types/{resource}.types.ts
3. Add service to src/services/{resource}.service.ts
4. Create page at src/app/(dashboard)/{route}/page.tsx:
   a. Header row: title + action button
   b. Filter row: search input + status/category dropdowns
   c. <DataTable columns={columns} data={data} />
   d. Pagination (from DataTable or manual)
5. Create loading.tsx with skeleton table rows
6. Add route to AdminSidebar nav (with role filter)
7. Add to middleware.ts if route needs role restriction

# RECIPE: Product form (create/edit)
1. Create Zod schema in src/lib/validators.ts
2. Build form in src/components/products/ProductForm.tsx
   Using: react-hook-form + zodResolver
   Shared components: Input, Select, Textarea, FileUpload, Button
   Local components: VariantBuilder, SpecEditor, CategoryPicker
3. Page: /products/new → create mode | /products/:id/edit → edit mode

# RECIPE: Dashboard widget
1. Fetch data from /admin/dashboard/stats
2. Use StatCard from "@computer-store/ui" for KPI boxes
3. Use local RevenueChart (Recharts LineChart) for trend charts
4. Use DataTable from shared for recent orders table

# RECIPE: Role-protected page
// Option A — middleware.ts (preferred for route-level):
import { getToken } from 'next-auth/jwt';
if (pathname.startsWith("/staff") && token.role !== "admin") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

// Option B — page level with hook:
const { hasRole } = useRoleGuard();
if (!hasRole("admin")) return <Unauthorized />;

## ANTI-PATTERNS (admin-specific)
  ✗ Building custom <table> instead of DataTable from shared
  ✗ Using ISR/cache on admin pages (data must be fresh)
  ✗ Hiding UI elements as the only auth check (backend must also check)
  ✗ Using violet-600 colors outside AdminSidebar/AdminHeader
  ✗ Creating form without Zod validation
  ✗ Destructive action without ConfirmDialog
  ✗ Generating files client-side (PDFs must come from backend)
  ✗ Storing server data in Zustand store

# COMPONENT GUIDELINES — computer-store-admin

## Shared package components (NEVER recreate)
All base UI: Button, Input, Select, Modal, Drawer, Tabs, Badge, Alert...
Data display: DataTable, StatCard, ChartWidget, FileUpload, ConfirmDialog

## DataTable Pattern (most used in admin)
# ALWAYS import from shared package:
import { DataTable } from "@computer-store/ui";

# Column definition pattern (TanStack Table):
const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Tên sản phẩm", ... },
  { accessorKey: "status", header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { id: "actions", cell: ({ row }) => <ActionMenu item={row.original} />,
  },
];

## StatCard Pattern (dashboard)
import { StatCard } from "@computer-store/ui";
<StatCard
  title="Doanh thu hôm nay"
  value={formatVND(stats.todayRevenue)}
  change={+12.5}  // percentage
  icon={<DollarIcon />}
  trend="up"
/>

## Chart Pattern (local, using Recharts)
// src/components/dashboard/RevenueChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// Use primary-600 (#2563EB) for main chart line
// Use slate-200 (#E2E8F0) for grid lines
// Use DM Sans font in chart tooltips

## Admin Form Pattern (ProductForm, ImportForm, etc.)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validators';
import { Input, Select, FileUpload, Button } from '@computer-store/ui';

## AdminSidebar Nav Item (role-filtered)
// Always check role before rendering nav item:
const navItems = allNavItems.filter(item =>
  item.roles.includes(session.user.role)
);

## Page Template (Admin)
// Every admin page follows this structure:
// 1. Page heading + action button (top row)
// 2. Filter bar (search + dropdowns)
// 3. DataTable (main content)
// 4. Pagination (bottom)

// Header pattern:
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-slate-900">Quản lý Sản phẩm</h1>
  <Button variant="primary" href="/products/new">+ Thêm sản phẩm</Button>
</div>

import type { VaiTro } from "@/src/types/role.types";

// ─── Predefined permission keys grouped by domain ─────────────────────────────

export const PERMISSION_GROUPS: { group: string; permissions: string[] }[] = [
  {
    group: "Sản phẩm",
    permissions: [
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.publish",
    ],
  },
  {
    group: "Đơn hàng",
    permissions: [
      "orders.view",
      "orders.confirm",
      "orders.cancel",
      "orders.refund",
      "orders.export",
    ],
  },
  {
    group: "Khách hàng",
    permissions: [
      "customers.view",
      "customers.edit",
      "customers.ban",
      "customers.delete",
    ],
  },
  {
    group: "Kho hàng",
    permissions: [
      "inventory.view",
      "inventory.import",
      "inventory.adjust",
      "inventory.export",
    ],
  },
  {
    group: "Khuyến mãi",
    permissions: [
      "promotions.view",
      "promotions.create",
      "promotions.edit",
      "promotions.delete",
    ],
  },
  {
    group: "Báo cáo",
    permissions: [
      "reports.view",
      "reports.export",
    ],
  },
  {
    group: "Hỗ trợ",
    permissions: [
      "support.view",
      "support.reply",
      "support.close",
    ],
  },
  {
    group: "Nhân viên & Vai trò",
    permissions: [
      "staff.view",
      "staff.create",
      "staff.edit",
      "staff.delete",
      "roles.view",
      "roles.create",
      "roles.edit",
      "roles.delete",
    ],
  },
  {
    group: "Cài đặt hệ thống",
    permissions: [
      "settings.view",
      "settings.edit",
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions);

// ─── Mock roles ───────────────────────────────────────────────────────────────

export const MOCK_ROLES: VaiTro[] = [
  {
    id: "role-001",
    name: "Admin",
    description: "Toàn quyền truy cập hệ thống. Có thể quản lý tất cả tính năng và cấu hình.",
    permissions: ALL_PERMISSIONS,
    employeeCount: 2,
    createdAt: "2025-06-01T07:00:00Z",
    assignments: [
      {
        id: "assign-001",
        employeeId: "nv-001",
        employeeName: "Nguyễn Văn Hùng",
        employeeEmail: "hung.nguyen@techstore.vn",
        roleId: "role-001",
        assignedAt: "2025-06-01T07:00:00Z",
      },
      {
        id: "assign-002",
        employeeId: "nv-002",
        employeeName: "Trần Thị Mai",
        employeeEmail: "mai.tran@techstore.vn",
        roleId: "role-001",
        assignedAt: "2025-09-15T08:30:00Z",
      },
    ],
  },
  {
    id: "role-002",
    name: "Nhân viên bán hàng",
    description: "Quản lý sản phẩm, đơn hàng và khuyến mãi. Không có quyền truy cập cài đặt và báo cáo tài chính.",
    permissions: [
      "products.view", "products.create", "products.edit", "products.publish",
      "orders.view", "orders.confirm", "orders.cancel",
      "customers.view",
      "promotions.view", "promotions.create", "promotions.edit",
    ],
    employeeCount: 4,
    createdAt: "2025-06-01T07:00:00Z",
    assignments: [
      {
        id: "assign-003",
        employeeId: "nv-003",
        employeeName: "Lê Minh Tuấn",
        employeeEmail: "tuan.le@techstore.vn",
        roleId: "role-002",
        assignedAt: "2025-07-10T09:00:00Z",
      },
      {
        id: "assign-004",
        employeeId: "nv-004",
        employeeName: "Phạm Thị Hoa",
        employeeEmail: "hoa.pham@techstore.vn",
        roleId: "role-002",
        assignedAt: "2025-08-01T08:00:00Z",
      },
      {
        id: "assign-005",
        employeeId: "nv-005",
        employeeName: "Hoàng Văn Nam",
        employeeEmail: "nam.hoang@techstore.vn",
        roleId: "role-002",
        assignedAt: "2025-10-20T10:00:00Z",
      },
      {
        id: "assign-006",
        employeeId: "nv-006",
        employeeName: "Vũ Thị Lan",
        employeeEmail: "lan.vu@techstore.vn",
        roleId: "role-002",
        assignedAt: "2025-11-05T08:30:00Z",
      },
    ],
  },
  {
    id: "role-003",
    name: "Quản lý kho",
    description: "Quản lý nhập/xuất kho và kiểm soát tồn kho. Có quyền xem đơn hàng để phối hợp xuất hàng.",
    permissions: [
      "inventory.view", "inventory.import", "inventory.adjust", "inventory.export",
      "orders.view", "orders.confirm",
      "products.view",
    ],
    employeeCount: 3,
    createdAt: "2025-06-15T08:00:00Z",
    assignments: [
      {
        id: "assign-007",
        employeeId: "nv-007",
        employeeName: "Đỗ Văn Khánh",
        employeeEmail: "khanh.do@techstore.vn",
        roleId: "role-003",
        assignedAt: "2025-06-15T08:00:00Z",
      },
      {
        id: "assign-008",
        employeeId: "nv-008",
        employeeName: "Bùi Thị Ngọc",
        employeeEmail: "ngoc.bui@techstore.vn",
        roleId: "role-003",
        assignedAt: "2025-09-01T07:30:00Z",
      },
      {
        id: "assign-009",
        employeeId: "nv-009",
        employeeName: "Trương Văn Đức",
        employeeEmail: "duc.truong@techstore.vn",
        roleId: "role-003",
        assignedAt: "2025-12-10T09:00:00Z",
      },
    ],
  },
  {
    id: "role-004",
    name: "Chăm sóc khách hàng",
    description: "Xử lý yêu cầu hỗ trợ, hoàn trả và khiếu nại của khách hàng.",
    permissions: [
      "support.view", "support.reply", "support.close",
      "orders.view", "orders.refund",
      "customers.view", "customers.edit",
    ],
    employeeCount: 3,
    createdAt: "2025-07-01T08:00:00Z",
    assignments: [
      {
        id: "assign-010",
        employeeId: "nv-010",
        employeeName: "Nguyễn Thị Thu",
        employeeEmail: "thu.nguyen@techstore.vn",
        roleId: "role-004",
        assignedAt: "2025-07-01T08:00:00Z",
      },
      {
        id: "assign-011",
        employeeId: "nv-011",
        employeeName: "Phan Văn Bình",
        employeeEmail: "binh.phan@techstore.vn",
        roleId: "role-004",
        assignedAt: "2025-08-15T09:00:00Z",
      },
      {
        id: "assign-012",
        employeeId: "nv-012",
        employeeName: "Cao Thị Yến",
        employeeEmail: "yen.cao@techstore.vn",
        roleId: "role-004",
        assignedAt: "2026-01-10T08:00:00Z",
      },
    ],
  },
  {
    id: "role-005",
    name: "Phân tích dữ liệu",
    description: "Chỉ có quyền xem và xuất báo cáo. Không thể chỉnh sửa dữ liệu.",
    permissions: [
      "reports.view", "reports.export",
      "orders.view",
      "products.view",
      "customers.view",
      "inventory.view",
    ],
    employeeCount: 1,
    createdAt: "2025-10-01T09:00:00Z",
    assignments: [
      {
        id: "assign-013",
        employeeId: "nv-013",
        employeeName: "Đinh Văn Long",
        employeeEmail: "long.dinh@techstore.vn",
        roleId: "role-005",
        assignedAt: "2025-10-01T09:00:00Z",
      },
    ],
  },
  {
    id: "role-006",
    name: "Biên tập nội dung",
    description: "Tạo và quản lý nội dung sản phẩm, SEO và khuyến mãi. Không có quyền xuất bản trực tiếp.",
    permissions: [
      "products.view", "products.create", "products.edit",
      "promotions.view", "promotions.create", "promotions.edit",
    ],
    employeeCount: 2,
    createdAt: "2026-01-15T08:00:00Z",
    assignments: [
      {
        id: "assign-014",
        employeeId: "nv-014",
        employeeName: "Lý Thị Hương",
        employeeEmail: "huong.ly@techstore.vn",
        roleId: "role-006",
        assignedAt: "2026-01-15T08:00:00Z",
      },
      {
        id: "assign-015",
        employeeId: "nv-015",
        employeeName: "Tăng Minh Quân",
        employeeEmail: "quan.tang@techstore.vn",
        roleId: "role-006",
        assignedAt: "2026-02-01T08:30:00Z",
      },
    ],
  },
];

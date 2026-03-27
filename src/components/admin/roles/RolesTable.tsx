"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  ShieldCheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { DataTable, type ColumnDef, type SortDir } from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { RoleFormModal } from "@/src/components/admin/roles/RoleFormModal";
import Link from "next/link";
import { bulkDeleteRoles, deleteRole } from "@/src/services/role.service";
import type { VaiTro, NhanVienVaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RolesTableProps {
  initialRoles: VaiTro[];
}

type RoleRow = VaiTro & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RolesTable({ initialRoles }: RolesTableProps) {
  const { showToast } = useToast();

  // ── Local data ────────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<VaiTro[]>(initialRoles);

  // ── Search / sort / page ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Delete state ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<VaiTro | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<VaiTro | null>(null);

  // ── Filter + sort + paginate ──────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search) return roles;
    const lower = search.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower)
    );
  }, [roles, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") cmp = av.localeCompare(bv);
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalRows = sorted.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<RoleRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Tên vai trò",
        sortable: true,
        width: "w-48",
        render: (_, row) => (
          <span className="font-medium text-secondary-900">{row.name}</span>
        ),
      },
      {
        key: "description",
        header: "Mô tả",
        render: (_, row) => (
          <span className="text-sm text-secondary-600 line-clamp-2">
            {row.description}
          </span>
        ),
      },
      {
        key: "permissions",
        header: "Số quyền",
        align: "center",
        width: "w-28",
        render: (_, row) => (
          <Badge variant="primary" size="sm">
            {row.permissions.length} quyền
          </Badge>
        ),
      },
      {
        key: "employeeCount",
        header: "Nhân viên",
        align: "center",
        width: "w-32",
        sortable: true,
        render: (_, row) => (
          <span className="text-sm text-secondary-700">
            {row.employeeCount}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        sortable: true,
        width: "w-32",
        render: (_, row) => (
          <span className="text-sm text-secondary-500">{formatDate(row.createdAt)}</span>
        ),
      },
      {
        key: "_actions",
        header: "",
        width: "w-20",
        align: "right",
        render: (_, row): ReactNode => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label="Chỉnh sửa vai trò"
              onClick={() => { setEditRole(row as VaiTro); setModalOpen(true); }}
              className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Xóa vai trò"
              onClick={() => setDeleteTarget(row as VaiTro)}
              className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-error-50 hover:text-error-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // ── Sub-row renderer (NhanVienVaiTro) ─────────────────────────────────────

  const getSubRows = useCallback(
    (row: RoleRow) => {
      const assignments = row.assignments as NhanVienVaiTro[];
      return assignments?.length ? (assignments as unknown as Record<string, unknown>[]) : undefined;
    },
    []
  );

  const renderSubRow = useCallback(
    (subRow: Record<string, unknown>): ReactNode => {
      const assignment = subRow as unknown as NhanVienVaiTro;
      // Span: checkbox(1) + expand(1) + 6 columns = 8 total
      return (
        <tr className="bg-secondary-50/60">
          {/* Checkbox placeholder */}
          <td className="w-10 px-4 py-2.5" />
          {/* Expand placeholder */}
          <td className="w-8 px-2 py-2.5" />
          {/* Employee name — aligns with "Tên vai trò" column */}
          <td className="px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary-100 text-center text-xs leading-6 font-medium text-primary-700">
                {assignment.employeeName.charAt(0)}
              </div>
              <Link
                href={`/employees/${assignment.employeeId}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                {assignment.employeeName}
              </Link>
            </div>
          </td>
          {/* Email — aligns with "Mô tả" column */}
          <td className="px-4 py-2.5 text-sm text-secondary-500">{assignment.employeeEmail}</td>
          {/* Empty — aligns with "Số quyền" */}
          <td className="px-4 py-2.5" />
          {/* Empty — aligns with "Nhân viên" */}
          <td className="px-4 py-2.5" />
          {/* Assigned date — aligns with "Ngày tạo" */}
          <td className="px-4 py-2.5 text-sm text-secondary-400">
            {formatDate(assignment.assignedAt)}
          </td>
          {/* Actions placeholder */}
          <td className="px-4 py-2.5" />
        </tr>
      );
    },
    []
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRole(deleteTarget.id);
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xóa vai trò.", "success");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, showToast]);

  const handleBulkDelete = useCallback((keys: string[]) => {
    if (keys.length > 0) setBulkDeleteTargets(keys);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setIsBulkDeleting(true);
    try {
      await bulkDeleteRoles(bulkDeleteTargets);
      setRoles((prev) => prev.filter((r) => !bulkDeleteTargets.includes(r.id)));
      setBulkDeleteTargets([]);
      showToast(`Đã xóa ${bulkDeleteTargets.length} vai trò.`, "success");
    } finally {
      setIsBulkDeleting(false);
    }
  }, [bulkDeleteTargets, showToast]);

  const handleSaved = useCallback((saved: VaiTro) => {
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...saved };
        return next;
      }
      return [saved, ...prev];
    });
    showToast(editRole ? "Đã cập nhật vai trò." : "Đã tạo vai trò mới.", "success");
  }, [editRole, showToast]);

  const openCreateModal = useCallback(() => {
    setEditRole(null);
    setModalOpen(true);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <DataTable
        data={pageData as unknown as RoleRow[]}
        columns={columns}
        keyField="id"
        selectable
        bulkActions={[
          {
            id: "bulk-delete",
            label: "Xóa đã chọn",
            isDanger: true,
            onClick: handleBulkDelete,
          },
        ]}
        getSubRows={getSubRows}
        renderSubRow={renderSubRow}
        expandedByDefault={false}
        searchQuery={search}
        onSearchChange={(q) => { setSearch(q); setPage(1); }}
        searchPlaceholder="Tìm theo tên vai trò…"
        toolbarActions={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
          >
            <PlusIcon className="h-4 w-4" />
            Thêm vai trò
          </Button>
        }
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(k, d) => { setSortKey(k); setSortDir(d); setPage(1); }}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        emptyMessage="Không tìm thấy vai trò nào."
        emptyIcon={<ShieldCheckIcon className="h-12 w-12" />}
        emptyAction={
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            Thêm vai trò đầu tiên
          </Button>
        }
      />

      {/* Create / Edit modal */}
      <RoleFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        role={editRole}
        onSaved={handleSaved}
      />

      {/* Single delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa vai trò"
        variant="danger"
        isConfirming={isDeleting}
        requiredPhrase={deleteTarget?.name}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        isOpen={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={handleBulkDeleteConfirm}
        title={`Xóa ${bulkDeleteTargets.length} vai trò`}
        description="Tất cả vai trò đã chọn sẽ bị xóa vĩnh viễn. Nhân viên thuộc các vai trò này sẽ mất quyền liên quan."
        confirmLabel="Xóa tất cả"
        variant="danger"
        isConfirming={isBulkDeleting}
        requiredPhrase="DELETE"
      />
    </>
  );
}

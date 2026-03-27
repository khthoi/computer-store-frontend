"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  PlusIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { AddressFormModal } from "@/src/components/admin/customers/AddressFormModal";
import {
  deleteAddress,
  setDefaultAddress,
} from "@/src/services/customer.service";
import type { DiaChiGiaoHang } from "@/src/types/customer.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerAddressesTableProps {
  customerId: string;
  initialAddresses: DiaChiGiaoHang[];
}

type AddressRow = DiaChiGiaoHang & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerAddressesTable({
  customerId,
  initialAddresses,
}: CustomerAddressesTableProps) {
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<DiaChiGiaoHang[]>(initialAddresses);
  const [deleteTarget, setDeleteTarget] = useState<DiaChiGiaoHang | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<DiaChiGiaoHang | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return addresses.slice(start, start + pageSize);
  }, [addresses, page, pageSize]);

  const handleSetDefault = useCallback(async (addr: DiaChiGiaoHang) => {
    await setDefaultAddress(customerId, addr.id);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addr.id }))
    );
    showToast("Đã đặt địa chỉ mặc định.", "success");
  }, [customerId, showToast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAddress(customerId, deleteTarget.id);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xóa địa chỉ.", "success");
    } finally {
      setIsDeleting(false);
    }
  }, [customerId, deleteTarget, showToast]);

  const handleSaved = useCallback((saved: DiaChiGiaoHang) => {
    setAddresses((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        // If saved.isDefault, clear other defaults
        return saved.isDefault
          ? next.map((a) => ({ ...a, isDefault: a.id === saved.id }))
          : next;
      }
      // New address — if isDefault, clear others
      const newList = saved.isDefault
        ? prev.map((a) => ({ ...a, isDefault: false }))
        : [...prev];
      return [...newList, saved];
    });
    showToast(editAddress ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ mới.", "success");
  }, [editAddress, showToast]);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<AddressRow>[] = useMemo(
    () => [
      {
        key: "recipientName",
        header: "Người nhận",
        render: (_, row) => (
          <span className="font-medium text-secondary-900">{row.recipientName}</span>
        ),
      },
      {
        key: "phone",
        header: "Điện thoại",
        width: "w-32",
        render: (_, row) => (
          <span className="text-sm text-secondary-600">{row.phone}</span>
        ),
      },
      {
        key: "addressLine",
        header: "Địa chỉ",
        tooltip: (_, row) =>
          [row.addressLine, row.ward, row.district, row.province]
            .filter(Boolean).join(", "),
        render: (_, row) => {
          const full = [row.addressLine, row.ward, row.district, row.province]
            .filter(Boolean).join(", ");
          return <span className="text-sm text-secondary-600">{full}</span>;
        },
      },
      {
        key: "isDefault",
        header: "Mặc định",
        width: "w-28",
        align: "center",
        render: (_, row) =>
          row.isDefault ? (
            <Badge variant="success" size="sm" dot>Mặc định</Badge>
          ) : null,
      },
      {
        key: "createdAt",
        header: "Ngày thêm",
        width: "w-28",
        render: (_, row) => (
          <span className="text-sm text-secondary-500">{formatDate(row.createdAt as string)}</span>
        ),
      },
      {
        key: "_actions",
        header: "",
        width: "w-28",
        align: "right",
        render: (_, row): ReactNode => (
          <div className="flex items-center justify-end gap-1">
            {!row.isDefault && (
              <button
                type="button"
                aria-label="Đặt làm mặc định"
                onClick={() => handleSetDefault(row as DiaChiGiaoHang)}
                className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-warning-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <StarIcon className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              aria-label="Chỉnh sửa địa chỉ"
              onClick={() => { setEditAddress(row as DiaChiGiaoHang); setModalOpen(true); }}
              className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Xóa địa chỉ"
              onClick={() => setDeleteTarget(row as DiaChiGiaoHang)}
              className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 transition-colors hover:bg-error-50 hover:text-error-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const openCreate = useCallback(() => {
    setEditAddress(null);
    setModalOpen(true);
  }, []);

  return (
    <>
      <DataTable
        data={pageData as AddressRow[]}
        columns={columns}
        keyField="id"
        page={page}
        searchPlaceholder="Tìm kiếm địa chỉ..."
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 25]}
        totalRows={addresses.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        hidePagination={addresses.length <= pageSize}
        toolbarActions={
          <Button variant="secondary" size="sm" onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            Thêm địa chỉ
          </Button>
        }
        emptyMessage="Khách hàng chưa có địa chỉ giao hàng."
        emptyIcon={<MapPinIcon className="h-12 w-12" />}
        emptyAction={
          <Button variant="primary" size="sm" onClick={openCreate}>
            Thêm địa chỉ đầu tiên
          </Button>
        }
      />

      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customerId={customerId}
        address={editAddress}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa địa chỉ giao hàng"
        description={`Bạn có chắc chắn muốn xóa địa chỉ của "${deleteTarget?.recipientName}"?`}
        confirmLabel="Xóa địa chỉ"
        variant="danger"
        isConfirming={isDeleting}
      />
    </>
  );
}

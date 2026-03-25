"use client";

import { useCallback, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { ToastMessage } from "@/src/components/ui/Toast";
import { AddressCard } from "@/src/components/account/addresses/AddressCard";
import { AddressFormModal } from "@/src/components/account/addresses/AddressFormModal";
import { DeleteAddressDialog } from "@/src/components/account/addresses/DeleteAddressDialog";
import type { Address } from "@/src/app/(storefront)/account/addresses/_mock_data";

// ─── Types ────────────────────────────────────────────────────────────────────

type AddressFormData = Omit<Address, "id" | "isDefault"> & { isDefault: boolean };

export interface AddressPageInnerProps {
  initialAddresses: Address[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AddressPageInner — client root for /account/addresses.
 *
 * Manages full local CRUD on the address list with optimistic updates
 * and a toast notification after each mutation.
 */
export function AddressPageInner({ initialAddresses }: AddressPageInnerProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({ visible: false, type: "success", message: "" });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ visible: true, type, message });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setFormModalOpen(true);
  };

  const handleFormSave = useCallback(
    async (data: AddressFormData, id?: string) => {
      setIsSaving(true);
      try {
        await new Promise<void>((r) => setTimeout(r, 700));

        setAddresses((prev) => {
          let next: Address[];

          if (id) {
            // Edit existing
            next = prev.map((a) =>
              a.id === id ? { ...a, ...data } : a
            );
          } else {
            // Add new — generate a local id
            const newAddr: Address = {
              ...data,
              id: `addr-${Date.now()}`,
            };
            next = [...prev, newAddr];
          }

          // Ensure only one default
          if (data.isDefault) {
            next = next.map((a) => ({
              ...a,
              isDefault: a.id === (id ?? next[next.length - 1]?.id),
            }));
          }

          return next;
        });

        setFormModalOpen(false);
        showToast("success", id ? "Địa chỉ đã được cập nhật." : "Địa chỉ mới đã được thêm.");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleDeleteRequest = (address: Address) => {
    setDeletingAddress(address);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await new Promise<void>((r) => setTimeout(r, 600));
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setDeleteDialogOpen(false);
      showToast("success", "Địa chỉ đã được xóa.");
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const handleSetDefault = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    showToast("success", "Đã đặt địa chỉ mặc định.");
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-secondary-200 bg-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold text-secondary-900">
          Địa chỉ giao hàng
        </h1>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon />}
          onClick={handleAddNew}
        >
          Thêm địa chỉ
        </Button>
      </div>

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-secondary-400">
          <p className="text-sm">Bạn chưa có địa chỉ nào.</p>
          <Button variant="outline" size="sm" onClick={handleAddNew}>
            Thêm địa chỉ đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <AddressFormModal
        address={editingAddress}
        isOpen={formModalOpen}
        isLoading={isSaving}
        onClose={() => setFormModalOpen(false)}
        onSave={handleFormSave}
      />

      {/* Delete dialog */}
      <DeleteAddressDialog
        address={deletingAddress}
        isOpen={deleteDialogOpen}
        isLoading={isDeleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast */}
      <ToastMessage
        isVisible={toast.visible}
        type={toast.type}
        message={toast.message}
        position="top-right"
        duration={3500}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}

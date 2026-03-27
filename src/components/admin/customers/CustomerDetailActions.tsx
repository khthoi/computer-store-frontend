"use client";

import { useCallback, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { CustomerFormModal } from "@/src/components/admin/customers/CustomerFormModal";
import { useToast } from "@/src/components/ui/Toast";
import type { KhachHang } from "@/src/types/customer.types";

export interface CustomerDetailActionsProps {
  customer: KhachHang;
}

export function CustomerDetailActions({ customer }: CustomerDetailActionsProps) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaved = useCallback(() => {
    showToast("Đã cập nhật thông tin khách hàng.", "success");
    setModalOpen(false);
  }, [showToast]);

  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        <PencilSquareIcon className="h-4 w-4" />
        Chỉnh sửa
      </Button>

      <CustomerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={customer}
        onSaved={handleSaved}
      />
    </>
  );
}

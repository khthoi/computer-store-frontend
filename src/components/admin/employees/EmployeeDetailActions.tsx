"use client";

import { useCallback, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { EmployeeFormModal } from "@/src/components/admin/employees/EmployeeFormModal";
import { useToast } from "@/src/components/ui/Toast";
import type { NhanVien } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

export interface EmployeeDetailActionsProps {
  employee: NhanVien;
  allRoles: VaiTro[];
}

/**
 * Client wrapper that provides the Edit button and EmployeeFormModal
 * on the server-rendered Employee Detail page.
 */
export function EmployeeDetailActions({ employee, allRoles }: EmployeeDetailActionsProps) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaved = useCallback(() => {
    showToast("Đã cập nhật thông tin nhân viên.", "success");
    // The server page will re-render on next navigation; for now, just close.
    setModalOpen(false);
  }, [showToast]);

  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        <PencilSquareIcon className="h-4 w-4" />
        Chỉnh sửa
      </Button>

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={employee}
        allRoles={allRoles}
        onSaved={handleSaved}
      />
    </>
  );
}

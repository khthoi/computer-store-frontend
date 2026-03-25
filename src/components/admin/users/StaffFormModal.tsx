"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffFormData {
  fullName: string;
  email: string;
  role: "admin" | "manager" | "staff" | "support";
  department: string;
  active: boolean;
}

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => void | Promise<void>;
  initialData?: Partial<StaffFormData>;
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Nhân viên" },
  { value: "support", label: "CSKH" },
];

const DEPARTMENT_OPTIONS = [
  { value: "sales", label: "Kinh doanh" },
  { value: "support", label: "CSKH" },
  { value: "warehouse", label: "Kho vận" },
  { value: "marketing", label: "Marketing" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function StaffFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
}: StaffFormModalProps) {
  const isEdit = Boolean(initialData && Object.keys(initialData).length > 0);

  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState<StaffFormData["role"]>(
    initialData?.role ?? "staff"
  );
  const [department, setDepartment] = useState(initialData?.department ?? "");
  const [active, setActive] = useState(initialData?.active ?? true);

  // Sync when modal opens with new initialData
  useEffect(() => {
    if (isOpen) {
      setFullName(initialData?.fullName ?? "");
      setEmail(initialData?.email ?? "");
      setRole(initialData?.role ?? "staff");
      setDepartment(initialData?.department ?? "");
      setActive(initialData?.active ?? true);
    }
  }, [isOpen, initialData]);

  const isValid = fullName.trim() !== "" && email.trim() !== "";

  async function handleSubmit() {
    if (!isValid) return;
    await onSave({ fullName, email, role, department, active });
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        Hủy
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isSaving || !isValid}
        isLoading={isSaving}
      >
        {isSaving
          ? "Đang lưu…"
          : isEdit
          ? "Lưu"
          : "Gửi lời mời"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Sửa nhân viên" : "Mời nhân viên mới"}
      size="lg"
      footer={footer}
      animated
    >
      <div className="flex flex-col gap-4">
        {/* Full name */}
        <Input
          label="Họ và tên"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
          autoComplete="name"
        />

        {/* Email */}
        <Input
          label="Email công việc"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nhanvien@company.com"
          autoComplete="email"
        />

        {/* Role */}
        <Select
          label="Vai trò"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(v) => setRole(v as StaffFormData["role"])}
          placeholder="Chọn vai trò…"
        />

        {/* Department */}
        <Select
          label="Bộ phận"
          options={DEPARTMENT_OPTIONS}
          value={department}
          onChange={(v) => setDepartment(v as string)}
          placeholder="Chọn bộ phận…"
          clearable
        />

        {/* Active toggle */}
        <div className="pt-1">
          <Toggle
            label="Kích hoạt ngay"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}

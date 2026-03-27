"use client";

import { useCallback, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { createRole, updateRole } from "@/src/services/role.service";
import { PERMISSION_GROUPS } from "@/src/app/(dashboard)/roles/_mock";
import type { VaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Provide to edit an existing role; omit to create a new one */
  role?: VaiTro | null;
  onSaved: (role: VaiTro) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoleFormModal({ isOpen, onClose, role, onSaved }: RoleFormModalProps) {
  const isEdit = Boolean(role);

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions ?? []
  );
  const [nameError, setNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens with new data
  const handleOpen = useCallback(() => {
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setSelectedPermissions(role?.permissions ?? []);
    setNameError("");
  }, [role]);

  const togglePermission = useCallback((perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }, []);

  const toggleGroup = useCallback((groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)));
    } else {
      setSelectedPermissions((prev) => {
        const next = new Set(prev);
        groupPerms.forEach((p) => next.add(p));
        return Array.from(next);
      });
    }
  }, [selectedPermissions]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("Tên vai trò không được để trống.");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = isEdit && role
        ? await updateRole(role.id, { name: name.trim(), description: description.trim(), permissions: selectedPermissions })
        : await createRole({ name: name.trim(), description: description.trim(), permissions: selectedPermissions });
      onSaved(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, role, name, description, selectedPermissions, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
      size="xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo vai trò"}
          </Button>
        </>
      }
    >
      {/* Reset form values when modal re-opens */}
      {isOpen && <span className="hidden" onLoad={handleOpen as never} />}

      <div className="space-y-5">
        {/* Name */}
        <Input
          label="Tên vai trò"
          placeholder="VD: Quản lý kho"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(""); }}
          errorMessage={nameError}
          required
        />

        {/* Description */}
        <Textarea
          label="Mô tả"
          placeholder="Mô tả ngắn về vai trò này và phạm vi quyền hạn…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Permissions */}
        <div>
          <p className="mb-3 text-sm font-medium text-secondary-700">
            Quyền hạn ({selectedPermissions.length} / {PERMISSION_GROUPS.flatMap((g) => g.permissions).length} đã chọn)
          </p>
          <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border border-secondary-200 p-4">
            {PERMISSION_GROUPS.map((group) => {
              const groupPerms = group.permissions;
              const selectedCount = groupPerms.filter((p) => selectedPermissions.includes(p)).length;
              const allSelected = selectedCount === groupPerms.length;
              const someSelected = selectedCount > 0 && !allSelected;

              return (
                <div key={group.group}>
                  {/* Group header with select-all */}
                  <div className="mb-2 flex items-center gap-2">
                    <Checkbox
                      size="sm"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={() => toggleGroup(groupPerms)}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                      {group.group}
                    </span>
                  </div>
                  {/* Individual permissions */}
                  <div className="grid grid-cols-2 gap-1.5 pl-6">
                    {groupPerms.map((perm) => (
                      <label
                        key={perm}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-secondary-50"
                      >
                        <Checkbox
                          size="sm"
                          checked={selectedPermissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                        />
                        <span className="text-xs text-secondary-700">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

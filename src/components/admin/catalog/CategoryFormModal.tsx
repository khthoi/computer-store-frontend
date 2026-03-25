"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryFormData {
  name: string;
  slug: string;
  parentId?: string;
  description: string;
  displayOrder: number;
  active: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void | Promise<void>;
  initialData?: Partial<CategoryFormData>;
  parentOptions?: { value: string; label: string }[];
  isSaving?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  parentOptions = [],
  isSaving = false,
}: CategoryFormModalProps) {
  const isEdit = Boolean(initialData && Object.keys(initialData).length > 0);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [parentId, setParentId] = useState(initialData?.parentId ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [active, setActive] = useState(initialData?.active ?? true);

  // Sync form when initialData changes (e.g. opening edit modal)
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? "");
      setSlug(initialData?.slug ?? "");
      setParentId(initialData?.parentId ?? "");
      setDescription(initialData?.description ?? "");
      setDisplayOrder(initialData?.displayOrder ?? 0);
      setActive(initialData?.active ?? true);
    }
  }, [isOpen, initialData]);

  function handleAutoSlug() {
    setSlug(generateSlug(name));
  }

  async function handleSubmit() {
    await onSave({
      name,
      slug,
      parentId: parentId || undefined,
      description,
      displayOrder,
      active,
    });
  }

  const parentSelectOptions = [
    ...parentOptions,
  ];

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        Hủy
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isSaving || !name.trim()}
        isLoading={isSaving}
      >
        {isSaving ? "Đang lưu…" : "Lưu"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Sửa danh mục" : "Thêm danh mục"}
      size="lg"
      footer={footer}
      animated
    >
      <div className="flex flex-col gap-4">
        {/* Name */}
        <Input
          label="Tên danh mục"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Linh kiện máy tính"
        />

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Đường dẫn (slug)"
                className="font-mono"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="vi-du-linh-kien-may-tinh"
              />
            </div>
            <button
              type="button"
              onClick={handleAutoSlug}
              className="mb-0.5 h-10 shrink-0 rounded-lg border border-secondary-200 bg-secondary-50 px-3 text-xs font-medium text-secondary-600 hover:bg-secondary-100 transition-colors whitespace-nowrap"
            >
              Tự động tạo
            </button>
          </div>
        </div>

        {/* Parent category */}
        <Select
          label="Danh mục cha"
          options={parentSelectOptions}
          value={parentId}
          onChange={(v) => setParentId(v as string)}
          placeholder="(Không có)"
          clearable
        />

        {/* Description */}
        <Textarea
          label="Mô tả"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về danh mục này…"
        />

        {/* Display order */}
        <Input
          label="Thứ tự hiển thị"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
          min={0}
        />

        {/* Active toggle */}
        <div className="pt-1">
          <Toggle
            label="Kích hoạt"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}

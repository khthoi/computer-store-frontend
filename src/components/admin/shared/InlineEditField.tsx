"use client";

import { useEffect, useRef, useState } from "react";
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "number" | "select" | "textarea";

export interface InlineEditFieldProps {
  value: string;
  fieldType?: FieldType;
  onSave: (newValue: string) => Promise<void> | void;
  label?: string;
  /** Custom display formatter for view mode */
  formatDisplay?: (v: string) => string;
  /** Options for fieldType="select" */
  selectOptions?: { value: string; label: string }[];
  isLoading?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * InlineEditField — click-to-edit field for admin detail views.
 *
 * View mode: renders formatted value + pencil icon (visible on hover).
 * Edit mode: renders Input / Textarea / Select with Save + Cancel buttons.
 * Save action shows a spinner and reverts to view on completion.
 */
export function InlineEditField({
  value,
  fieldType = "text",
  onSave,
  label,
  formatDisplay,
  selectOptions = [],
  isLoading = false,
  className = "",
}: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

  // Keep editValue in sync when external value changes (but not while editing)
  useEffect(() => {
    if (!editing) {
      setEditValue(value);
    }
  }, [value, editing]);

  // Cancel on Escape key
  useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleEdit = () => {
    setEditValue(value);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(editValue);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : value;

  // ── View mode ──────────────────────────────────────────────────────────────

  if (!editing) {
    return (
      <div className={`group flex items-center gap-2 ${className}`}>
        {label && (
          <span className="text-xs font-medium text-secondary-500">{label}:</span>
        )}
        <span
          className="cursor-pointer text-sm text-secondary-800"
          onClick={handleEdit}
          title="Nhấp để chỉnh sửa"
        >
          {displayValue || <span className="italic text-secondary-400">—</span>}
        </span>

        {/* Pencil: shown on group hover */}
        {!isLoading && (
          <button
            type="button"
            aria-label="Chỉnh sửa"
            onClick={handleEdit}
            className="flex h-6 w-6 items-center justify-center rounded text-secondary-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-secondary-100 hover:text-secondary-600 focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-primary-500"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {label && (
        <span className="mt-2 text-xs font-medium text-secondary-500">{label}:</span>
      )}

      {/* Input control */}
      <div className="flex-1">
        {fieldType === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            size="sm"
            autoResize
          />
        ) : fieldType === "select" ? (
          <Select
            options={selectOptions}
            value={editValue}
            onChange={(v) => setEditValue(v as string)}
            size="sm"
          />
        ) : (
          <Input
            ref={inputRef}
            type={fieldType === "number" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            size="sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        )}
      </div>

      {/* Save / cancel buttons */}
      <div className="flex shrink-0 items-center gap-1 mt-0.5">
        {saving ? (
          <span className="flex h-7 w-7 items-center justify-center">
            <ArrowPathIcon
              className="h-4 w-4 animate-spin text-primary-500"
              aria-hidden="true"
            />
          </span>
        ) : (
          <button
            type="button"
            aria-label="Lưu"
            onClick={handleSave}
            className="flex h-7 w-7 items-center justify-center rounded text-success-600 transition-colors hover:bg-success-50 focus:outline-none focus:ring-2 focus:ring-success-500"
          >
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          aria-label="Hủy"
          onClick={handleCancel}
          disabled={saving}
          className="flex h-7 w-7 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400 disabled:opacity-50"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

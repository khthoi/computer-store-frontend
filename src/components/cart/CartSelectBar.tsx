"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartSelectBarProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  /** Called after the user confirms bulk deletion in the modal */
  onRemoveSelected: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CartSelectBar — slim action bar above the cart list.
 *
 * Left  : "select all" checkbox with indeterminate support + count suffix.
 * Right : "Xoá đã chọn" button — disabled when nothing selected;
 *         always requires a confirmation Modal before dispatching.
 */
export function CartSelectBar({
  totalCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onRemoveSelected,
}: CartSelectBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  const handleSelectAllChange = useCallback(() => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  }, [allSelected, onSelectAll, onDeselectAll]);

  const handleConfirmRemove = useCallback(() => {
    onRemoveSelected();
    setConfirmOpen(false);
  }, [onRemoveSelected]);

  return (
    <>
      <div className="flex items-center justify-between py-3">
        {/* ── Left: select-all ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Checkbox
            size="sm"
            label="Chọn tất cả"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={handleSelectAllChange}
          />
          <span className="text-xs text-secondary-400">
            ({selectedCount}/{totalCount})
          </span>
        </div>

        {/* ── Right: bulk remove ────────────────────────────────────────── */}
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={() => setConfirmOpen(true)}
          className={[
            "text-sm transition-colors",
            selectedCount === 0
              ? "text-error-300 cursor-not-allowed opacity-40"
              : "text-error-500 hover:text-error-700 cursor-pointer",
          ].join(" ")}
        >
          Xoá đã chọn
        </button>
      </div>

      {/* ── Confirmation modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Xác nhận xoá"
        size="sm"
        animated
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Huỷ
            </Button>
            <Button variant="danger" onClick={handleConfirmRemove}>
              Xoá
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          Bạn muốn xoá{" "}
          <span className="font-semibold text-secondary-900">
            {selectedCount}
          </span>{" "}
          sản phẩm đã chọn?
        </p>
      </Modal>
    </>
  );
}

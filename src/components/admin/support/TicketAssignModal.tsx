"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffOption {
  value: string;
  label: string;
  openTicketCount?: number;
}

interface TicketAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (payload: {
    staffId: string;
    staffName: string;
    ticketIds: string[];
  }) => void;
  ticketIds: string[];
  staffOptions: StaffOption[];
  isSaving?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketAssignModal — modal for bulk-assigning support tickets to a staff member.
 * Displays open ticket count per staff member inside the Select options.
 */
export function TicketAssignModal({
  isOpen,
  onClose,
  onAssign,
  ticketIds,
  staffOptions,
  isSaving = false,
}: TicketAssignModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // Build enriched option labels that include open ticket count
  const enrichedOptions = staffOptions.map((s) => ({
    value: s.value,
    label:
      s.openTicketCount !== undefined
        ? `${s.label} (${s.openTicketCount} phiếu đang mở)`
        : s.label,
  }));

  const selectedStaff = staffOptions.find((s) => s.value === selectedStaffId);

  function handleAssign() {
    if (!selectedStaffId || !selectedStaff) return;
    onAssign({
      staffId: selectedStaffId,
      staffName: selectedStaff.label,
      ticketIds,
    });
  }

  function handleClose() {
    setSelectedStaffId("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Phân công ${ticketIds.length} phiếu`}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSaving}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssign}
            disabled={!selectedStaffId || isSaving}
            isLoading={isSaving}
          >
            Phân công
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Staff selector */}
        <Select
          label="Nhân viên CSKH"
          placeholder="Chọn nhân viên CSKH"
          options={enrichedOptions}
          value={selectedStaffId}
          onChange={(v) => setSelectedStaffId(v as string)}
          searchable
          clearable
        />

        {/* Preview */}
        {selectedStaff && (
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-800">
            Sẽ phân công{" "}
            <span className="font-semibold">{ticketIds.length} phiếu</span> cho{" "}
            <span className="font-semibold">{selectedStaff.label}</span>
          </div>
        )}

        {/* Ticket count note */}
        {!selectedStaff && (
          <p className="text-xs text-secondary-400">
            {ticketIds.length} phiếu đã được chọn sẽ được phân công cho nhân
            viên bạn chọn.
          </p>
        )}
      </div>
    </Modal>
  );
}

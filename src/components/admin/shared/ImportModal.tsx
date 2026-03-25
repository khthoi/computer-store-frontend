"use client";

import { useCallback, useRef, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import {
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportRow {
  [key: string]: string;
}

interface ImportError {
  rowIndex: number;
  field: string;
  message: string;
}

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (validRows: ImportRow[]) => void;
  templateDownloadUrl?: string;
  /** e.g. "sản phẩm" */
  entityName?: string;
  isConfirming?: boolean;
}

type WizardStep = 1 | 2 | 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ["name", "sku"];

/** Simple CSV parser — treats first row as headers */
function parseCSV(text: string): { headers: string[]; rows: ImportRow[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: ImportRow[] = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: ImportRow = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

/** Returns list of import errors for each row */
function validateRows(headers: string[], rows: ImportRow[]): ImportError[] {
  const errors: ImportError[] = [];
  const requiredInFile = REQUIRED_FIELDS.filter((f) => headers.includes(f));

  rows.forEach((row, idx) => {
    requiredInFile.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push({
          rowIndex: idx,
          field,
          message: `Trường "${field}" không được để trống`,
        });
      }
    });
  });

  return errors;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: WizardStep }) {
  const steps = [
    { n: 1, label: "Tải lên" },
    { n: 2, label: "Xem trước" },
    { n: 3, label: "Xác nhận" },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, i) => {
        const isDone = current > step.n;
        const isActive = current === step.n;

        return (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isDone
                    ? "border-primary-600 bg-primary-600 text-white"
                    : isActive
                    ? "border-primary-600 bg-white text-primary-600"
                    : "border-secondary-300 bg-white text-secondary-400",
                ].join(" ")}
              >
                {isDone ? <CheckCircleIcon className="h-4 w-4" /> : step.n}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-primary-700" : "text-secondary-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-5 h-px w-12 transition-colors ${
                  current > step.n ? "bg-primary-600" : "bg-secondary-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ImportModal — 3-step wizard for bulk data import from CSV/Excel.
 *
 * Step 1: Upload — drag-and-drop / file picker + template download link.
 * Step 2: Preview — parsed rows table with error highlighting.
 * Step 3: Confirm — summary card before committing.
 */
export function ImportModal({
  isOpen,
  onClose,
  onConfirm,
  templateDownloadUrl,
  entityName = "bản ghi",
  isConfirming = false,
}: ImportModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Reset on close ────────────────────────────────────────────────────────

  const handleClose = () => {
    setStep(1);
    setFileName(null);
    setHeaders([]);
    setAllRows([]);
    setErrors([]);
    onClose();
  };

  // ── File processing ───────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows } = parseCSV(text);
      const errs = validateRows(h, rows);
      setHeaders(h);
      setAllRows(rows);
      setErrors(errs);
      setStep(2);
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const errorRowIndexes = new Set(errors.map((e) => e.rowIndex));
  const validRows = allRows.filter((_, i) => !errorRowIndexes.has(i));
  const invalidCount = errorRowIndexes.size;
  const validCount = validRows.length;

  // Check if a cell has an error
  const cellHasError = (rowIdx: number, field: string) =>
    errors.some((e) => e.rowIndex === rowIdx && e.field === field);

  // ── Footer ────────────────────────────────────────────────────────────────

  const footer = (
    <div className="flex w-full items-center justify-between gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={step > 1 ? () => setStep((s) => (s - 1) as WizardStep) : handleClose}
      >
        {step === 1 ? "Hủy" : "Quay lại"}
      </Button>

      <div className="flex items-center gap-2">
        {step === 2 && (
          <Button variant="primary" size="sm" onClick={() => setStep(3)}>
            Tiếp theo
          </Button>
        )}
        {step === 3 && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isConfirming}
            disabled={validCount === 0}
            onClick={() => onConfirm(validRows)}
          >
            Xác nhận nhập
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nhập dữ liệu hàng loạt"
      size="xl"
      footer={footer}
      animated
    >
      <StepIndicator current={step} />

      {/* ── Step 1: Upload ──────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
              isDragging
                ? "border-primary-400 bg-primary-50"
                : "border-secondary-300 bg-secondary-50 hover:border-primary-300 hover:bg-primary-50/40",
            ].join(" ")}
          >
            <ArrowUpTrayIcon className="h-10 w-10 text-secondary-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-secondary-700">
                Kéo &amp; thả file vào đây, hoặc{" "}
                <span className="text-primary-600 underline">chọn file</span>
              </p>
              <p className="mt-1 text-xs text-secondary-400">
                Hỗ trợ .CSV và .XLSX
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Chọn file nhập"
            />
          </div>

          {/* Template download */}
          {templateDownloadUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-info-200 bg-info-50 px-4 py-3">
              <DocumentArrowDownIcon className="h-5 w-5 shrink-0 text-info-500" aria-hidden="true" />
              <p className="text-sm text-info-700">
                Chưa có mẫu?{" "}
                <a
                  href={templateDownloadUrl}
                  download
                  className="font-medium underline hover:text-info-800"
                >
                  Tải xuống mẫu
                </a>{" "}
                để điền đúng định dạng.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Preview ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex items-center gap-4 rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 text-success-700">
              <CheckCircleIcon className="h-4 w-4" />
              <strong>{validCount}</strong> hàng hợp lệ
            </span>
            {invalidCount > 0 && (
              <span className="flex items-center gap-1.5 text-error-700">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <strong>{invalidCount}</strong> hàng có lỗi
              </span>
            )}
            <span className="ml-auto text-secondary-500 text-xs">
              File: {fileName}
            </span>
          </div>

          {/* Table */}
          <div className="max-h-72 overflow-auto rounded-lg border border-secondary-200">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-secondary-50 z-10">
                <tr>
                  <th className="border-b border-secondary-200 px-3 py-2 text-left font-semibold text-secondary-600 w-10">
                    #
                  </th>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="border-b border-secondary-200 px-3 py-2 text-left font-semibold text-secondary-600 whitespace-nowrap"
                    >
                      {h}
                      {REQUIRED_FIELDS.includes(h) && (
                        <span className="ml-1 text-error-400" title="Bắt buộc">*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={errorRowIndexes.has(idx) ? "bg-error-50/60" : "odd:bg-white even:bg-secondary-50/30"}
                  >
                    <td className="border-b border-secondary-100 px-3 py-1.5 text-secondary-400">
                      {idx + 1}
                    </td>
                    {headers.map((h) => (
                      <td
                        key={h}
                        className={[
                          "border-b border-secondary-100 px-3 py-1.5 whitespace-nowrap",
                          cellHasError(idx, h)
                            ? "bg-error-50 text-error-700 font-medium"
                            : "text-secondary-700",
                        ].join(" ")}
                      >
                        {row[h] || (
                          <span className="italic text-secondary-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm ─────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-secondary-800">
              Tóm tắt nhập dữ liệu
            </h4>

            <div className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3">
              <CheckCircleIcon className="h-5 w-5 text-success-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-success-700">
                Sẽ nhập{" "}
                <strong>
                  {validCount} {entityName}
                </strong>
              </p>
            </div>

            {invalidCount > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-500 shrink-0" aria-hidden="true" />
                <p className="text-sm text-warning-700">
                  Bỏ qua{" "}
                  <strong>{invalidCount} hàng lỗi</strong> — các hàng này sẽ không được nhập.
                </p>
              </div>
            )}

            {validCount === 0 && (
              <p className="text-sm text-error-600 font-medium">
                Không có hàng nào hợp lệ để nhập. Vui lòng kiểm tra lại file.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

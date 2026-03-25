"use client";

import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaxRule {
  id: string;
  region: string;
  category: string;
  rate: number;
  active: boolean;
}

interface TaxSettingsFormProps {
  rules: TaxRule[];
  onChange: (rules: TaxRule[]) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const VIETNAM_REGIONS = [
  { value: "all", label: "Toàn quốc" },
  { value: "hanoi", label: "Hà Nội" },
  { value: "hcm", label: "TP. Hồ Chí Minh" },
  { value: "danang", label: "Đà Nẵng" },
  { value: "cantho", label: "Cần Thơ" },
  { value: "haiphong", label: "Hải Phòng" },
  { value: "binhduong", label: "Bình Dương" },
  { value: "dongnai", label: "Đồng Nai" },
  { value: "angiang", label: "An Giang" },
  { value: "khanhhoa", label: "Khánh Hoà" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "electronics", label: "Điện tử" },
  { value: "gpu", label: "GPU" },
  { value: "cpu", label: "CPU" },
  { value: "laptop", label: "Laptop" },
  { value: "accessories", label: "Phụ kiện" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TaxSettingsForm — table for managing tax rules per region and product category.
 * Supports add, delete, reorder (up/down arrows), and toggle active.
 */
export function TaxSettingsForm({
  rules,
  onChange,
  onSave,
  isSaving = false,
}: TaxSettingsFormProps) {
  function updateRule(updated: TaxRule) {
    onChange(rules.map((r) => (r.id === updated.id ? updated : r)));
  }

  function deleteRule(id: string) {
    onChange(rules.filter((r) => r.id !== id));
  }

  function addRule() {
    onChange([
      ...rules,
      {
        id: genId(),
        region: "all",
        category: "all",
        rate: 10,
        active: true,
      },
    ]);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...rules];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === rules.length - 1) return;
    const next = [...rules];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-secondary-900 mb-5">
        Quy tắc thuế
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-100">
              <th className="text-left text-xs font-semibold text-secondary-500 px-3 py-2.5 w-8">
                {/* drag handle col */}
              </th>
              <th className="text-left text-xs font-semibold text-secondary-500 px-3 py-2.5">
                Khu vực
              </th>
              <th className="text-left text-xs font-semibold text-secondary-500 px-3 py-2.5">
                Danh mục
              </th>
              <th className="text-left text-xs font-semibold text-secondary-500 px-3 py-2.5 w-36">
                Thuế suất (%)
              </th>
              <th className="text-center text-xs font-semibold text-secondary-500 px-3 py-2.5">
                Kích hoạt
              </th>
              <th className="text-center text-xs font-semibold text-secondary-500 px-3 py-2.5">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-secondary-100">
            {rules.map((rule, index) => (
              <tr key={rule.id} className="hover:bg-secondary-50 transition-colors">
                {/* Reorder buttons */}
                <td className="px-1 py-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-0.5 text-secondary-400 hover:text-secondary-700 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-secondary-100"
                      aria-label="Di chuyển lên"
                    >
                      <ArrowUpIcon className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === rules.length - 1}
                      className="p-0.5 text-secondary-400 hover:text-secondary-700 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-secondary-100"
                      aria-label="Di chuyển xuống"
                    >
                      <ArrowDownIcon className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </td>

                {/* Region */}
                <td className="px-3 py-2">
                  <Select
                    label=""
                    options={VIETNAM_REGIONS}
                    value={rule.region}
                    onChange={(v) => updateRule({ ...rule, region: v as string })}
                    size="sm"
                  />
                </td>

                {/* Category */}
                <td className="px-3 py-2">
                  <Select
                    label=""
                    options={CATEGORY_OPTIONS}
                    value={rule.category}
                    onChange={(v) => updateRule({ ...rule, category: v as string })}
                    size="sm"
                  />
                </td>

                {/* Rate */}
                <td className="px-3 py-2">
                  <Input
                    label=""
                    type="number"
                    min={0}
                    max={100}
                    value={String(rule.rate)}
                    onChange={(e) =>
                      updateRule({
                        ...rule,
                        rate: Math.min(100, Math.max(0, Number(e.target.value))),
                      })
                    }
                    size="sm"
                  />
                </td>

                {/* Active toggle */}
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center">
                    <Toggle
                      size="sm"
                      checked={rule.active}
                      onChange={(e) =>
                        updateRule({ ...rule, active: e.target.checked })
                      }
                      aria-label="Kích hoạt quy tắc thuế"
                    />
                  </div>
                </td>

                {/* Delete */}
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                    aria-label="Xóa quy tắc thuế"
                  >
                    <TrashIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}

            {rules.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-secondary-400"
                >
                  Chưa có quy tắc thuế nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add rule button */}
      <button
        type="button"
        onClick={addRule}
        className="mt-4 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        <PlusIcon className="w-4 h-4" aria-hidden="true" />
        Thêm quy tắc thuế
      </button>

      {/* Save */}
      <div className="flex justify-end mt-6 pt-4 border-t border-secondary-100">
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={isSaving}
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}

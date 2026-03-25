"use client";

import { useEffect, useState } from "react";
import { Select } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  name: string;
  zones: {
    id: string;
    name: string;
    aisles: { id: string; name: string }[];
  }[];
}

export interface WarehouseLocationPickerProps {
  warehouses: Warehouse[];
  value: string;
  onChange: (locationCode: string) => void;
  readOnly?: boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a location code like "wh1-zone2-aisle3" into its three parts.
 * Returns null if the code has fewer than 3 dash-separated segments.
 */
function parseLocationCode(
  code: string
): { warehouseId: string; zoneId: string; aisleId: string } | null {
  if (!code) return null;
  const parts = code.split("-");
  if (parts.length < 3) return null;
  // warehouseId may contain no dashes; zoneId and aisleId are the last two segments
  const aisleId = parts[parts.length - 1];
  const zoneId = parts[parts.length - 2];
  const warehouseId = parts.slice(0, parts.length - 2).join("-");
  return { warehouseId, zoneId, aisleId };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WarehouseLocationPicker — three-level cascading selects for warehouse / zone / aisle.
 *
 * In readOnly mode renders a mono span showing the current location code.
 * In edit mode the three Select components cascade: selecting a warehouse
 * resets zone+aisle; selecting a zone resets aisle. `onChange` is called once
 * all three levels are chosen, producing a code in the form
 * `"{warehouseId}-{zoneId}-{aisleId}"`.
 */
export function WarehouseLocationPicker({
  warehouses,
  value,
  onChange,
  readOnly = false,
  className = "",
}: WarehouseLocationPickerProps) {
  // ── Derive initial selections from the current value ──────────────────────
  const parsed = parseLocationCode(value);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    parsed?.warehouseId ?? ""
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    parsed?.zoneId ?? ""
  );
  const [selectedAisleId, setSelectedAisleId] = useState<string>(
    parsed?.aisleId ?? ""
  );

  // Re-sync internal state when the value prop changes externally
  useEffect(() => {
    const p = parseLocationCode(value);
    setSelectedWarehouseId(p?.warehouseId ?? "");
    setSelectedZoneId(p?.zoneId ?? "");
    setSelectedAisleId(p?.aisleId ?? "");
  }, [value]);

  // ── Read-only view ────────────────────────────────────────────────────────

  if (readOnly) {
    return (
      <span className="font-mono text-sm text-secondary-700">
        {value || "—"}
      </span>
    );
  }

  // ── Derived option lists ──────────────────────────────────────────────────

  const warehouseOptions = warehouses.map((wh) => ({
    value: wh.id,
    label: wh.name,
  }));

  const selectedWarehouse = warehouses.find(
    (wh) => wh.id === selectedWarehouseId
  );

  const zoneOptions =
    selectedWarehouse?.zones.map((z) => ({ value: z.id, label: z.name })) ??
    [];

  const selectedZone = selectedWarehouse?.zones.find(
    (z) => z.id === selectedZoneId
  );

  const aisleOptions =
    selectedZone?.aisles.map((a) => ({ value: a.id, label: a.name })) ?? [];

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleWarehouseChange(v: string | string[]) {
    const wh = v as string;
    setSelectedWarehouseId(wh);
    setSelectedZoneId("");
    setSelectedAisleId("");
    // Partial code — no onChange call yet
  }

  function handleZoneChange(v: string | string[]) {
    const z = v as string;
    setSelectedZoneId(z);
    setSelectedAisleId("");
    // Partial code — no onChange call yet
  }

  function handleAisleChange(v: string | string[]) {
    const aisle = v as string;
    setSelectedAisleId(aisle);
    if (selectedWarehouseId && selectedZoneId && aisle) {
      onChange(`${selectedWarehouseId}-${selectedZoneId}-${aisle}`);
    }
  }

  // ── Partial preview code ──────────────────────────────────────────────────

  let partialCode = "";
  if (selectedWarehouseId && selectedZoneId && selectedAisleId) {
    partialCode = `${selectedWarehouseId}-${selectedZoneId}-${selectedAisleId}`;
  } else if (selectedWarehouseId && selectedZoneId) {
    partialCode = `${selectedWarehouseId}-${selectedZoneId}-…`;
  } else if (selectedWarehouseId) {
    partialCode = `${selectedWarehouseId}-…-…`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Warehouse */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-secondary-500 whitespace-nowrap">
          Kho
        </span>
        <div className="w-44">
          <Select
            options={warehouseOptions}
            value={selectedWarehouseId}
            onChange={handleWarehouseChange}
            placeholder="Chọn kho…"
            size="sm"
          />
        </div>
      </div>

      {/* Zone */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-secondary-500 whitespace-nowrap">
          Khu
        </span>
        <div className="w-36">
          <Select
            options={zoneOptions}
            value={selectedZoneId}
            onChange={handleZoneChange}
            placeholder="Chọn khu…"
            size="sm"
            disabled={!selectedWarehouseId || zoneOptions.length === 0}
          />
        </div>
      </div>

      {/* Aisle */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-secondary-500 whitespace-nowrap">
          Lối
        </span>
        <div className="w-32">
          <Select
            options={aisleOptions}
            value={selectedAisleId}
            onChange={handleAisleChange}
            placeholder="Chọn lối…"
            size="sm"
            disabled={!selectedZoneId || aisleOptions.length === 0}
          />
        </div>
      </div>

      {/* Location code preview */}
      {partialCode && (
        <span
          className={[
            "font-mono text-xs px-2 py-1 rounded border",
            selectedWarehouseId && selectedZoneId && selectedAisleId
              ? "bg-success-50 border-success-200 text-success-700"
              : "bg-secondary-50 border-secondary-200 text-secondary-500",
          ].join(" ")}
        >
          {partialCode}
        </span>
      )}
    </div>
  );
}

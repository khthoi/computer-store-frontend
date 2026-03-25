"use client";

import { useState } from "react";
import { Accordion } from "@/src/components/ui/Accordion";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingRate {
  id: string;
  type: "flat" | "free_over" | "weight_based";
  label: string;
  value: number;
  condition?: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  carriers: {
    id: string;
    name: string;
    rates: ShippingRate[];
  }[];
}

interface ShippingRulesManagerProps {
  zones: ShippingZone[];
  onChange: (zones: ShippingZone[]) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

const RATE_TYPE_LABEL: Record<ShippingRate["type"], string> = {
  flat: "Cố định",
  free_over: "Miễn phí khi >=",
  weight_based: "Theo cân nặng",
};

// ─── Rate row ─────────────────────────────────────────────────────────────────

interface RateRowProps {
  rate: ShippingRate;
  onUpdate: (r: ShippingRate) => void;
  onDelete: () => void;
}

function RateRow({ rate, onUpdate, onDelete }: RateRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rate);

  function saveEdit() {
    onUpdate(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-secondary-50 rounded-lg px-3 py-2">
        <input
          type="text"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className="flex-1 min-w-0 text-xs border border-secondary-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
          placeholder="Tên mức phí"
        />
        <input
          type="number"
          value={draft.value}
          onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
          className="w-28 text-xs border border-secondary-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
          placeholder="Giá trị"
          min={0}
        />
        <button
          type="button"
          onClick={saveEdit}
          className="p-1 text-success-600 hover:bg-success-50 rounded"
          aria-label="Lưu"
        >
          <CheckIcon className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="p-1 text-secondary-400 hover:bg-secondary-100 rounded"
          aria-label="Huỷ"
        >
          <XMarkIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-50 group">
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-info-100 text-info-700 shrink-0">
        {RATE_TYPE_LABEL[rate.type]}
      </span>
      <span className="flex-1 min-w-0 text-xs text-secondary-700 truncate">
        {rate.label}
      </span>
      <span className="text-xs font-medium text-secondary-800 shrink-0 tabular-nums">
        {formatVND(rate.value)}
      </span>
      {rate.condition !== undefined && (
        <span className="text-xs text-secondary-400 shrink-0">
          &gt;= {formatVND(rate.condition)}
        </span>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 rounded"
          aria-label="Sửa mức phí"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded"
          aria-label="Xóa mức phí"
        >
          <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── Zone body ────────────────────────────────────────────────────────────────

interface ZoneBodyProps {
  zone: ShippingZone;
  onUpdate: (z: ShippingZone) => void;
}

function ZoneBody({ zone, onUpdate }: ZoneBodyProps) {
  const [newCarrierName, setNewCarrierName] = useState("");

  function addCarrier() {
    const name = newCarrierName.trim();
    if (!name) return;
    onUpdate({
      ...zone,
      carriers: [
        ...zone.carriers,
        { id: genId(), name, rates: [] },
      ],
    });
    setNewCarrierName("");
  }

  function deleteCarrier(carrierId: string) {
    onUpdate({
      ...zone,
      carriers: zone.carriers.filter((c) => c.id !== carrierId),
    });
  }

  function addRate(carrierId: string) {
    onUpdate({
      ...zone,
      carriers: zone.carriers.map((c) =>
        c.id === carrierId
          ? {
              ...c,
              rates: [
                ...c.rates,
                {
                  id: genId(),
                  type: "flat",
                  label: "Mức phí mới",
                  value: 0,
                },
              ],
            }
          : c
      ),
    });
  }

  function updateRate(carrierId: string, updated: ShippingRate) {
    onUpdate({
      ...zone,
      carriers: zone.carriers.map((c) =>
        c.id === carrierId
          ? { ...c, rates: c.rates.map((r) => (r.id === updated.id ? updated : r)) }
          : c
      ),
    });
  }

  function deleteRate(carrierId: string, rateId: string) {
    onUpdate({
      ...zone,
      carriers: zone.carriers.map((c) =>
        c.id === carrierId
          ? { ...c, rates: c.rates.filter((r) => r.id !== rateId) }
          : c
      ),
    });
  }

  return (
    <div className="space-y-4 p-4">
      {/* Regions */}
      <div>
        <p className="text-xs font-medium text-secondary-500 mb-1">
          Khu vực áp dụng
        </p>
        <div className="flex flex-wrap gap-1.5">
          {zone.regions.length > 0 ? (
            zone.regions.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 rounded-full bg-secondary-100 text-xs text-secondary-700"
              >
                {r}
              </span>
            ))
          ) : (
            <span className="text-xs text-secondary-400">Chưa có khu vực</span>
          )}
        </div>
      </div>

      {/* Carriers */}
      {zone.carriers.map((carrier) => (
        <div
          key={carrier.id}
          className="border border-secondary-200 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-secondary-50">
            <p className="text-sm font-medium text-secondary-800">
              {carrier.name}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => addRate(carrier.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Thêm mức phí
              </button>
              <button
                type="button"
                onClick={() => deleteCarrier(carrier.id)}
                className="p-1 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
                aria-label="Xóa hãng"
              >
                <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-secondary-100">
            {carrier.rates.map((rate) => (
              <RateRow
                key={rate.id}
                rate={rate}
                onUpdate={(r) => updateRate(carrier.id, r)}
                onDelete={() => deleteRate(carrier.id, rate.id)}
              />
            ))}
            {carrier.rates.length === 0 && (
              <p className="px-3 py-2 text-xs text-secondary-400">
                Chưa có mức phí
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Add carrier */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newCarrierName}
          onChange={(e) => setNewCarrierName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCarrier()}
          placeholder="Tên hãng vận chuyển..."
          className="flex-1 min-w-0 text-sm border border-secondary-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-500/15"
        />
        <button
          type="button"
          onClick={addCarrier}
          disabled={!newCarrierName.trim()}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" />
          Thêm hãng vận chuyển
        </button>
      </div>
    </div>
  );
}

// ─── Add zone form ────────────────────────────────────────────────────────────

interface AddZoneFormProps {
  onAdd: (zone: ShippingZone) => void;
  onCancel: () => void;
}

function AddZoneForm({ onAdd, onCancel }: AddZoneFormProps) {
  const [name, setName] = useState("");
  const [regionInput, setRegionInput] = useState("");
  const [regions, setRegions] = useState<string[]>([]);

  function addRegion() {
    const r = regionInput.trim();
    if (r && !regions.includes(r)) {
      setRegions([...regions, r]);
    }
    setRegionInput("");
  }

  function removeRegion(r: string) {
    setRegions(regions.filter((x) => x !== r));
  }

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({
      id: genId(),
      name: name.trim(),
      regions,
      carriers: [],
    });
  }

  return (
    <div className="border border-primary-200 rounded-2xl p-4 space-y-3 bg-primary-50/30">
      <p className="text-sm font-semibold text-secondary-800">
        Khu vực giao hàng mới
      </p>

      <Input
        label="Tên khu vực"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="VD: Miền Bắc"
        required
      />

      {/* Region tag input */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
          Tỉnh / Thành phố
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={regionInput}
            onChange={(e) => setRegionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRegion()}
            placeholder="Nhập tên tỉnh rồi Enter..."
            className="flex-1 min-w-0 text-sm border border-secondary-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:border-primary-400 focus:ring-primary-500/15"
          />
          <button
            type="button"
            onClick={addRegion}
            disabled={!regionInput.trim()}
            className="px-3 py-1.5 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            Thêm
          </button>
        </div>
        {regions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {regions.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-100 text-xs text-secondary-700 border border-secondary-200"
              >
                {r}
                <button
                  type="button"
                  onClick={() => removeRegion(r)}
                  className="hover:text-error-600"
                  aria-label={`Xóa ${r}`}
                >
                  <XMarkIcon className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={!name.trim()}
        >
          Tạo khu vực
        </Button>
      </div>
    </div>
  );
}

// ─── Manager ─────────────────────────────────────────────────────────────────

/**
 * ShippingRulesManager — accordion-based manager for shipping zones and rates.
 */
export function ShippingRulesManager({
  zones,
  onChange,
  onSave,
  isSaving = false,
}: ShippingRulesManagerProps) {
  const [showAddZone, setShowAddZone] = useState(false);

  function updateZone(updated: ShippingZone) {
    onChange(zones.map((z) => (z.id === updated.id ? updated : z)));
  }

  function deleteZone(zoneId: string) {
    onChange(zones.filter((z) => z.id !== zoneId));
  }

  function addZone(zone: ShippingZone) {
    onChange([...zones, zone]);
    setShowAddZone(false);
  }

  const accordionItems = zones.map((zone) => ({
    value: zone.id,
    label: (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-medium text-secondary-800 truncate">
          {zone.name}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-secondary-100 text-xs text-secondary-600 shrink-0">
          {zone.regions.length} khu vực
        </span>
        <div className="ml-auto flex items-center gap-1 pr-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteZone(zone.id);
            }}
            className="p-1 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
            aria-label={`Xóa khu vực ${zone.name}`}
          >
            <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    ),
    children: (
      <ZoneBody zone={zone} onUpdate={updateZone} />
    ),
  }));

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-secondary-900 mb-5">
        Quy tắc vận chuyển
      </h2>

      {/* Accordion */}
      {zones.length > 0 ? (
        <Accordion items={accordionItems} multiple variant="separated" />
      ) : (
        <p className="text-sm text-secondary-400 text-center py-6">
          Chưa có khu vực giao hàng nào
        </p>
      )}

      {/* Add zone form */}
      {showAddZone && (
        <div className="mt-4">
          <AddZoneForm
            onAdd={addZone}
            onCancel={() => setShowAddZone(false)}
          />
        </div>
      )}

      {/* Add zone button */}
      {!showAddZone && (
        <button
          type="button"
          onClick={() => setShowAddZone(true)}
          className="mt-4 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" />
          Thêm khu vực giao hàng
        </button>
      )}

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

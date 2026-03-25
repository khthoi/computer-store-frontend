"use client";

import { useCallback } from "react";
import {
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddressData {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  /** True if this is the user's default shipping address */
  isDefault?: boolean;
}

export interface AddressCardProps {
  address: AddressData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  /**
   * Render in "selectable" mode — shows a radio-style selection ring.
   * @default false
   */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AddressCard — displays a saved address with edit, delete, and set-as-default actions.
 * Supports a selectable mode for the checkout address picker.
 *
 * ```tsx
 * <AddressCard
 *   address={address}
 *   onEdit={(id) => openEditModal(id)}
 *   onDelete={(id) => deleteAddress(id)}
 *   onSetDefault={(id) => setDefaultAddress(id)}
 * />
 *
 * // Selectable checkout mode
 * <AddressCard
 *   address={address}
 *   selectable
 *   selected={selectedId === address.id}
 *   onSelect={setSelectedId}
 * />
 * ```
 */
export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect,
  className = "",
}: AddressCardProps) {
  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(address.id);
    },
    [address.id, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(address.id);
    },
    [address.id, onDelete]
  );

  const handleSetDefault = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSetDefault?.(address.id);
    },
    [address.id, onSetDefault]
  );

  const handleSelect = useCallback(() => {
    if (selectable) onSelect?.(address.id);
  }, [address.id, selectable, onSelect]);

  const fullAddress = [address.addressLine, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role={selectable ? "radio" : undefined}
      aria-checked={selectable ? selected : undefined}
      aria-label={selectable ? `${address.fullName}, ${fullAddress}` : undefined}
      onClick={selectable ? handleSelect : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleSelect();
              }
            }
          : undefined
      }
      tabIndex={selectable ? 0 : undefined}
      className={[
        "relative flex flex-col gap-3 rounded-xl border-2 bg-white p-4 transition-all duration-150",
        selectable
          ? selected
            ? "border-primary-500 bg-primary-50/50 ring-1 ring-primary-400 cursor-pointer"
            : "border-secondary-200 hover:border-secondary-300 cursor-pointer"
          : "border-secondary-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Default badge */}
      {address.isDefault && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
          <CheckBadgeIcon className="w-3 h-3" aria-hidden="true" />
          Default
        </span>
      )}

      {/* Recipient info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 shrink-0 text-secondary-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-secondary-900">
            {address.fullName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-4 h-4 shrink-0 text-secondary-400" aria-hidden="true" />
          <span className="text-sm text-secondary-700">{address.phone}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPinIcon className="mt-0.5 w-4 h-4 shrink-0 text-secondary-400" aria-hidden="true" />
          <span className="text-sm text-secondary-700">{fullAddress}</span>
        </div>
      </div>

      {/* Actions */}
      {(onEdit || onDelete || onSetDefault) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-secondary-100 pt-3">
          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${address.fullName}'s address`}
              onClick={handleEdit}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-secondary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Edit
            </button>
          )}

          {onDelete && !address.isDefault && (
            <button
              type="button"
              aria-label={`Delete ${address.fullName}'s address`}
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-error-600 transition-colors hover:bg-error-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-400"
            >
              <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Delete
            </button>
          )}

          {onSetDefault && !address.isDefault && (
            <button
              type="button"
              aria-label={`Set ${address.fullName}'s address as default`}
              onClick={handleSetDefault}
              className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <CheckBadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Set as Default
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name          Type                     Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * address       AddressData              required Address object to display
 * onEdit        (id: string) => void     —        Edit button callback
 * onDelete      (id: string) => void     —        Delete button callback (hidden on default)
 * onSetDefault  (id: string) => void     —        Set-as-default callback (hidden on default)
 * selectable    boolean                  false    Radio-style selection mode
 * selected      boolean                  false    Selected state in selectable mode
 * onSelect      (id: string) => void     —        Selection callback
 * className     string                   ""       Extra classes on root div
 *
 * ─── AddressData ──────────────────────────────────────────────────────────────
 *
 * Name         Type     Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * id           string   yes       Unique address ID
 * fullName     string   yes       Recipient full name
 * phone        string   yes       Contact phone number
 * addressLine  string   yes       Street / house number
 * ward         string   yes       Ward (Phường/Xã)
 * district     string   yes       District (Quận/Huyện)
 * city         string   yes       City/Province
 * isDefault    boolean  no        Whether this is the default address
 */

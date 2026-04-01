"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { SpecificationItemInput } from "./SpecificationItemInput";
import type { SpecificationGroup, SpecificationItem } from "@/src/types/product.types";

// ─── SpecificationGroupEditor ─────────────────────────────────────────────────
//
// Both inherited and direct groups are fully editable.
// "Inherited" / "Direct" badges are purely visual — they indicate origin,
// not editability. The description field on each item is shown read-only.

interface SpecificationGroupEditorProps {
  group: SpecificationGroup;
  onChange: (group: SpecificationGroup) => void;
}

export function SpecificationGroupEditor({ group, onChange }: SpecificationGroupEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  function handleItemChange(updated: SpecificationItem) {
    onChange({
      ...group,
      items: group.items.map((it) => (it.id === updated.id ? updated : it)),
    });
  }

  return (
    <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-secondary-900">{group.label}</span>
          {group.inherited ? (
            <Badge variant="default" size="sm">Inherited</Badge>
          ) : (
            <Badge variant="primary" size="sm">Direct</Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 text-secondary-400" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-secondary-400" />
        )}
      </button>

      {/* Items — editable for both inherited and direct groups */}
      {isOpen && (
        <div className="border-t border-secondary-100 px-6 pb-4">
          <div className="mt-2">
            {group.items.map((item) => (
              <SpecificationItemInput
                key={item.id}
                item={item}
                onChange={handleItemChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

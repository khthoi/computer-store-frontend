"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Toggle } from "@/src/components/ui/Toggle";
import { useToast } from "@/src/components/ui/Toast";
import { deleteEarnRule, updateEarnRule } from "@/src/services/loyalty.service";
import type { LoyaltyEarnRule } from "@/src/types/loyalty.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

const BONUS_LABELS: Record<string, string> = {
  first_order: "First Order",
  birthday:    "Birthday",
  manual:      "Manual",
};

const BONUS_DESCRIPTIONS: Record<string, string> = {
  first_order: "Awarded on the customer's very first order.",
  birthday:    "Awarded during the customer's birthday month.",
  manual:      "Awarded when manually triggered by an admin.",
};

// ─── MetaField ────────────────────────────────────────────────────────────────

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRuleDetailClient({ rule: initial }: { rule: LoyaltyEarnRule }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rule, setRule] = useState(initial);
  const [isBusy, setIsBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleToggleActive(isActive: boolean) {
    setRule((prev) => ({ ...prev, isActive }));
    try {
      const updated = await updateEarnRule(rule.id, { isActive });
      setRule(updated);
      showToast(isActive ? "Rule activated." : "Rule deactivated.", "success");
    } catch {
      setRule((prev) => ({ ...prev, isActive: !isActive }));
      showToast("Failed to update.", "error");
    }
  }

  async function handleDelete() {
    setIsBusy(true);
    try {
      await deleteEarnRule(rule.id);
      showToast("Earn rule deleted.", "success");
      router.push("/promotions?tab=earn-rules");
    } catch {
      showToast("Failed to delete.", "error");
      setIsBusy(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions" className="hover:text-secondary-700 transition-colors">Promos & Coupons</Link>
            <span>›</span>
            <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-700 transition-colors">Earn Rules</Link>
            <span>›</span>
            <span className="font-mono text-secondary-600">{rule.id}</span>
          </nav>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{rule.name}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${rule.isActive ? "bg-success-50 border border-success-200 text-success-700" : "bg-secondary-100 border border-secondary-200 text-secondary-500"}`}>
              {rule.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/promotions?tab=earn-rules"
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          <Toggle
            checked={rule.isActive}
            onChange={(e) => handleToggleActive(e.target.checked)}
            label={rule.isActive ? "Active" : "Inactive"}
            size="sm"
          />
          <Button
            variant="secondary"
            onClick={() => router.push(`/promotions/earn-rules/${rule.id}/edit`)}
            disabled={isBusy}
          >
            <PencilSquareIcon className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isBusy}
          >
            <TrashIcon className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* ── Overview ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetaField label="Rule ID">
            <span className="font-mono text-sm text-secondary-800">{rule.id}</span>
          </MetaField>
          <MetaField label="Priority">
            <span className="text-sm font-semibold text-secondary-800">{rule.priority}</span>
          </MetaField>
          <MetaField label="Status">
            <span className={`text-sm font-medium ${rule.isActive ? "text-success-700" : "text-secondary-500"}`}>
              {rule.isActive ? "Active" : "Inactive"}
            </span>
          </MetaField>
          <MetaField label="Valid From">
            <span className="text-sm text-secondary-700">{formatDate(rule.validFrom)}</span>
          </MetaField>
          <MetaField label="Valid Until">
            <span className="text-sm text-secondary-700">{formatDate(rule.validUntil)}</span>
          </MetaField>
          <MetaField label="Created">
            <span className="text-sm text-secondary-500">{formatDate(rule.createdAt)}</span>
          </MetaField>
        </div>
        {rule.description && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Description</p>
            <p className="mt-1 text-sm text-secondary-700">{rule.description}</p>
          </div>
        )}
      </div>

      {/* ── Points Rate ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Points Rate</h2>
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 mb-4">
          <p className="text-2xl font-bold text-primary-700">
            {rule.pointsPerUnit} pt
            <span className="text-base font-medium text-primary-500 ml-1">
              / {(rule.spendPerUnit / 1000).toFixed(0)}k VND
            </span>
          </p>
          <p className="text-sm text-primary-600 mt-1">
            {rule.pointsPerUnit} point{rule.pointsPerUnit !== 1 ? "s" : ""} earned per{" "}
            {formatVND(rule.spendPerUnit)} spent
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetaField label="Min Order Value">
            <span className="text-sm text-secondary-700">
              {rule.minOrderValue != null
                ? formatVND(rule.minOrderValue)
                : <span className="text-secondary-400">No minimum</span>
              }
            </span>
          </MetaField>
          <MetaField label="Max Points / Order">
            <span className="text-sm text-secondary-700">
              {rule.maxPointsPerOrder != null
                ? <>{rule.maxPointsPerOrder.toLocaleString("vi-VN")} pts</>
                : <span className="text-secondary-400">Unlimited</span>
              }
            </span>
          </MetaField>
        </div>
      </div>

      {/* ── Fixed Bonus ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Fixed Bonus</h2>
        {rule.bonusTrigger ? (
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-warning-50 border border-warning-200 px-4 py-3 text-sm shrink-0">
              <p className="font-semibold text-warning-700">
                +{rule.bonusPoints?.toLocaleString("vi-VN")} pts
              </p>
              <p className="text-warning-600 text-xs mt-0.5">
                Trigger: {BONUS_LABELS[rule.bonusTrigger] ?? rule.bonusTrigger}
              </p>
            </div>
            <p className="text-sm text-secondary-500 pt-1">
              {BONUS_DESCRIPTIONS[rule.bonusTrigger] ?? "Bonus awarded when triggered."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-secondary-400">No fixed bonus configured.</p>
        )}
      </div>

      {/* ── Scope Multipliers ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Scope Multipliers</h2>
        {rule.scopes.length === 0 ? (
          <p className="text-sm text-secondary-400">
            Global rule — applies to all products at the base rate.
          </p>
        ) : (
          <div className="divide-y divide-secondary-100">
            {rule.scopes.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-secondary-800">{s.scopeRefLabel}</p>
                  <p className="text-xs text-secondary-400 capitalize">
                    {s.scopeType === "product" ? "Product Variant" : s.scopeType}
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-sm font-bold text-primary-700">
                  {s.multiplier}×
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-secondary-900">Delete Earn Rule?</h3>
            <p className="mt-2 text-sm text-secondary-600">
              <span className="font-medium">{rule.name}</span> will be permanently deleted.
              Customers will no longer earn points under this rule. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isBusy}
              >
                Delete Rule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

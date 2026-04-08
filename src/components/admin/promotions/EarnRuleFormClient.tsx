"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type {
  LoyaltyEarnRule,
  LoyaltyEarnRulePayload,
  EarnRuleBonusTrigger,
} from "@/src/types/loyalty.types";
import type { SelectOption } from "@/src/components/ui/Select";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { createEarnRule, updateEarnRule } from "@/src/services/loyalty.service";
import { ScopeMultipliersSection, type ScopeEntry } from "./ScopeMultipliersSection";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props =
  | { mode: "create"; rule?: never }
  | { mode: "edit"; rule: LoyaltyEarnRule };

// ─── Select options ───────────────────────────────────────────────────────────

const BONUS_OPTIONS: SelectOption[] = [
  { value: "",            label: "None" },
  { value: "first_order", label: "First Order", description: "Bonus on customer's very first order" },
  { value: "birthday",    label: "Birthday",    description: "Bonus on customer's birthday month" },
  { value: "manual",      label: "Manual",      description: "Manually triggered by admin" },
];

const BONUS_LABELS: Record<string, string> = {
  first_order: "First Order",
  birthday:    "Birthday",
  manual:      "Manual",
};

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-secondary-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-secondary-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRuleFormClient({ mode, rule }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = mode === "edit";

  // ── Basic ──────────────────────────────────────────────────────────────────
  const [name, setName]               = useState(rule?.name ?? "");
  const [description, setDescription] = useState(rule?.description ?? "");
  const [isActive, setIsActive]       = useState(rule?.isActive ?? true);
  const [priority, setPriority]       = useState(rule?.priority != null ? String(rule.priority) : "10");

  // ── Points Rate ────────────────────────────────────────────────────────────
  const [pointsPerUnit, setPointsPerUnit]         = useState(rule?.pointsPerUnit != null ? String(rule.pointsPerUnit) : "1");
  const [spendPerUnit, setSpendPerUnit]           = useState(rule?.spendPerUnit != null ? String(rule.spendPerUnit) : "10000");
  const [minOrderValue, setMinOrderValue]         = useState(rule?.minOrderValue != null ? String(rule.minOrderValue) : "");
  const [maxPointsPerOrder, setMaxPointsPerOrder] = useState(rule?.maxPointsPerOrder != null ? String(rule.maxPointsPerOrder) : "");

  // ── Bonus ──────────────────────────────────────────────────────────────────
  const [bonusTrigger, setBonusTrigger] = useState<string>(rule?.bonusTrigger ?? "");
  const [bonusPoints, setBonusPoints]   = useState(rule?.bonusPoints != null ? String(rule.bonusPoints) : "");

  // ── Scope multipliers ──────────────────────────────────────────────────────
  const [scopes, setScopes] = useState<ScopeEntry[]>(
    rule?.scopes.map((s) => ({
      scopeType: s.scopeType,
      scopeRefId: s.scopeRefId,
      scopeRefLabel: s.scopeRefLabel,
      multiplier: String(s.multiplier),
    })) ?? []
  );

  // ── Validity ───────────────────────────────────────────────────────────────
  const [validFrom, setValidFrom]   = useState(rule?.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(rule?.validUntil ?? "");

  // ── Validation / save ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── isValid ────────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    const ppu = Number(pointsPerUnit);
    if (!pointsPerUnit || isNaN(ppu) || ppu <= 0) return false;
    const spu = Number(spendPerUnit);
    if (!spendPerUnit || isNaN(spu) || spu <= 0) return false;
    const pri = Number(priority);
    if (priority === "" || isNaN(pri)) return false;
    if (bonusTrigger && (!bonusPoints || isNaN(Number(bonusPoints)) || Number(bonusPoints) <= 0)) return false;
    if (validFrom && validUntil && validUntil <= validFrom) return false;
    for (const s of scopes) {
      if (!s.scopeRefId.trim()) return false;
      const m = Number(s.multiplier);
      if (isNaN(m) || m <= 0) return false;
    }
    return true;
  }, [name, pointsPerUnit, spendPerUnit, priority, bonusTrigger, bonusPoints, validFrom, validUntil, scopes]);

  // ── previewText ────────────────────────────────────────────────────────────
  const previewText = useMemo(() => {
    const ppu = Number(pointsPerUnit);
    const spu = Number(spendPerUnit);
    if (!name.trim() || isNaN(ppu) || ppu <= 0 || isNaN(spu) || spu <= 0) return null;

    const lines: ReactNode[] = [];
    const spuK = spu >= 1000 ? `${(spu / 1000).toFixed(0)}k` : spu.toLocaleString("vi-VN");
    lines.push(`Earn ${ppu} pt per ${spuK}₫ spent.`);

    if (minOrderValue && Number(minOrderValue) > 0)
      lines.push(`Min order: ${Number(minOrderValue).toLocaleString("vi-VN")}₫.`);
    if (maxPointsPerOrder && Number(maxPointsPerOrder) > 0)
      lines.push(`Cap: ${Number(maxPointsPerOrder).toLocaleString("vi-VN")} pts/order.`);

    const validScopes = scopes.filter((s) => s.scopeRefLabel.trim() && Number(s.multiplier) > 0);
    if (validScopes.length > 0) {
      lines.push(
        <span>
          Multipliers:{" "}
          {validScopes.map((s, idx) => (
            <span key={idx}>
              {idx > 0 && ", "}
              {s.multiplier}× <strong>{s.scopeRefLabel.trim()}</strong>
            </span>
          ))}.
        </span>
      );
    }

    if (bonusTrigger && bonusPoints && Number(bonusPoints) > 0)
      lines.push(`+${Number(bonusPoints).toLocaleString("vi-VN")} bonus pts on ${BONUS_LABELS[bonusTrigger] ?? bonusTrigger}.`);

    if (validFrom || validUntil) {
      lines.push(`Valid: ${validFrom || "—"} – ${validUntil || "—"}.`);
    } else {
      lines.push("Always active (no date restriction).");
    }

    return lines;
  }, [name, pointsPerUnit, spendPerUnit, minOrderValue, maxPointsPerOrder, scopes, bonusTrigger, bonusPoints, validFrom, validUntil]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required.";

    const ppu = Number(pointsPerUnit);
    if (!pointsPerUnit || isNaN(ppu) || ppu <= 0)
      newErrors.pointsPerUnit = "Must be greater than 0.";

    const spu = Number(spendPerUnit);
    if (!spendPerUnit || isNaN(spu) || spu <= 0)
      newErrors.spendPerUnit = "Must be greater than 0.";

    const pri = Number(priority);
    if (priority === "" || isNaN(pri)) newErrors.priority = "Priority is required.";

    if (bonusTrigger && (!bonusPoints || isNaN(Number(bonusPoints)) || Number(bonusPoints) <= 0))
      newErrors.bonusPoints = "Bonus points must be greater than 0 when a trigger is set.";

    if (validFrom && validUntil && validUntil <= validFrom)
      newErrors.validUntil = "Valid Until must be after Valid From.";

    scopes.forEach((s, i) => {
      if (!s.scopeRefId.trim())
        newErrors[`scope_ref_${i}`] = "Please select a target.";
      const m = Number(s.multiplier);
      if (isNaN(m) || m <= 0)
        newErrors[`scope_multiplier_${i}`] = "Multiplier must be > 0.";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const payload: LoyaltyEarnRulePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        pointsPerUnit: ppu,
        spendPerUnit: spu,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxPointsPerOrder: maxPointsPerOrder ? Number(maxPointsPerOrder) : undefined,
        bonusTrigger: bonusTrigger ? (bonusTrigger as EarnRuleBonusTrigger) : undefined,
        bonusPoints: bonusTrigger && bonusPoints ? Number(bonusPoints) : undefined,
        scopes: scopes.map((s) => ({
          scopeType: s.scopeType,
          scopeRefId: s.scopeRefId,
          scopeRefLabel: s.scopeRefLabel,
          multiplier: Number(s.multiplier),
        })),
        isActive,
        priority: pri,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
      };

      if (isEdit) {
        await updateEarnRule(rule.id, payload);
        showToast("Earn rule updated.", "success");
        router.push(`/promotions/earn-rules/${rule.id}`);
      } else {
        const created = await createEarnRule(payload);
        showToast("Earn rule created.", "success");
        router.push(`/promotions/earn-rules/${created.id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  const backHref = isEdit ? `/promotions/earn-rules/${rule.id}` : "/promotions?tab=earn-rules";

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-secondary-400 mb-0.5">
            <Link href="/promotions" className="hover:text-secondary-600 transition-colors">Promos & Coupons</Link>
            <span>›</span>
            <Link href="/promotions?tab=earn-rules" className="hover:text-secondary-600 transition-colors">Earn Rules</Link>
            {isEdit && (
              <>
                <span>›</span>
                <Link href={`/promotions/earn-rules/${rule.id}`} className="font-mono hover:text-secondary-600 transition-colors">
                  {rule.id}
                </Link>
              </>
            )}
            <span>›</span>
            <span className="text-secondary-600">{isEdit ? "Edit" : "New"}</span>
          </nav>
          <h1 className="text-xl font-bold text-secondary-900">
            {isEdit ? `Edit: ${rule.name}` : "New Earn Rule"}
          </h1>
        </div>
      </div>

      {/* Two-column layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* 1. Basic Info */}
          <Section title="Basic Info" description="Name, description and activation status for this rule.">
            <Input
              label="Name"
              required
              placeholder="e.g. Base Rate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              errorMessage={errors.name}
              fullWidth
            />
            <Textarea
              label="Description"
              placeholder="Optional — describe when this rule applies."
              rows={2}
              maxCharCount={300}
              showCharCount
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex items-center gap-8">
              <Toggle
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                label="Active"
              />
              <Input
                label="Priority"
                type="number"
                min={0}
                required
                placeholder="e.g. 10"
                helperText="Higher number = evaluated first when multiple rules apply."
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                errorMessage={errors.priority}
              />
            </div>
          </Section>

          {/* 2. Points Rate */}
          <Section
            title="Points Rate"
            description="How many points a customer earns per amount spent."
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Points awarded"
                type="number"
                min={1}
                required
                placeholder="e.g. 1"
                value={pointsPerUnit}
                onChange={(e) => setPointsPerUnit(e.target.value)}
                errorMessage={errors.pointsPerUnit}
                fullWidth
              />
              <Input
                label="Per (VND)"
                type="number"
                min={1}
                required
                placeholder="e.g. 10000"
                helperText="e.g. 10000 → 1 pt per 10,000₫ spent"
                value={spendPerUnit}
                onChange={(e) => setSpendPerUnit(e.target.value)}
                errorMessage={errors.spendPerUnit}
                fullWidth
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min order value (VND)"
                type="number"
                min={0}
                placeholder="Blank = no minimum"
                helperText="Order must be at least this value to earn points."
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                fullWidth
              />
              <Input
                label="Max points per order"
                type="number"
                min={1}
                placeholder="Blank = unlimited"
                helperText="Cap on points earned from a single order."
                value={maxPointsPerOrder}
                onChange={(e) => setMaxPointsPerOrder(e.target.value)}
                fullWidth
              />
            </div>

            {pointsPerUnit && spendPerUnit && Number(pointsPerUnit) > 0 && Number(spendPerUnit) > 0 && (
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-800">
                <span className="font-semibold">Preview: </span>
                Customer spending{" "}
                <span className="font-semibold">
                  {(Number(spendPerUnit) * 10).toLocaleString("vi-VN")}₫
                </span>{" "}
                earns{" "}
                <span className="font-semibold">
                  {(Number(pointsPerUnit) * 10).toLocaleString("vi-VN")} pts
                </span>
                {maxPointsPerOrder && Number(maxPointsPerOrder) > 0 && (
                  <span className="text-primary-600">
                    {" "}(capped at {Number(maxPointsPerOrder).toLocaleString("vi-VN")} pts/order)
                  </span>
                )}
                .
              </div>
            )}
          </Section>

          {/* 3. Fixed Bonus */}
          <Section
            title="Fixed Bonus"
            description="Award a one-time flat bonus when a specific event occurs."
          >
            <Select
              label="Bonus trigger"
              options={BONUS_OPTIONS}
              value={bonusTrigger}
              onChange={(v) => {
                setBonusTrigger(v as string);
                if (!v) setBonusPoints("");
              }}
              placeholder="None"
              helperText="Leave blank if this rule has no fixed bonus."
            />
            {bonusTrigger && (
              <Input
                label="Bonus points"
                type="number"
                min={1}
                required
                placeholder="e.g. 200"
                helperText="Number of bonus points awarded when the trigger fires."
                value={bonusPoints}
                onChange={(e) => setBonusPoints(e.target.value)}
                errorMessage={errors.bonusPoints}
                fullWidth
              />
            )}
          </Section>

          {/* 4. Scope Multipliers */}
          <Section
            title="Scope Multipliers"
            description="Override the earn rate for specific categories, brands, or product variants. Customers earn multiplier × base points when buying from these scopes."
          >
            <ScopeMultipliersSection
              scopes={scopes}
              onChange={setScopes}
              errors={errors}
            />
          </Section>

          {/* 5. Validity Period */}
          <Section
            title="Validity Period"
            description="Leave both fields blank to make the rule apply at all times."
          >
            <div className="grid grid-cols-2 gap-4">
              <DateInput label="Valid From" value={validFrom} onChange={setValidFrom} />
              <DateInput
                label="Valid Until"
                value={validUntil}
                onChange={setValidUntil}
                errorMessage={errors.validUntil}
              />
            </div>
          </Section>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href={backHref}
              className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary" isLoading={saving} disabled={saving || !isValid}>
              {isEdit ? "Save Changes" : "Create Earn Rule"}
            </Button>
          </div>
        </div>

        {/* ── Right column — Preview ── */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
              Rule Preview
            </h3>

            {previewText ? (
              <>
                <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
                  <p className="text-sm font-semibold text-primary-800">
                    {name.trim() || "Untitled Rule"}
                  </p>
                  {description.trim() && (
                    <p className="mt-1 text-xs text-primary-600">{description.trim()}</p>
                  )}
                </div>

                <ul className="space-y-2">
                  {previewText.map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 pt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? "bg-success-50 text-success-700" : "bg-secondary-100 text-secondary-500"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-secondary-400">Priority {priority || "—"}</span>
                </div>
              </>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-secondary-200 p-6 text-center">
                <p className="text-sm text-secondary-400">
                  Fill in the rule name and rate to see a preview.
                </p>
              </div>
            )}

            {!isValid && name.trim() && (
              <p className="text-xs text-warning-600 bg-warning-50 rounded-lg px-3 py-2">
                Complete all required fields to enable saving.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

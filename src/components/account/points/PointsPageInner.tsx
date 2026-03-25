import { PointsBadge } from "@/src/components/account/points/PointsBadge";
import { PointsHistoryTable } from "@/src/components/account/points/PointsHistoryTable";
import { PointsEarnAccordion } from "@/src/components/account/points/PointsEarnAccordion";
import type { PointsData } from "@/src/app/(storefront)/account/points/_mock_data";

export interface PointsPageInnerProps {
  data: PointsData;
}

/**
 * PointsPageInner — server component for /account/points.
 *
 * Layout:
 *   Row 1: PointsBadge (hero) | PointsEarnAccordion (rules)
 *   Row 2: PointsHistoryTable (full width)
 */
export function PointsPageInner({ data }: PointsPageInnerProps) {
  return (
    <div className="space-y-6">
      {/* ── Row 1 ───────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Hero balance card */}
        <PointsBadge
          tier={data.tier}
          balance={data.balance}
          progressPercent={data.tierProgressPercent}
          pointsToNextTier={data.pointsToNextTier}
          nextTier={data.nextTier}
        />

        {/* How-to-earn accordion */}
        <div className="rounded-2xl border border-secondary-200 bg-white p-5">
          <PointsEarnAccordion />
        </div>
      </div>

      {/* ── Row 2 — History ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-secondary-900">
          Lịch sử điểm thưởng
        </h2>
        <PointsHistoryTable transactions={data.history} />
      </div>
    </div>
  );
}

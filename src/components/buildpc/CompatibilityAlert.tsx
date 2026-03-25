"use client";

import { useCallback, useState } from "react";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompatibilityIssueSeverity = "error" | "warning" | "info";

export interface CompatibilityIssue {
  /** Unique key for this issue */
  id: string;
  /** Name/label of the first conflicting part */
  part1: string;
  /** Name/label of the second conflicting part (optional for single-part issues) */
  part2?: string;
  /** Human-readable explanation */
  reason: string;
  severity: CompatibilityIssueSeverity;
}

export interface CompatibilityAlertProps {
  issues: CompatibilityIssue[];
  /**
   * Show a dismiss button to hide the banner.
   * @default false
   */
  dismissible?: boolean;
  onDismiss?: () => void;
  /**
   * Allow collapsing the issue list when there are multiple issues.
   * @default true
   */
  collapsible?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  CompatibilityIssueSeverity,
  { wrapper: string; icon: React.ReactNode; title: string; row: string }
> = {
  error: {
    wrapper: "border-error-200 bg-error-50",
    icon: <XCircleIcon className="w-5 h-5 text-error-500" aria-hidden="true" />,
    title: "text-error-800",
    row: "text-error-700",
  },
  warning: {
    wrapper: "border-warning-200 bg-warning-50",
    icon: <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" aria-hidden="true" />,
    title: "text-warning-800",
    row: "text-warning-700",
  },
  info: {
    wrapper: "border-info-200 bg-info-50",
    icon: <InformationCircleIcon className="w-5 h-5 text-info-500" aria-hidden="true" />,
    title: "text-info-800",
    row: "text-info-700",
  },
};

function dominantSeverity(issues: CompatibilityIssue[]): CompatibilityIssueSeverity {
  if (issues.some((i) => i.severity === "error"))   return "error";
  if (issues.some((i) => i.severity === "warning")) return "warning";
  return "info";
}

function severityLabel(severity: CompatibilityIssueSeverity, count: number): string {
  if (severity === "error")   return `Phát hiện ${count} lỗi không tương thích`;
  if (severity === "warning") return `Có ${count} cảnh báo tương thích cần kiểm tra`;
  return `${count} vấn đề tương thích`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CompatibilityAlert — warning/error banner listing why selected parts
 * are incompatible or need attention. Supports collapsible issue list
 * and optional dismiss.
 *
 * ```tsx
 * <CompatibilityAlert
 *   issues={[
 *     {
 *       id: "cpu-mb",
 *       part1: "Intel Core i9-14900K",
 *       part2: "ASUS ROG Strix B550-F",
 *       reason: "The i9-14900K requires an LGA1700 socket. This motherboard uses AM5.",
 *       severity: "error",
 *     },
 *     {
 *       id: "ram-speed",
 *       part1: "G.Skill Trident Z5 DDR5-6400",
 *       reason: "Motherboard supports DDR5 up to 5600 MHz. XMP profile may not be stable.",
 *       severity: "warning",
 *     },
 *   ]}
 *   dismissible
 * />
 * ```
 */
export function CompatibilityAlert({
  issues,
  dismissible = false,
  onDismiss,
  collapsible = true,
  className = "",
}: CompatibilityAlertProps) {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  if (!visible || issues.length === 0) return null;

  const dominant = dominantSeverity(issues);
  const config = SEVERITY_CONFIG[dominant];
  const isCollapsible = collapsible && issues.length > 1;
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return (
    <div
      role="alert"
      className={[
        "rounded-xl border",
        config.wrapper,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 shrink-0">{config.icon}</span>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.title}`}>
            {severityLabel(dominant, issues.length)}
          </p>

          {/* Error/warning summary chips */}
          {issues.length > 1 && (errorCount > 0 || warningCount > 0) && (
            <div className="mt-1 flex flex-wrap gap-2">
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-error-100 px-2 py-0.5 text-[10px] font-semibold text-error-700">
                  <XCircleIcon className="w-3 h-3" aria-hidden="true" />
                  {errorCount} lỗi
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-semibold text-warning-700">
                  <ExclamationTriangleIcon className="w-3 h-3" aria-hidden="true" />
                  {warningCount} cảnh báo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {isCollapsible && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? "Thu gọn" : "Mở rộng"}
            onClick={() => setExpanded((v) => !v)}
            className={[
              "flex h-6 w-6 items-center justify-center rounded text-secondary-500 transition-colors",
              `hover:bg-${dominant === "error" ? "error" : dominant === "warning" ? "warning" : "info"}-100`,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            ].join(" ")}
          >
            <ChevronDownIcon
              className={[
                "w-4 h-4 transition-transform duration-150",
                expanded ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden="true"
            />
          </button>
        )}

        {/* Dismiss */}
        {dismissible && (
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={handleDismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-secondary-500 transition-colors hover:bg-secondary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <XMarkIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Issue list ── */}
      {(!isCollapsible || expanded) && (
        <ul
          role="list"
          className="flex flex-col divide-y divide-current/10 border-t border-current/10 px-4 pb-3 pt-0"
          style={{ borderTopColor: "inherit" }}
        >
          {issues.map((issue) => {
            const rowConfig = SEVERITY_CONFIG[issue.severity];
            return (
              <li key={issue.id} className="flex items-start gap-2.5 py-2.5">
                <span className="mt-0.5 shrink-0">{rowConfig.icon}</span>
                <div className="min-w-0">
                  {/* Parts involved */}
                  <p className={`text-xs font-semibold ${rowConfig.row}`}>
                    {issue.part1}
                    {issue.part2 && (
                      <>
                        <span className="mx-1 font-normal opacity-60">↔</span>
                        {issue.part2}
                      </>
                    )}
                  </p>
                  {/* Reason */}
                  <p className={`mt-0.5 text-xs ${rowConfig.row} opacity-80`}>
                    {issue.reason}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name         Type                    Default  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * issues       CompatibilityIssue[]    required List of incompatibility issues
 * dismissible  boolean                 false    Show dismiss (×) button
 * onDismiss    () => void              —        Called when dismissed
 * collapsible  boolean                 true     Allow collapsing multi-issue list
 * className    string                  ""       Extra classes on root div
 *
 * ─── CompatibilityIssue ───────────────────────────────────────────────────────
 *
 * Name      Type                          Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * id        string                        yes       Unique key
 * part1     string                        yes       First part name
 * part2     string                        no        Second part name (if pairwise)
 * reason    string                        yes       Human-readable explanation
 * severity  "error"|"warning"|"info"      yes       Alert severity level
 */

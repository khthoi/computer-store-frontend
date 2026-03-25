// ─── Group 6: Build PC ───────────────────────────────────────────────────────

export { PCPartCard } from "./PCPartCard";
export type { PCPartCardProps, CompatibilityStatus } from "./PCPartCard";

export { PCPartSelector } from "./PCPartSelector";
export type { PCPartSelectorProps, SelectedPartInfo } from "./PCPartSelector";

export { CompatibilityAlert } from "./CompatibilityAlert";
export type {
  CompatibilityAlertProps,
  CompatibilityIssue,
  CompatibilityIssueSeverity,
} from "./CompatibilityAlert";

export { PCBuildSummary } from "./PCBuildSummary";
export type { PCBuildSummaryProps, BuildSlot } from "./PCBuildSummary";

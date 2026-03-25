import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimelineStepState = "completed" | "current" | "pending";

export interface TimelineStep {
  /** Unique key */
  id: string;
  /** Step label (e.g. "Order Placed") */
  label: string;
  /** Optional sub-description */
  description?: string;
  /** ISO 8601 timestamp string */
  timestamp?: string;
  state: TimelineStepState;
}

export interface OrderTimelineProps {
  steps: TimelineStep[];
  /**
   * Locale used to format timestamps.
   * @default "vi-VN"
   */
  locale?: string;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OrderTimeline — vertical timeline showing order lifecycle steps.
 * Completed steps show a solid green check, the current step pulses,
 * pending steps are muted gray.
 *
 * ```tsx
 * <OrderTimeline
 *   steps={[
 *     { id: "placed",    label: "Order Placed",    timestamp: "2024-03-10T09:00:00Z", state: "completed" },
 *     { id: "confirmed", label: "Confirmed",        timestamp: "2024-03-10T10:30:00Z", state: "completed" },
 *     { id: "packing",   label: "Packing",          timestamp: "2024-03-11T08:00:00Z", state: "current",   description: "Your order is being packed" },
 *     { id: "shipping",  label: "Out for Delivery", state: "pending" },
 *     { id: "delivered", label: "Delivered",        state: "pending" },
 *   ]}
 * />
 * ```
 */
export function OrderTimeline({
  steps,
  locale = "vi-VN",
  className = "",
}: OrderTimelineProps) {
  return (
    <ol
      aria-label="Order status timeline"
      className={["flex flex-col", className].filter(Boolean).join(" ")}
    >
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCompleted = step.state === "completed";
        const isCurrent = step.state === "current";

        return (
          <li key={step.id} className="relative flex gap-4">
            {/* ── Connector line ── */}
            {!isLast && (
              <span
                aria-hidden="true"
                className={[
                  "absolute left-[15px] top-8 h-full w-0.5",
                  isCompleted ? "bg-success-400" : "bg-secondary-200",
                ].join(" ")}
              />
            )}

            {/* ── Step icon ── */}
            <div className="relative z-10 shrink-0 pt-0.5">
              {isCompleted ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                  <CheckCircleIcon
                    className="w-5 h-5 text-success-600"
                    aria-hidden="true"
                  />
                </span>
              ) : isCurrent ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-600" />
                  </span>
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-secondary-200 bg-white">
                  <ClockIcon className="w-4 h-4 text-secondary-300" aria-hidden="true" />
                </span>
              )}
            </div>

            {/* ── Step content ── */}
            <div
              className={[
                "flex-1 pb-6",
                isLast ? "pb-0" : "",
              ].join(" ")}
            >
              <p
                className={[
                  "text-sm font-medium leading-none",
                  isCompleted
                    ? "text-secondary-800"
                    : isCurrent
                    ? "text-primary-700"
                    : "text-secondary-400",
                ].join(" ")}
              >
                {step.label}
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
                    Current
                  </span>
                )}
              </p>

              {step.description && (
                <p
                  className={[
                    "mt-1 text-xs",
                    isCurrent ? "text-secondary-600" : "text-secondary-400",
                  ].join(" ")}
                >
                  {step.description}
                </p>
              )}

              {step.timestamp && (
                <time
                  dateTime={step.timestamp}
                  className="mt-1 block text-[11px] text-secondary-400"
                >
                  {formatTimestamp(step.timestamp, locale)}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name       Type             Default   Description
 * ──────────────────────────────────────────────────────────────────────────────
 * steps      TimelineStep[]   required  Ordered list of timeline steps
 * locale     string           "vi-VN"   Locale for timestamp formatting
 * className  string           ""        Extra classes on <ol>
 *
 * ─── TimelineStep ─────────────────────────────────────────────────────────────
 *
 * Name         Type                          Required  Description
 * ──────────────────────────────────────────────────────────────────────────────
 * id           string                        yes       Unique key
 * label        string                        yes       Step title
 * description  string                        no        Sub-text beneath label
 * timestamp    string (ISO 8601)             no        Formatted date/time
 * state        "completed"|"current"|"pending" yes     Visual state of this step
 */

import { Fragment } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReturnWizardNavProps {
  currentStep: 1 | 2 | 3;
  steps: Array<{ label: string }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReturnWizardNav — horizontal step indicator with completed / active / future
 * states. Connecting lines between circles are coloured once the step is done.
 */
export function ReturnWizardNav({ currentStep, steps }: ReturnWizardNavProps) {
  return (
    <div className="border-b border-secondary-100 px-6 py-5">
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <Fragment key={stepNumber}>
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                    isCompleted
                      ? "bg-primary-100 text-primary-700"
                      : isActive
                      ? "bg-primary-600 text-white"
                      : "bg-secondary-100 text-secondary-400",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </div>

                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap",
                    isActive
                      ? "text-primary-700"
                      : isCompleted
                      ? "text-primary-600"
                      : "text-secondary-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line — not rendered after the last step */}
              {!isLast && (
                <div
                  className={[
                    "mb-6 h-0.5 flex-1 mx-3 transition-colors duration-200",
                    isCompleted ? "bg-primary-300" : "bg-secondary-200",
                  ].join(" ")}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

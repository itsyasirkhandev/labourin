"use client";

import { Check } from "lucide-react";
import { WIZARD_STEPS, WizardStepId } from "./types";
import { cn } from "@/lib/utils";

interface WizardProgressHeaderProps {
  currentStep: WizardStepId;
  onStepClick?: (step: WizardStepId) => void;
}

export function WizardProgressHeader({
  currentStep,
  onStepClick,
}: WizardProgressHeaderProps) {
  const currentStepInfo = WIZARD_STEPS.find((s) => s.id === currentStep) || WIZARD_STEPS[0];
  const progressPercent = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="w-full space-y-4 rounded-xl border bg-card p-4 shadow-xs sm:p-6">
      {/* Mobile Top Bar */}
      <div className="space-y-2 sm:hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>
          <span className="text-primary font-bold">{Math.round((currentStep / WIZARD_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{currentStepInfo.title}</h2>
          <p className="text-xs text-muted-foreground">{currentStepInfo.description}</p>
        </div>
      </div>

      {/* Desktop / Tablet Step Timeline */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 -z-0 h-0.5 w-full -translate-y-1/2 bg-border">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {WIZARD_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isClickable = step.id < currentStep && onStepClick;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  aria-label={`Step ${step.id}: ${step.shortTitle}`}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer",
                    isActive &&
                      "border-primary bg-card text-primary ring-4 ring-primary/20",
                    !isCompleted &&
                      !isActive &&
                      "border-muted-foreground/30 bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px] line-clamp-1",
                    isActive && "font-bold text-foreground",
                    isCompleted && "text-muted-foreground",
                    !isActive && !isCompleted && "text-muted-foreground/60"
                  )}
                >
                  {step.shortTitle}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t text-left">
          <h2 className="text-lg font-bold text-foreground">{currentStepInfo.title}</h2>
          <p className="text-xs text-muted-foreground">{currentStepInfo.description}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ProviderWizardFormData,
  INITIAL_WIZARD_FORM_DATA,
  WizardStepId,
} from "@/components/provider/wizard/types";
import { WizardProgressHeader } from "@/components/provider/wizard/WizardProgressHeader";
import { Step1Identity } from "@/components/provider/wizard/Step1Identity";
import { Step2Services } from "@/components/provider/wizard/Step2Services";
import { Step3Coverage } from "@/components/provider/wizard/Step3Coverage";
import { Step4Verification } from "@/components/provider/wizard/Step4Verification";
import { Step5Review } from "@/components/provider/wizard/Step5Review";
import { FullScreenLoader } from "@/components/auth/FullScreenLoader";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DRAFT_STORAGE_KEY = "labourin_provider_onboarding_draft";

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const onboardingStatus = useQuery(api.authed.onboarding.getProviderOnboardingStatus);

  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [hasPrefilledRejected, setHasPrefilledRejected] = useState(false);
  const [formData, setFormData] = useState<ProviderWizardFormData>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          return { ...INITIAL_WIZARD_FORM_DATA, ...JSON.parse(savedDraft) };
        }
      } catch (e) {
        console.warn("Failed to load provider onboarding draft from localStorage:", e);
      }
    }
    return INITIAL_WIZARD_FORM_DATA;
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsHydrated(true);
    });
  }, []);

  // Redirect if already pending or approved, or prefill if rejected
  useEffect(() => {
    if (!onboardingStatus) return;

    if (onboardingStatus.status === "pending") {
      router.replace("/provider/pending");
    } else if (onboardingStatus.status === "approved") {
      router.replace("/provider");
    } else if (
      onboardingStatus.status === "rejected" &&
      onboardingStatus.profile &&
      !hasPrefilledRejected
    ) {
      const p = onboardingStatus.profile;
      queueMicrotask(() => {
        setHasPrefilledRejected(true);
        setFormData((prev) => ({
          ...prev,
          displayName: p.displayName || prev.displayName,
          bio: p.bio || prev.bio,
          experienceYears: p.experienceYears ?? prev.experienceYears,
          primaryCategoryId: p.primaryCategoryId || prev.primaryCategoryId,
          skillIds: p.skillIds || prev.skillIds,
          cityId: p.cityId || prev.cityId,
          areaIds: p.areaIds || prev.areaIds,
          phoneNumber: p.phoneNumber || prev.phoneNumber,
          whatsappNumber: p.whatsappNumber || prev.whatsappNumber,
          whatsappSameAsPhone: !p.whatsappNumber || p.whatsappNumber === p.phoneNumber,
        }));
      });
    }
  }, [onboardingStatus, router, hasPrefilledRejected]);

  // 3. Save draft to localStorage whenever formData changes
  const updateFormData = useCallback((patch: Partial<ProviderWizardFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save draft to localStorage:", e);
      }
      return updated;
    });
  }, []);

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as WizardStepId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStepId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToStep = (step: WizardStepId) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmissionSuccess = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear onboarding draft:", e);
    }
    router.replace("/provider/pending");
  };

  if (!isHydrated || onboardingStatus === undefined) {
    return <FullScreenLoader label="Loading onboarding wizard..." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Top Banner if Resubmitting Rejected Profile */}
      {onboardingStatus?.status === "rejected" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs">
          <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-destructive text-sm">
                Application Needs Revision
              </h3>
              <Badge variant="destructive" className="text-[10px]">
                Rejected
              </Badge>
            </div>
            <p className="text-destructive/90 leading-relaxed">
              Reason: {onboardingStatus.profile?.rejectionReason || "Please review and update your profile details before resubmitting."}
            </p>
          </div>
        </div>
      )}

      {/* Header Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Provider Profile & Verification Onboarding
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your trade profile and identity verification to start accepting service requests across Pakistan.
        </p>
      </div>

      {/* Progress Header */}
      <WizardProgressHeader
        currentStep={currentStep}
        onStepClick={handleGoToStep}
      />

      {/* Step Components */}
      <div className="mt-4">
        {currentStep === 1 && (
          <Step1Identity
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
          />
        )}
        {currentStep === 2 && (
          <Step2Services
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Coverage
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Verification
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}
        {currentStep === 5 && (
          <Step5Review
            formData={formData}
            onBack={handleBackStep}
            onGoToStep={handleGoToStep}
            onSuccess={handleSubmissionSuccess}
          />
        )}
      </div>
    </div>
  );
}

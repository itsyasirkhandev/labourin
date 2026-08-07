"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ProviderWizardFormData,
  FALLBACK_CATEGORIES,
  FALLBACK_CITIES,
  WizardStepId,
} from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Layers,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface Step5ReviewProps {
  formData: ProviderWizardFormData;
  updateFormData: (patch: Partial<ProviderWizardFormData>) => void;
  onBack: () => void;
  onGoToStep: (step: WizardStepId) => void;
  onSuccess: () => void;
}

interface ReviewSectionCardProps {
  title: string;
  icon: React.ReactNode;
  stepId: WizardStepId;
  disabled: boolean;
  onGoToStep: (step: WizardStepId) => void;
  children: React.ReactNode;
}

function ReviewSectionCard({
  title,
  icon,
  stepId,
  disabled,
  onGoToStep,
  children,
}: ReviewSectionCardProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold flex items-center gap-1.5 text-foreground">
          {icon}
          {title}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onGoToStep(stepId)}
          disabled={disabled}
          className="h-7 px-2 text-xs text-primary hover:text-primary/80"
        >
          <Edit3 className="size-3 mr-1" /> Edit
        </Button>
      </div>
      {children}
    </div>
  );
}

export function Step5Review({
  formData,
  updateFormData,
  onBack,
  onGoToStep,
  onSuccess,
}: Step5ReviewProps) {
  const submitProviderOnboarding = useMutation(
    api.authed.onboarding.submitProviderOnboarding
  );

  const termsAccepted = formData.termsAccepted;
  const setTermsAccepted = (val: boolean) => updateFormData({ termsAccepted: val });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convexCategories = useQuery(api.public.categories.listCategories, {
    onlyActive: true,
  });
  const convexCities = useQuery(api.public.locations.listCities, {
    onlyActive: true,
  });
  const convexSkills = useQuery(
    api.public.categories.listSkills,
    formData.primaryCategoryId && !formData.primaryCategoryId.startsWith("fallback_")
      ? { categoryId: formData.primaryCategoryId as Id<"categories"> }
      : "skip"
  );
  const convexAreas = useQuery(
    api.public.locations.listAreas,
    formData.cityId && !formData.cityId.startsWith("fallback_")
      ? { cityId: formData.cityId as Id<"cities"> }
      : "skip"
  );

  const categoryName = useMemo(() => {
    if (convexCategories) {
      const match = convexCategories.find((c) => c._id === formData.primaryCategoryId);
      if (match) return match.name;
    }
    const fallback = FALLBACK_CATEGORIES.find((c) => c._id === formData.primaryCategoryId);
    return fallback ? fallback.name : "Selected Category";
  }, [convexCategories, formData.primaryCategoryId]);

  const skillNames = useMemo(() => {
    if (convexSkills && convexSkills.length > 0) {
      const skillsMap = new Map(convexSkills.map((s) => [s._id as string, s.name]));
      return formData.skillIds.reduce<string[]>((acc, id) => {
        const name = skillsMap.get(id);
        if (name) acc.push(name);
        return acc;
      }, []);
    }
    const fallbackCat = FALLBACK_CATEGORIES.find((c) => c._id === formData.primaryCategoryId);
    if (fallbackCat) {
      const fallbackMap = new Map(fallbackCat.skills.map((s) => [s._id, s.name]));
      return formData.skillIds.reduce<string[]>((acc, id) => {
        const name = fallbackMap.get(id);
        if (name) acc.push(name);
        return acc;
      }, []);
    }
    return [];
  }, [convexSkills, formData.primaryCategoryId, formData.skillIds]);

  const cityName = useMemo(() => {
    if (convexCities) {
      const match = convexCities.find((c) => c._id === formData.cityId);
      if (match) return match.name;
    }
    const fallback = FALLBACK_CITIES.find((c) => c._id === formData.cityId);
    return fallback ? fallback.name : "Selected City";
  }, [convexCities, formData.cityId]);

  const areaNames = useMemo(() => {
    if (convexAreas && convexAreas.length > 0) {
      const areasMap = new Map(convexAreas.map((a) => [a._id as string, a.name]));
      return formData.areaIds.reduce<string[]>((acc, id) => {
        const name = areasMap.get(id);
        if (name) acc.push(name);
        return acc;
      }, []);
    }
    const fallbackCity = FALLBACK_CITIES.find((c) => c._id === formData.cityId);
    if (fallbackCity) {
      const fallbackMap = new Map(fallbackCity.areas.map((a) => [a._id, a.name]));
      return formData.areaIds.reduce<string[]>((acc, id) => {
        const name = fallbackMap.get(id);
        if (name) acc.push(name);
        return acc;
      }, []);
    }
    return [];
  }, [convexAreas, formData.cityId, formData.areaIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("You must accept the terms & verification consent to submit your profile.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitProviderOnboarding({
        displayName: formData.displayName,
        bio: formData.bio,
        experienceYears: formData.experienceYears,
        primaryCategoryId: formData.primaryCategoryId as Id<"categories">,
        skillIds: formData.skillIds as Array<Id<"skills">>,
        cityId: formData.cityId as Id<"cities">,
        areaIds: formData.areaIds as Array<Id<"areas">>,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappSameAsPhone
          ? formData.phoneNumber
          : formData.whatsappNumber || undefined,
        cnicFrontStorageId: formData.cnicFrontStorageId as Id<"_storage">,
        cnicBackStorageId: formData.cnicBackStorageId as Id<"_storage">,
        cnicNumber: formData.cnicNumber,
      });

      onSuccess();
    } catch (err) {
      console.error("Submission error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 rounded-xl border bg-card p-5 shadow-xs">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="size-5 text-primary" />
          Review Profile & Verification Submission
        </h3>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 text-sm">
          <ReviewSectionCard
            title="Identity & Bio"
            icon={<User className="size-4 text-primary" />}
            stepId={1}
            disabled={isSubmitting}
            onGoToStep={onGoToStep}
          >
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-foreground">Name:</span> {formData.displayName}</p>
              <p><span className="font-medium text-foreground">Experience:</span> {formData.experienceYears} Years</p>
              <p><span className="font-medium text-foreground">Summary:</span> {formData.bio}</p>
            </div>
          </ReviewSectionCard>

          <ReviewSectionCard
            title="Trade & Skills"
            icon={<Layers className="size-4 text-primary" />}
            stepId={2}
            disabled={isSubmitting}
            onGoToStep={onGoToStep}
          >
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-foreground">Primary Category:</span> {categoryName}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skillNames.length > 0 ? (
                  skillNames.map((name) => (
                    <Badge key={name} variant="secondary" className="text-[11px]">
                      {name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">{formData.skillIds.length} skills selected</span>
                )}
              </div>
            </div>
          </ReviewSectionCard>

          <ReviewSectionCard
            title="Coverage & Contact"
            icon={<MapPin className="size-4 text-primary" />}
            stepId={3}
            disabled={isSubmitting}
            onGoToStep={onGoToStep}
          >
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-foreground">City:</span> {cityName}</p>
              <p><span className="font-medium text-foreground">Mobile Phone:</span> {formData.phoneNumber}</p>
              <p>
                <span className="font-medium text-foreground">WhatsApp:</span>{" "}
                {formData.whatsappSameAsPhone
                  ? `${formData.phoneNumber} (Same)`
                  : formData.whatsappNumber || "Not provided"}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="font-medium text-foreground mr-1">Areas:</span>
                {areaNames.length > 0 ? (
                  areaNames.map((name) => (
                    <Badge key={name} variant="outline" className="text-[10px]">
                      {name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">{formData.areaIds.length} areas selected</span>
                )}
              </div>
            </div>
          </ReviewSectionCard>

          <ReviewSectionCard
            title="CNIC Verification Documents"
            icon={<ShieldCheck className="size-4 text-primary" />}
            stepId={4}
            disabled={isSubmitting}
            onGoToStep={onGoToStep}
          >
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-foreground">CNIC Number:</span> <span className="font-mono">{formData.cnicNumber}</span></p>
              <div className="flex items-center gap-3 pt-1">
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30">
                  Front Image Ready
                </Badge>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30">
                  Back Image Ready
                </Badge>
              </div>
            </div>
          </ReviewSectionCard>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-start gap-2.5">
            <input
              id="termsAccepted"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 rounded border-input accent-primary text-primary focus:ring-ring cursor-pointer"
            />
            <label
              htmlFor="termsAccepted"
              className="text-xs text-muted-foreground cursor-pointer select-none leading-relaxed"
            >
              I confirm that all information provided is accurate and belongs to me. I consent to LabourIn verifying my CNIC credentials for platform trust and safety purposes. I understand that my account will remain in <span className="font-semibold text-foreground">pending verification status</span> until reviewed by LabourIn support.
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          &larr; Back
        </Button>
        <Button type="submit" disabled={isSubmitting || !termsAccepted} className="px-8 font-semibold">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting Profile...
            </>
          ) : (
            "Submit for Verification"
          )}
        </Button>
      </div>
    </form>
  );
}

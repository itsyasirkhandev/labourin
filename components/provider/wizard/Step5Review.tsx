"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
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

interface Step5ReviewProps {
  formData: ProviderWizardFormData;
  onBack: () => void;
  onGoToStep: (step: WizardStepId) => void;
  onSuccess: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError && error.data && typeof error.data === "object") {
    const data = error.data as { message?: unknown; data?: { message?: unknown } };
    if (typeof data.message === "string") return data.message;
    if (typeof data.data?.message === "string") return data.data.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred while submitting your onboarding profile.";
}

export function Step5Review({
  formData,
  onBack,
  onGoToStep,
  onSuccess,
}: Step5ReviewProps) {
  const submitProviderOnboarding = useMutation(
    api.authed.onboarding.submitProviderOnboarding
  );

  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries for label resolution
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

  // Resolved Category Name
  const categoryName = useMemo(() => {
    if (convexCategories) {
      const match = convexCategories.find((c) => c._id === formData.primaryCategoryId);
      if (match) return match.name;
    }
    const fallback = FALLBACK_CATEGORIES.find((c) => c._id === formData.primaryCategoryId);
    return fallback ? fallback.name : "Selected Category";
  }, [convexCategories, formData.primaryCategoryId]);

  // Resolved Skill Names
  const skillNames = useMemo(() => {
    if (convexSkills && convexSkills.length > 0) {
      return formData.skillIds
        .map((id) => convexSkills.find((s) => s._id === id)?.name)
        .filter(Boolean) as string[];
    }
    const fallbackCat = FALLBACK_CATEGORIES.find((c) => c._id === formData.primaryCategoryId);
    if (fallbackCat) {
      return formData.skillIds
        .map((id) => fallbackCat.skills.find((s) => s._id === id)?.name)
        .filter(Boolean) as string[];
    }
    return [];
  }, [convexSkills, formData.primaryCategoryId, formData.skillIds]);

  // Resolved City Name
  const cityName = useMemo(() => {
    if (convexCities) {
      const match = convexCities.find((c) => c._id === formData.cityId);
      if (match) return match.name;
    }
    const fallback = FALLBACK_CITIES.find((c) => c._id === formData.cityId);
    return fallback ? fallback.name : "Selected City";
  }, [convexCities, formData.cityId]);

  // Resolved Area Names
  const areaNames = useMemo(() => {
    if (convexAreas && convexAreas.length > 0) {
      return formData.areaIds
        .map((id) => convexAreas.find((a) => a._id === id)?.name)
        .filter(Boolean) as string[];
    }
    const fallbackCity = FALLBACK_CITIES.find((c) => c._id === formData.cityId);
    if (fallbackCity) {
      return formData.areaIds
        .map((id) => fallbackCity.areas.find((a) => a._id === id)?.name)
        .filter(Boolean) as string[];
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

      setIsSubmitting(false);
      onSuccess();
    } catch (err) {
      console.error("Submission error:", err);
      setError(getErrorMessage(err));
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
          {/* Section 1: Identity */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5 text-foreground">
                <User className="size-4 text-primary" />
                Identity & Bio
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGoToStep(1)}
                disabled={isSubmitting}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
              >
                <Edit3 className="size-3 mr-1" /> Edit
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-foreground">Name:</span> {formData.displayName}</p>
              <p><span className="font-medium text-foreground">Experience:</span> {formData.experienceYears} Years</p>
              <p><span className="font-medium text-foreground">Summary:</span> {formData.bio}</p>
            </div>
          </div>

          {/* Section 2: Services */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5 text-foreground">
                <Layers className="size-4 text-primary" />
                Trade & Skills
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGoToStep(2)}
                disabled={isSubmitting}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
              >
                <Edit3 className="size-3 mr-1" /> Edit
              </Button>
            </div>
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
          </div>

          {/* Section 3: Coverage & Contact */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5 text-foreground">
                <MapPin className="size-4 text-primary" />
                Coverage & Contact
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGoToStep(3)}
                disabled={isSubmitting}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
              >
                <Edit3 className="size-3 mr-1" /> Edit
              </Button>
            </div>
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
          </div>

          {/* Section 4: CNIC Verification */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5 text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                CNIC Verification Documents
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGoToStep(4)}
                disabled={isSubmitting}
                className="h-7 px-2 text-xs text-primary hover:text-primary/80"
              >
                <Edit3 className="size-3 mr-1" /> Edit
              </Button>
            </div>
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
          </div>
        </div>

        {/* Terms & Consent Checkbox */}
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

      {/* Actions */}
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

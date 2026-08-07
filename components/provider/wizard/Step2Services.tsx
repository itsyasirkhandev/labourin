"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ProviderWizardFormData,
  FALLBACK_CATEGORIES,
} from "./types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wrench, Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2ServicesProps {
  formData: ProviderWizardFormData;
  updateFormData: (patch: Partial<ProviderWizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Services({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step2ServicesProps) {
  const [error, setError] = useState<string | null>(null);

  const seedInitialData = useMutation(api.public.seed.seedInitialData);

  // Fetch categories & skills from Convex public queries
  const convexCategories = useQuery(api.public.categories.listCategories, {
    onlyActive: true,
  });
  const convexSkills = useQuery(
    api.public.categories.listSkills,
    formData.primaryCategoryId && !formData.primaryCategoryId.startsWith("fallback_")
      ? {
          categoryId: formData.primaryCategoryId as Id<"categories">,
          onlyActive: true,
        }
      : "skip"
  );

  // Auto-seed database if empty
  useEffect(() => {
    if (convexCategories !== undefined && convexCategories.length === 0) {
      seedInitialData().catch(console.error);
    }
  }, [convexCategories, seedInitialData]);

  // Auto-heal fallback category ID to real DB ID
  useEffect(() => {
    if (formData.primaryCategoryId?.startsWith("fallback_") && convexCategories && convexCategories.length > 0) {
      const fallbackCat = FALLBACK_CATEGORIES.find((c) => c._id === formData.primaryCategoryId);
      const matchedCat = convexCategories.find(
        (c) => c.slug === fallbackCat?.slug || c.name === fallbackCat?.name
      );
      if (matchedCat) {
        updateFormData({ primaryCategoryId: matchedCat._id, skillIds: [] });
      }
    }
  }, [formData.primaryCategoryId, convexCategories, updateFormData]);

  // Auto-heal fallback skill IDs to real DB skill IDs
  useEffect(() => {
    if (
      formData.skillIds.some((id) => id.startsWith("fallback_")) &&
      convexSkills &&
      convexSkills.length > 0 &&
      formData.primaryCategoryId &&
      !formData.primaryCategoryId.startsWith("fallback_")
    ) {
      const fallbackCat = FALLBACK_CATEGORIES.find((c) =>
        c.skills.some((s) => formData.skillIds.includes(s._id))
      );
      if (fallbackCat) {
        const fallbackSkillNames = new Set(
          fallbackCat.skills
            .filter((s) => formData.skillIds.includes(s._id))
            .map((s) => s.name)
        );
        const matchedSkillIds = convexSkills
          .filter((s) => fallbackSkillNames.has(s.name))
          .map((s) => s._id);
        if (matchedSkillIds.length > 0) {
          updateFormData({ skillIds: matchedSkillIds });
        }
      }
    }
  }, [formData.skillIds, convexSkills, formData.primaryCategoryId, updateFormData]);

  // Normalize category options (Convex DB vs Fallback)
  const categoriesList = useMemo(() => {
    if (convexCategories && convexCategories.length > 0) {
      return convexCategories.map((cat) => ({
        _id: cat._id as string,
        name: cat.name,
        slug: cat.slug,
        isActive: cat.isActive,
      }));
    }
    return FALLBACK_CATEGORIES.map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      isActive: c.isActive,
    }));
  }, [convexCategories]);

  // Normalize skill options for selected category
  const currentSkillsList = useMemo(() => {
    if (!formData.primaryCategoryId) return [];

    // If using fallback category ID
    if (formData.primaryCategoryId.startsWith("fallback_")) {
      const fallbackCat = FALLBACK_CATEGORIES.find(
        (c) => c._id === formData.primaryCategoryId
      );
      return fallbackCat ? fallbackCat.skills : [];
    }

    // If using DB category ID
    if (convexSkills && convexSkills.length > 0) {
      return convexSkills.map((s) => ({
        _id: s._id as string,
        name: s.name,
        isActive: s.isActive,
      }));
    }

    // If DB skills query returned empty array or is pending, check if fallback matches by slug or ID
    const fallbackMatch = FALLBACK_CATEGORIES.find(
      (c) => c._id === formData.primaryCategoryId
    );
    return fallbackMatch ? fallbackMatch.skills : [];
  }, [formData.primaryCategoryId, convexSkills]);

  const handleCategorySelect = (catId: string) => {
    if (catId === formData.primaryCategoryId) return;
    updateFormData({
      primaryCategoryId: catId,
      skillIds: [], // Reset skills when category changes
    });
    setError(null);
  };

  // Memoized Set for O(1) skill selection checks
  const selectedSkillIds = useMemo(
    () => new Set(formData.skillIds),
    [formData.skillIds]
  );

  const toggleSkill = (skillId: string) => {
    if (selectedSkillIds.has(skillId)) {
      updateFormData({
        skillIds: formData.skillIds.filter((id) => id !== skillId),
      });
    } else {
      updateFormData({
        skillIds: [...formData.skillIds, skillId],
      });
    }
    if (error) setError(null);
  };

  const handleNextSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.primaryCategoryId) {
      setError("Please select a primary trade category.");
      return;
    }

    if (formData.skillIds.length === 0) {
      setError("Please select at least one skill within your primary category.");
      return;
    }

    setError(null);
    onNext();
  };

  return (
    <form onSubmit={handleNextSubmit} className="space-y-6">
      <div className="space-y-6 rounded-xl border bg-card p-5 shadow-xs">
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold text-base">
            <Layers className="size-5 text-primary" />
            1. Select Primary Category <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Choose the main field of work you specialize in.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesList.map((cat) => {
              const isSelected = formData.primaryCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleCategorySelect(cat._id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-background hover:bg-muted/50 text-foreground"
                  )}
                >
                  <span className="font-medium text-sm">{cat.name}</span>
                  {isSelected && (
                    <Badge variant="default" className="size-6 p-0 flex items-center justify-center rounded-full">
                      <Check strokeWidth={3} className="size-3.5" />
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Multi-Select */}
        {formData.primaryCategoryId && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="flex items-center gap-2 font-semibold text-base">
              <Wrench className="size-5 text-primary" />
              2. Select Specific Skills <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Select all tasks and services you are qualified to perform.
            </p>

            {currentSkillsList.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No specific skills found for this category. You can proceed to the next step.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentSkillsList.map((skill) => {
                  const isSelected = selectedSkillIds.has(skill._id);
                  return (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => toggleSkill(skill._id)}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-lg border text-left text-sm transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/15 font-medium text-foreground ring-1 ring-primary/30"
                          : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <span>{skill.name}</span>
                      <div
                        className={cn(
                          "size-5 rounded border flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-background"
                        )}
                      >
                        {isSelected && <Check strokeWidth={3} className="size-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Back
        </Button>
        <Button type="submit" className="px-8">
          Next: Coverage & Contact &rarr;
        </Button>
      </div>
    </form>
  );
}

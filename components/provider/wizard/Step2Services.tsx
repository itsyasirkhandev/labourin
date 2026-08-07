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

interface CategoryGridProps {
  categoriesList: Array<{ _id: string; name: string }>;
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
}

function CategoryGrid({
  categoriesList,
  selectedCategoryId,
  onSelectCategory,
}: CategoryGridProps) {
  return (
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
          const isSelected = selectedCategoryId === cat._id;
          return (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelectCategory(cat._id)}
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
  );
}

interface SkillGridProps {
  skillsList: Array<{ _id: string; name: string }>;
  selectedSkillIds: Set<string>;
  onToggleSkill: (id: string) => void;
}

function SkillGrid({
  skillsList,
  selectedSkillIds,
  onToggleSkill,
}: SkillGridProps) {
  return (
    <div className="space-y-3 pt-4 border-t">
      <Label className="flex items-center gap-2 font-semibold text-base">
        <Wrench className="size-5 text-primary" />
        2. Select Specific Skills <span className="text-destructive">*</span>
      </Label>
      <p className="text-xs text-muted-foreground">
        Select all tasks and services you are qualified to perform.
      </p>

      {skillsList.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No specific skills found for this category. You can proceed to the next step.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {skillsList.map((skill) => {
            const isSelected = selectedSkillIds.has(skill._id);
            return (
              <button
                key={skill._id}
                type="button"
                onClick={() => onToggleSkill(skill._id)}
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
  );
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

  // Derived effective category ID (auto-healing fallback ID to Convex DB ID if needed)
  const effectiveCategoryId = useMemo(() => {
    if (
      formData.primaryCategoryId?.startsWith("fallback_") &&
      convexCategories &&
      convexCategories.length > 0
    ) {
      const fallbackCat = FALLBACK_CATEGORIES.find(
        (c) => c._id === formData.primaryCategoryId
      );
      const matchedCat = convexCategories.find(
        (c) => c.slug === fallbackCat?.slug || c.name === fallbackCat?.name
      );
      if (matchedCat) return matchedCat._id;
    }
    return formData.primaryCategoryId;
  }, [formData.primaryCategoryId, convexCategories]);

  const convexSkills = useQuery(
    api.public.categories.listSkills,
    effectiveCategoryId && !effectiveCategoryId.startsWith("fallback_")
      ? {
          categoryId: effectiveCategoryId as Id<"categories">,
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

  // Memoized Set for fast skill ID checks
  const skillIdSet = useMemo(
    () => new Set(formData.skillIds),
    [formData.skillIds]
  );

  // Derived effective skill IDs (auto-healing fallback IDs to Convex DB IDs if needed)
  const effectiveSkillIds = useMemo(() => {
    const hasFallback = formData.skillIds.some((id) => id.startsWith("fallback_"));
    if (
      !hasFallback ||
      !convexSkills ||
      convexSkills.length === 0 ||
      !effectiveCategoryId ||
      effectiveCategoryId.startsWith("fallback_")
    ) {
      return formData.skillIds;
    }

    const fallbackCat = FALLBACK_CATEGORIES.find((c) =>
      c.skills.some((s) => skillIdSet.has(s._id))
    );
    if (!fallbackCat) return formData.skillIds;

    const fallbackSkillNames = new Set<string>();
    for (const s of fallbackCat.skills) {
      if (skillIdSet.has(s._id)) {
        fallbackSkillNames.add(s.name);
      }
    }

    const matchedSkillIds: string[] = [];
    for (const s of convexSkills) {
      if (fallbackSkillNames.has(s.name)) {
        matchedSkillIds.push(s._id);
      }
    }

    return matchedSkillIds.length > 0 ? matchedSkillIds : formData.skillIds;
  }, [formData.skillIds, skillIdSet, convexSkills, effectiveCategoryId]);

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
    if (!effectiveCategoryId) return [];

    // If using fallback category ID
    if (effectiveCategoryId.startsWith("fallback_")) {
      const fallbackCat = FALLBACK_CATEGORIES.find(
        (c) => c._id === effectiveCategoryId
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
      (c) => c._id === effectiveCategoryId
    );
    return fallbackMatch ? fallbackMatch.skills : [];
  }, [effectiveCategoryId, convexSkills]);

  const handleCategorySelect = (catId: string) => {
    if (catId === effectiveCategoryId) return;
    updateFormData({
      primaryCategoryId: catId,
      skillIds: [], // Reset skills when category changes
    });
    setError(null);
  };

  // Memoized Set for O(1) skill selection checks
  const selectedSkillIds = useMemo(
    () => new Set(effectiveSkillIds),
    [effectiveSkillIds]
  );

  const toggleSkill = (skillId: string) => {
    if (selectedSkillIds.has(skillId)) {
      updateFormData({
        primaryCategoryId: effectiveCategoryId,
        skillIds: effectiveSkillIds.filter((id) => id !== skillId),
      });
    } else {
      updateFormData({
        primaryCategoryId: effectiveCategoryId,
        skillIds: [...effectiveSkillIds, skillId],
      });
    }
    if (error) setError(null);
  };

  const handleNextSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategoryId = effectiveCategoryId;
    const finalSkillIds = effectiveSkillIds;

    if (!finalCategoryId) {
      setError("Please select a primary trade category.");
      return;
    }

    if (finalSkillIds.length === 0) {
      setError("Please select at least one skill within your primary category.");
      return;
    }

    if (
      finalCategoryId !== formData.primaryCategoryId ||
      finalSkillIds !== formData.skillIds
    ) {
      updateFormData({
        primaryCategoryId: finalCategoryId,
        skillIds: finalSkillIds,
      });
    }

    setError(null);
    onNext();
  };

  return (
    <form onSubmit={handleNextSubmit} className="space-y-6">
      <div className="space-y-6 rounded-xl border bg-card p-5 shadow-xs">
        <CategoryGrid
          categoriesList={categoriesList}
          selectedCategoryId={effectiveCategoryId}
          onSelectCategory={handleCategorySelect}
        />

        {effectiveCategoryId && (
          <SkillGrid
            skillsList={currentSkillsList}
            selectedSkillIds={selectedSkillIds}
            onToggleSkill={toggleSkill}
          />
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

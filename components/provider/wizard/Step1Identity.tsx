"use client";

import { useState } from "react";
import { ProviderWizardFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, FileText, Briefcase, Minus, Plus } from "lucide-react";

interface Step1IdentityProps {
  formData: ProviderWizardFormData;
  updateFormData: (patch: Partial<ProviderWizardFormData>) => void;
  onNext: () => void;
}

export function Step1Identity({
  formData,
  updateFormData,
  onNext,
}: Step1IdentityProps) {
  const [errors, setErrors] = useState<{ displayName?: string; bio?: string }>(
    {}
  );

  const validateAndNext = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { displayName?: string; bio?: string } = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Full name or business display name is required.";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters.";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Please provide a short summary of your work or skills.";
    } else if (formData.bio.trim().length < 10) {
      newErrors.bio = "Bio summary should be at least 10 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  const adjustExperience = (delta: number) => {
    const nextVal = Math.max(0, Math.min(50, formData.experienceYears + delta));
    updateFormData({ experienceYears: nextVal });
  };

  return (
    <form onSubmit={validateAndNext} className="space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="flex items-center gap-2 font-medium">
            <User className="size-4 text-primary" />
            Full Name or Business Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="displayName"
            placeholder="e.g. Mohammad Ali or Ali Electric Works"
            value={formData.displayName}
            onChange={(e) => {
              updateFormData({ displayName: e.target.value });
              if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
            }}
            className="w-full"
            aria-invalid={!!errors.displayName}
          />
          {errors.displayName ? (
            <p className="text-xs font-medium text-destructive">{errors.displayName}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              This name will be shown to customers seeking service.
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="flex items-center gap-2 font-medium">
            <FileText className="size-4 text-primary" />
            Short Professional Summary / Bio <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Describe your expertise, experience, and services you specialize in..."
            value={formData.bio}
            onChange={(e) => {
              updateFormData({ bio: e.target.value });
              if (errors.bio) setErrors((prev) => ({ ...prev, bio: undefined }));
            }}
            className="w-full resize-none"
            aria-invalid={!!errors.bio}
          />
          {errors.bio ? (
            <p className="text-xs font-medium text-destructive">{errors.bio}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Briefly describe your experience and work quality (min 10 characters).
            </p>
          )}
        </div>

        {/* Experience Years */}
        <div className="space-y-2 pt-2">
          <Label className="flex items-center gap-2 font-medium">
            <Briefcase className="size-4 text-primary" />
            Years of Work Experience
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border bg-muted/30 p-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustExperience(-1)}
                disabled={formData.experienceYears <= 0}
                className="size-9 rounded-md"
              >
                <Minus className="size-4" />
              </Button>
              <div className="w-16 text-center text-lg font-bold text-foreground">
                {formData.experienceYears} {formData.experienceYears === 1 ? "Year" : "Years"}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustExperience(1)}
                disabled={formData.experienceYears >= 50}
                className="size-9 rounded-md"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Select total professional experience in your primary trade.
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end pt-2">
        <Button type="submit" className="w-full sm:w-auto px-8">
          Next: Select Services &rarr;
        </Button>
      </div>
    </form>
  );
}

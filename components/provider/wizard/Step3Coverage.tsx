"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ProviderWizardFormData,
  FALLBACK_CITIES,
  isValidPakistaniPhone,
} from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, MessageSquare, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step3CoverageProps {
  formData: ProviderWizardFormData;
  updateFormData: (patch: Partial<ProviderWizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Coverage({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step3CoverageProps) {
  const [errors, setErrors] = useState<{
    cityId?: string;
    areaIds?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  }>({});

  // Query cities & areas from Convex
  const convexCities = useQuery(api.public.locations.listCities, {
    onlyActive: true,
  });
  const convexAreas = useQuery(
    api.public.locations.listAreas,
    formData.cityId && !formData.cityId.startsWith("fallback_")
      ? {
          cityId: formData.cityId as Id<"cities">,
          onlyActive: true,
        }
      : "skip"
  );

  // Normalize cities list
  const citiesList = useMemo(() => {
    if (convexCities && convexCities.length > 0) {
      return convexCities.map((c) => ({
        _id: c._id as string,
        name: c.name,
        code: c.code,
        isActive: c.isActive,
      }));
    }
    return FALLBACK_CITIES.map((c) => ({
      _id: c._id,
      name: c.name,
      code: c.code,
      isActive: c.isActive,
    }));
  }, [convexCities]);

  // Normalize areas list for selected city
  const currentAreasList = useMemo(() => {
    if (!formData.cityId) return [];

    if (formData.cityId.startsWith("fallback_")) {
      const fallbackCity = FALLBACK_CITIES.find(
        (c) => c._id === formData.cityId
      );
      return fallbackCity ? fallbackCity.areas : [];
    }

    if (convexAreas && convexAreas.length > 0) {
      return convexAreas.map((a) => ({
        _id: a._id as string,
        name: a.name,
        isActive: a.isActive,
      }));
    }

    const fallbackMatch = FALLBACK_CITIES.find(
      (c) => c._id === formData.cityId
    );
    return fallbackMatch ? fallbackMatch.areas : [];
  }, [formData.cityId, convexAreas]);

  const handleCitySelect = (cityId: string) => {
    if (cityId === formData.cityId) return;
    updateFormData({
      cityId,
      areaIds: [], // Reset selected areas when city changes
    });
    setErrors((prev) => ({ ...prev, cityId: undefined, areaIds: undefined }));
  };

  const toggleArea = (areaId: string) => {
    const isSelected = formData.areaIds.includes(areaId);
    let updated: string[];
    if (isSelected) {
      updated = formData.areaIds.filter((id) => id !== areaId);
    } else {
      updated = [...formData.areaIds, areaId];
    }
    updateFormData({ areaIds: updated });
    setErrors((prev) => ({ ...prev, areaIds: undefined }));
  };

  const handlePhoneChange = (val: string) => {
    const updatePatch: Partial<ProviderWizardFormData> = { phoneNumber: val };
    if (formData.whatsappSameAsPhone) {
      updatePatch.whatsappNumber = val;
    }
    updateFormData(updatePatch);
    setErrors((prev) => ({ ...prev, phoneNumber: undefined, whatsappNumber: undefined }));
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    updateFormData({
      whatsappSameAsPhone: checked,
      whatsappNumber: checked ? formData.phoneNumber : "",
    });
    setErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!formData.cityId) {
      newErrors.cityId = "Please select an operating city.";
    }

    if (formData.areaIds.length === 0) {
      newErrors.areaIds = "Please select at least one area/neighborhood you cover.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Mobile phone number is required.";
    } else if (!isValidPakistaniPhone(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Invalid phone format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX).";
    }

    const effectiveWhatsapp = formData.whatsappSameAsPhone
      ? formData.phoneNumber
      : formData.whatsappNumber;

    if (effectiveWhatsapp && !isValidPakistaniPhone(effectiveWhatsapp)) {
      newErrors.whatsappNumber =
        "Invalid WhatsApp number format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 rounded-xl border bg-card p-5 shadow-xs">
        {/* City Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold text-base">
            <Building2 className="size-5 text-primary" />
            1. Operating City <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Select the primary city in Pakistan where you provide services.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {citiesList.map((city) => {
              const isSelected = formData.cityId === city._id;
              return (
                <button
                  key={city._id}
                  type="button"
                  onClick={() => handleCitySelect(city._id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 font-bold"
                      : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">{city.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{city.code}</span>
                </button>
              );
            })}
          </div>
          {errors.cityId && (
            <p className="text-xs font-medium text-destructive">{errors.cityId}</p>
          )}
        </div>

        {/* Coverage Areas Selection */}
        {formData.cityId && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="flex items-center gap-2 font-semibold text-base">
              <MapPin className="size-5 text-primary" />
              2. Coverage Areas / Sectors <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Select all areas and neighborhoods where you can travel to accept jobs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {currentAreasList.map((area) => {
                const isSelected = formData.areaIds.includes(area._id);
                return (
                  <button
                    key={area._id}
                    type="button"
                    onClick={() => toggleArea(area._id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/15 font-medium text-foreground ring-1 ring-primary/30"
                        : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <span>{area.name}</span>
                    <div
                      className={cn(
                        "size-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background"
                      )}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.areaIds && (
              <p className="text-xs font-medium text-destructive">{errors.areaIds}</p>
            )}
          </div>
        )}

        {/* Phone & WhatsApp Contact Inputs */}
        <div className="space-y-4 pt-4 border-t">
          <Label className="flex items-center gap-2 font-semibold text-base">
            <Phone className="size-5 text-primary" />
            3. Contact Information <span className="text-destructive">*</span>
          </Label>

          {/* Primary Mobile Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-xs font-medium">
              Mobile Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="03001234567"
              value={formData.phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              aria-invalid={!!errors.phoneNumber}
              className="w-full"
            />
            {errors.phoneNumber ? (
              <p className="text-xs font-medium text-destructive">{errors.phoneNumber}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Format: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX
              </p>
            )}
          </div>

          {/* WhatsApp Toggle */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                id="whatsappSameAsPhone"
                type="checkbox"
                checked={formData.whatsappSameAsPhone}
                onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary text-primary focus:ring-ring cursor-pointer"
              />
              <label
                htmlFor="whatsappSameAsPhone"
                className="text-xs font-medium text-foreground cursor-pointer select-none flex items-center gap-1.5"
              >
                <MessageSquare className="size-3.5 text-muted-foreground" />
                WhatsApp number is same as mobile phone number
              </label>
            </div>

            {!formData.whatsappSameAsPhone && (
              <div className="space-y-1.5 pl-6 pt-1">
                <Label htmlFor="whatsappNumber" className="text-xs font-medium">
                  Separate WhatsApp Number
                </Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="03001234567"
                  value={formData.whatsappNumber}
                  onChange={(e) => {
                    updateFormData({ whatsappNumber: e.target.value });
                    setErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
                  }}
                  aria-invalid={!!errors.whatsappNumber}
                  className="w-full"
                />
                {errors.whatsappNumber && (
                  <p className="text-xs font-medium text-destructive">{errors.whatsappNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Back
        </Button>
        <Button type="submit" className="px-8">
          Next: CNIC Verification &rarr;
        </Button>
      </div>
    </form>
  );
}

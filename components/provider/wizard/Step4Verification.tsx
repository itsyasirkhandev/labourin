"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ProviderWizardFormData,
  isValidPakistaniCnic,
  formatCnicInput,
  hasFormErrors,
} from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  FileCheck,
  Loader2,
  AlertCircle,
  Lock,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step4VerificationProps {
  formData: ProviderWizardFormData;
  updateFormData: (patch: Partial<ProviderWizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
      <Lock className="size-5 shrink-0 text-primary mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-semibold text-foreground text-sm">
          Strict Verification Privacy Guarantee
        </h4>
        <p className="text-muted-foreground leading-relaxed">
          Your CNIC details and document images are encrypted and stored securely in Convex private storage. They are used exclusively by LabourIn administrators for account identity verification and are <span className="font-bold text-foreground">never shown publicly to customers or third parties</span>.
        </p>
      </div>
    </div>
  );
}

interface CnicUploadDropzoneProps {
  side: "front" | "back";
  label: string;
  storageId?: string;
  fileName?: string;
  uploading: boolean;
  disabled: boolean;
  error?: string;
  onFileSelect: (file: File) => void;
}

function CnicUploadDropzone({
  side,
  label,
  storageId,
  fileName,
  uploading,
  disabled,
  error,
  onFileSelect,
}: CnicUploadDropzoneProps) {
  const inputId = `cnic${side === "front" ? "Front" : "Back"}Input`;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold flex items-center justify-between">
        <span>{label} <span className="text-destructive">*</span></span>
        {storageId && (
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30">
            Uploaded
          </Badge>
        )}
      </Label>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all",
          storageId
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-border bg-muted/20 hover:bg-muted/40",
          uploading && "opacity-60 pointer-events-none"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Uploading {side} side...
            </span>
          </div>
        ) : storageId ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <FileCheck className="size-8 text-emerald-600" />
            <span className="text-xs font-medium text-foreground truncate max-w-48">
              {fileName || `CNIC ${side === "front" ? "Front" : "Back"} Uploaded`}
            </span>
            <label htmlFor={inputId} className="text-xs text-primary underline cursor-pointer hover:text-primary/80">
              Change image
            </label>
          </div>
        ) : (
          <label htmlFor={inputId} className="flex flex-col items-center gap-2 py-4 cursor-pointer w-full">
            <ImageIcon className="size-8 text-muted-foreground/60" />
            <span className="text-xs font-medium text-foreground">Upload CNIC {side === "front" ? "Front" : "Back"}</span>
            <span className="text-[10px] text-muted-foreground">JPG, PNG, or WEBP (Max 10MB)</span>
            <span className="mt-1 rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Browse File
            </span>
          </label>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
          disabled={disabled}
          className="sr-only"
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export function Step4Verification({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step4VerificationProps) {
  const generateUploadUrl = useMutation(api.authed.storage.generateCnicUploadUrl);

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const [errors, setErrors] = useState<{
    cnicNumber?: string;
    cnicFrontStorageId?: string;
    cnicBackStorageId?: string;
    uploadError?: string;
  }>({});

  const handleCnicChange = (rawVal: string) => {
    const formatted = formatCnicInput(rawVal);
    updateFormData({ cnicNumber: formatted });
    if (errors.cnicNumber) {
      setErrors((prev) => ({ ...prev, cnicNumber: undefined }));
    }
  };

  const handleFileUpload = async (
    file: File,
    side: "front" | "back"
  ) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        uploadError: "Please upload an image file (JPG, PNG, or WEBP).",
      }));
      return;
    }

    if (side === "front") setUploadingFront(true);
    else setUploadingBack(true);

    setErrors((prev) => ({ ...prev, uploadError: undefined }));

    try {
      const postUrl = await generateUploadUrl({});
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed with status code ${result.status}`);
      }

      const { storageId } = (await result.json()) as { storageId: string };

      if (side === "front") {
        updateFormData({
          cnicFrontStorageId: storageId,
          cnicFrontFileName: file.name,
        });
        setErrors((prev) => ({ ...prev, cnicFrontStorageId: undefined }));
      } else {
        updateFormData({
          cnicBackStorageId: storageId,
          cnicBackFileName: file.name,
        });
        setErrors((prev) => ({ ...prev, cnicBackStorageId: undefined }));
      }
    } catch (err) {
      console.error("CNIC upload error:", err);
      setErrors((prev) => ({
        ...prev,
        uploadError:
          err instanceof Error
            ? err.message
            : "Failed to upload CNIC image. Please try again.",
      }));
    } finally {
      setUploadingFront(false);
      setUploadingBack(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!formData.cnicNumber.trim()) {
      newErrors.cnicNumber = "13-digit CNIC number is required.";
    } else if (!isValidPakistaniCnic(formData.cnicNumber)) {
      newErrors.cnicNumber =
        "Invalid CNIC format. Must be 13 digits (e.g. XXXXX-XXXXXXX-X).";
    }

    if (!formData.cnicFrontStorageId) {
      newErrors.cnicFrontStorageId = "CNIC Front side image upload is required.";
    }

    if (!formData.cnicBackStorageId) {
      newErrors.cnicBackStorageId = "CNIC Back side image upload is required.";
    }

    if (hasFormErrors(newErrors, setErrors)) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 rounded-xl border bg-card p-5 shadow-xs">
        <PrivacyNotice />

        {errors.uploadError && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errors.uploadError}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cnicNumber" className="flex items-center gap-2 font-semibold text-sm">
            <ShieldCheck className="size-4 text-primary" />
            Computerized National Identity Card (CNIC) Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cnicNumber"
            type="text"
            placeholder="XXXXX-XXXXXXX-X"
            value={formData.cnicNumber}
            onChange={(e) => handleCnicChange(e.target.value)}
            maxLength={15}
            aria-invalid={!!errors.cnicNumber}
            className="w-full font-mono text-base tracking-wider"
          />
          {errors.cnicNumber ? (
            <p className="text-xs font-medium text-destructive">{errors.cnicNumber}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Format: 13 digits with hyphens (e.g., 35202-1234567-1).
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <CnicUploadDropzone
            side="front"
            label="CNIC Front Side Image"
            storageId={formData.cnicFrontStorageId}
            fileName={formData.cnicFrontFileName}
            uploading={uploadingFront}
            disabled={uploadingFront || uploadingBack}
            error={errors.cnicFrontStorageId}
            onFileSelect={(file) => handleFileUpload(file, "front")}
          />
          <CnicUploadDropzone
            side="back"
            label="CNIC Back Side Image"
            storageId={formData.cnicBackStorageId}
            fileName={formData.cnicBackFileName}
            uploading={uploadingBack}
            disabled={uploadingFront || uploadingBack}
            error={errors.cnicBackStorageId}
            onFileSelect={(file) => handleFileUpload(file, "back")}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={uploadingFront || uploadingBack}>
          &larr; Back
        </Button>
        <Button type="submit" className="px-8" disabled={uploadingFront || uploadingBack}>
          Next: Review & Submit &rarr;
        </Button>
      </div>
    </form>
  );
}

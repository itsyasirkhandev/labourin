"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, MessageSquare, AlertCircle } from "lucide-react";

export function isValidPakistaniPhone(phone: string): boolean {
  const regex = /^(?:\+923\d{9}|03\d{9})$/;
  return regex.test(phone.trim());
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError && error.data && typeof error.data === "object") {
    const data = error.data as { message?: unknown; data?: { message?: unknown } };
    if (typeof data.message === "string") return data.message;
    if (typeof data.data?.message === "string") return data.data.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred while saving your contact details.";
}

export interface CustomerContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialPhoneNumber?: string;
  initialWhatsappNumber?: string;
}

export function CustomerContactDialog({
  open,
  onOpenChange,
  onSuccess,
  initialPhoneNumber = "",
  initialWhatsappNumber = "",
}: CustomerContactDialogProps) {
  const completeCustomerContact = useMutation(
    api.authed.contact.completeCustomerContact
  );

  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsappNumber);
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setPhoneNumber(initialPhoneNumber);
      setWhatsappNumber(initialWhatsappNumber);
      setSameAsPhone(false);
      setPhoneError(null);
      setWhatsappError(null);
      setServerError(null);
      setIsSubmitting(false);
    }
  }


  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    if (phoneError) setPhoneError(null);
    if (sameAsPhone) {
      setWhatsappNumber(val);
      if (whatsappError) setWhatsappError(null);
    }
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setWhatsappNumber(phoneNumber);
      if (whatsappError) setWhatsappError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setWhatsappError(null);
    setServerError(null);

    const trimmedPhone = phoneNumber.trim();
    const trimmedWhatsapp = sameAsPhone ? trimmedPhone : whatsappNumber.trim();

    let hasError = false;

    if (!trimmedPhone) {
      setPhoneError("Mobile phone number is required.");
      hasError = true;
    } else if (!isValidPakistaniPhone(trimmedPhone)) {
      setPhoneError(
        "Invalid phone format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX)."
      );
      hasError = true;
    }

    if (trimmedWhatsapp && !isValidPakistaniPhone(trimmedWhatsapp)) {
      setWhatsappError(
        "Invalid WhatsApp format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX)."
      );
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      await completeCustomerContact({
        phoneNumber: trimmedPhone,
        whatsappNumber: trimmedWhatsapp || undefined,
      });

      setIsSubmitting(false);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setServerError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isSubmitting} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Phone className="size-4 text-primary" />
            Contact Details Required
          </DialogTitle>
          <DialogDescription>
            Before submitting your request, please provide a valid Pakistani phone
            number so service providers can contact you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="font-medium text-foreground">
              Mobile Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="03001234567 or +923001234567"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={!!phoneError}
              className="w-full"
            />
            {phoneError ? (
              <p className="text-xs font-medium text-destructive">{phoneError}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Format: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX
              </p>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="whatsappNumber"
                className="flex items-center gap-1.5 font-medium text-foreground"
              >
                <MessageSquare className="size-3.5 text-muted-foreground" />
                WhatsApp Number <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <input
                id="sameAsPhone"
                type="checkbox"
                checked={sameAsPhone}
                onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                disabled={isSubmitting}
                className="h-3.5 w-3.5 rounded border-input accent-primary text-primary focus:ring-ring"
              />
              <label
                htmlFor="sameAsPhone"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                Same as mobile phone number
              </label>
            </div>

            {!sameAsPhone && (
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="03001234567 (optional)"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (whatsappError) setWhatsappError(null);
                }}
                disabled={isSubmitting}
                aria-invalid={!!whatsappError}
                className="w-full"
              />
            )}

            {whatsappError && (
              <p className="text-xs font-medium text-destructive">{whatsappError}</p>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

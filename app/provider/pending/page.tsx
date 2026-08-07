"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { FullScreenLoader } from "@/components/auth/FullScreenLoader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  Layers,
  MapPin,
  RefreshCw,
  PhoneCall,
} from "lucide-react";
import { FALLBACK_CATEGORIES, FALLBACK_CITIES } from "@/components/provider/wizard/types";

export default function ProviderPendingPage() {
  const router = useRouter();
  const onboardingStatus = useQuery(api.authed.onboarding.getProviderOnboardingStatus);

  const profile = onboardingStatus?.profile;

  // Resolve Category Name
  const categoryName = useQuery(
    api.public.categories.listCategories,
    { onlyActive: false }
  )?.find((c) => c._id === profile?.primaryCategoryId)?.name ||
    FALLBACK_CATEGORIES.find((c) => c._id === profile?.primaryCategoryId)?.name ||
    "Primary Trade";

  // Resolve City Name
  const cityName = useQuery(
    api.public.locations.listCities,
    { onlyActive: false }
  )?.find((c) => c._id === profile?.cityId)?.name ||
    FALLBACK_CITIES.find((c) => c._id === profile?.cityId)?.name ||
    "Operating City";

  if (onboardingStatus === undefined) {
    return <FullScreenLoader label="Checking verification status..." />;
  }

  if (onboardingStatus.status === "unonboarded") {
    router.replace("/provider/onboarding");
    return <FullScreenLoader label="Redirecting to onboarding..." />;
  }

  const isPending = onboardingStatus.status === "pending";
  const isApproved = onboardingStatus.status === "approved";
  const isRejected = onboardingStatus.status === "rejected";

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs text-center space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          {isPending && <Clock className="size-8 animate-pulse" />}
          {isApproved && <CheckCircle2 className="size-8 text-emerald-600" />}
          {isRejected && <AlertCircle className="size-8 text-destructive" />}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              {isPending && "Verification in Progress"}
              {isApproved && "Account Approved!"}
              {isRejected && "Application Needs Revision"}
            </h1>
            <Badge
              variant={isPending ? "secondary" : isApproved ? "default" : "destructive"}
              className="capitalize"
            >
              {onboardingStatus.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isPending &&
              "Your provider profile and CNIC documents have been submitted to LabourIn support. Manual verification usually takes 24 to 48 hours."}
            {isApproved &&
              "Congratulations! Your CNIC documents and trade profile have been verified. You can now toggle your availability and start receiving job requests."}
            {isRejected &&
              `Your application was not approved. Reason: ${profile?.rejectionReason || "Identity document or profile details require updates."}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {isApproved && (
            <Button onClick={() => router.push("/provider")} className="px-6 font-semibold">
              Go to Provider Dashboard &rarr;
            </Button>
          )}
          {isRejected && (
            <Button
              onClick={() => router.push("/provider/onboarding")}
              variant="destructive"
              className="px-6 font-semibold"
            >
              <RefreshCw className="mr-2 size-4" /> Edit & Resubmit Application
            </Button>
          )}
          {isPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              <RefreshCw className="mr-1.5 size-3.5" /> Check Status
            </Button>
          )}
        </div>
      </div>

      {/* Review Timeline Card */}
      {isPending && (
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Verification Review Timeline
          </h3>

          <div className="relative pl-6 space-y-4 text-xs border-l-2 border-primary/30">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <p className="font-semibold text-foreground">Step 1: Application Submitted</p>
              <p className="text-muted-foreground">CNIC document images and trade profile details received.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 animate-ping" />
              <div className="absolute -left-[31px] top-0 size-3 rounded-full bg-amber-500" />
              <p className="font-semibold text-foreground">Step 2: Document & Identity Check (Current)</p>
              <p className="text-muted-foreground">LabourIn operations team is validating CNIC and trade background.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-3 rounded-full bg-muted-foreground/30" />
              <p className="font-semibold text-muted-foreground">Step 3: Approval & Activation</p>
              <p className="text-muted-foreground">Profile becomes active and available for customer bookings.</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Submission Details Summary */}
      {profile && (
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="size-4 text-primary" />
            Submitted Application Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <User className="size-3.5 text-primary" /> Display Name
              </span>
              <p className="font-semibold text-foreground text-sm">{profile.displayName}</p>
              <p className="text-muted-foreground">{profile.experienceYears} Years Experience</p>
            </div>

            <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Layers className="size-3.5 text-primary" /> Primary Trade
              </span>
              <p className="font-semibold text-foreground text-sm">{categoryName}</p>
              <p className="text-muted-foreground">{profile.skillIds.length} Skills Listed</p>
            </div>

            <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <MapPin className="size-3.5 text-primary" /> Location & Coverage
              </span>
              <p className="font-semibold text-foreground text-sm">{cityName}</p>
              <p className="text-muted-foreground">{profile.areaIds.length} Areas Covered</p>
            </div>

            <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <PhoneCall className="size-3.5 text-primary" /> Verified Contact
              </span>
              <p className="font-semibold text-foreground text-sm">{profile.phoneNumber}</p>
              <p className="text-muted-foreground">
                WhatsApp: {profile.whatsappNumber || profile.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

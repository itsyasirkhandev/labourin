"use client";

import { useAuth } from "@clerk/nextjs";
import { User, Wrench, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { FullScreenLoader } from "@/components/auth/FullScreenLoader";
import { SignInRequired } from "@/components/auth/SignInRequired";
import { Button } from "@/components/ui/button";

type RoleOption = "customer" | "provider";

const roleOptions: Array<{
  role: RoleOption;
  icon: typeof User;
  title: string;
  description: string;
}> = [
  {
    role: "customer",
    icon: User,
    title: "I Need a Service",
    description: "Hire a provider for jobs around your home or business.",
  },
  {
    role: "provider",
    icon: Wrench,
    title: "I Provide a Service",
    description: "Offer your services and get matched with customers.",
  },
];

const roleDestinations: Record<RoleOption, string> = {
  customer: "/customer",
  provider: "/provider",
};

function getErrorMessage(error: unknown): string | null {
  if (error instanceof ConvexError && error.data && typeof error.data === "object") {
    const data = error.data as { message?: unknown; data?: { message?: unknown } };
    if (typeof data.message === "string") return data.message;
    if (typeof data.data?.message === "string") return data.data.message;
  }
  return null;
}

export function RoleSelectionWizard() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenLoader label="Loading..." />;
  }

  if (!isSignedIn) {
    // Defensive only — the Proxy redirects signed-out users to sign-in.
    return <SignInRequired />;
  }

  return <AuthedWizard />;
}

function AuthedWizard() {
  const router = useRouter();
  const viewer = useQuery(api.authed.account.currentUser);
  const selectRole = useMutation(api.authed.account.selectRole);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // A user who already has a role must never see the wizard.
  useEffect(() => {
    if (viewer?.role === "customer" || viewer?.role === "provider") {
      router.replace(roleDestinations[viewer.role]);
    }
  }, [viewer, router]);

  if (viewer === undefined || viewer === null) {
    return <FullScreenLoader label="Preparing your account..." />;
  }
  if (viewer.role === "customer" || viewer.role === "provider") {
    return <FullScreenLoader label="Redirecting..." />;
  }

  async function handleChoose(role: RoleOption) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await selectRole({ role });
      router.push(roleDestinations[role]);
    } catch (error) {
      setErrorMessage(getErrorMessage(error) ?? "Something went wrong setting your role. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          <span className={step === 1 ? "text-primary" : undefined}>1 · Welcome</span>
          <span aria-hidden="true">—</span>
          <span className={step === 2 ? "text-primary" : undefined}>2 · Choose</span>
        </div>

        {step === 1 && (
          <section className="text-center" aria-labelledby="welcome-title">
            <h1
              id="welcome-title"
              className="font-sans text-3xl font-bold text-foreground sm:text-4xl"
            >
              Welcome to LabourIn
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              LabourIn connects customers with verified, available service
              providers. This short setup decides how you&apos;ll use LabourIn —
              you can&apos;t change it later.
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-8"
              onClick={() => setStep(2)}
            >
              Get started <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="choose-title">
            <h2 id="choose-title" className="text-center font-sans text-2xl font-bold sm:text-3xl">
              What do you need from LabourIn?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
              Pick a role to continue. This decides the part of LabourIn
              you&apos;ll use and cannot be changed later.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => handleChoose(option.role)}
                    disabled={isSubmitting}
                    className="group flex-1 cursor-pointer rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon
                      size={28}
                      weight="duotone"
                      aria-hidden="true"
                      className="mb-3 text-primary"
                    />
                    <h3 className="font-sans text-lg font-semibold text-foreground">
                      {option.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                Back
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

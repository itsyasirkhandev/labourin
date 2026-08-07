"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Tree,
  Database,
  Key,
} from "@phosphor-icons/react";
import { SignInButton, Show } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ThemeToggle from "@/components/ThemeToggle";

const features = [
  {
    icon: Key,
    title: "Clerk Auth",
    description: "Clerk authentication with Convex token sync for seamless auth.",
  },
  {
    icon: ShieldCheck,
    title: "Authed/Private Guards",
    description: "Convention-based Convex function security out of the box.",
  },
  {
    icon: Tree,
    title: "Effect-TS",
    description: "Structured logging and typed errors on the backend.",
  },
  {
    icon: Database,
    title: "Zustand Store",
    description: "Persisted client state with Immer middleware.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground px-4 py-6">
      {/* Top bar with theme toggle */}
      <div className="flex w-full justify-end">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="mt-12 flex flex-col items-center gap-6 text-center sm:mt-20">
        <div className="flex items-center gap-4">
          <Image
            src="/convex.svg"
            alt="Convex logo"
            width={48}
            height={48}
            priority
          />
          <span aria-hidden="true" className="text-3xl font-light text-muted-foreground">
            ×
          </span>
          <Image
            src="/nextjs-icon-light-background.svg"
            alt="Next.js logo"
            width={48}
            height={48}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/nextjs-icon-dark-background.svg"
            alt="Next.js logo"
            width={48}
            height={48}
            className="hidden dark:block"
            priority
          />
        </div>

        <h1 className="font-sans text-5xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
          LabourIn
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          LabourIn connects customers with verified, available service providers.
        </p>

        {/* CTA Buttons */}
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
          <Show when="signed-in">
            <SignedInCta />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Get Started <span aria-hidden="true">→</span>
              </button>
            </SignInButton>
          </Show>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <feature.icon
              size={28}
              weight="duotone"
              aria-hidden="true"
              className="mb-3 text-primary"
            />
            <h3 className="font-sans text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Footer tagline */}
      <p className="mt-16 pb-8 text-center font-mono text-xs text-muted-foreground">
        npx create-next-app <span aria-hidden="true">→</span> npx convex dev <span aria-hidden="true">→</span> build something real
      </p>
    </div>
  );
}

// Mounted only inside <Show when="signed-in">, so the authed currentUser query
// never fires while signed out (the guard rejects unauthenticated requests).
function SignedInCta() {
  const viewer = useQuery(api.authed.account.currentUser);

  const viewerRole =
    viewer?.role === "customer" || viewer?.role === "provider" ? viewer.role : null;

  if (viewer === undefined || viewer === null) {
    // Waiting for the Convex viewer to synchronize — keep the CTA hidden so we
    // never show a misleading destination.
    return null;
  }

  const destination =
    viewerRole === "customer"
      ? "/customer"
      : viewerRole === "provider"
        ? "/provider"
        : "/select-role";

  return (
    <Link
      href={destination}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      Open your space <span aria-hidden="true">→</span>
    </Link>
  );
}

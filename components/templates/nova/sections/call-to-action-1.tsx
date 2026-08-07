"use client";

import { Button } from "@/components/ui/button";
import { DashboardCta } from "./dashboard-cta";
import { ChevronRight } from "lucide-react";
import { SignUpButton, Show } from "@clerk/nextjs";

export default function CallToAction() {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="text-balance font-serif text-4xl font-medium">
            Your Leaking Pipe Won&apos;t Fix Itself
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-balance text-base">
            Find a CNIC-verified plumber, electrician, or AC technician in your neighborhood — ready to show up in hours, not days.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal" forceRedirectUrl="/select-role" fallbackRedirectUrl="/select-role">
                <Button size="lg" className="pr-2">
                  <span>Find Local Workers</span>
                  <ChevronRight className="opacity-60" />
                </Button>
              </SignUpButton>
              <SignUpButton mode="modal" forceRedirectUrl="/select-role" fallbackRedirectUrl="/select-role">
                <Button size="lg" variant="outline">
                  <span>Register as Provider</span>
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <DashboardCta className="pr-2" />
            </Show>
          </div>
        </div>
      </div>
    </section>
  );
}

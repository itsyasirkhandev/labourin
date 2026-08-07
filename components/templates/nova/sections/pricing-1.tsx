"use client";

import { Button } from "@/components/ui/button";
import { DashboardCta } from "./dashboard-cta";
import { SignUpButton, Show } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "For Customers",
    description: "Find verified local workers whenever you need home repairs — plumbing, electrical, AC, carpentry.",
    price: "Rs. 0",
    period: " / forever free",
    features: [
      "Browse CNIC-verified workers near you",
      "See real-time availability status",
      "Get direct phone & WhatsApp contact",
      "Pay cash directly — no platform fees",
    ],
    cta: "Find a Worker Near You",
    highlighted: false,
  },
  {
    name: "For Skilled Providers",
    description: "Get direct job leads from customers in your area. No per-lead fees. No commission cuts.",
    price: "Rs. 0",
    period: " / forever free",
    features: [
      "Free CNIC identity verification",
      "Toggle your availability in real-time",
      "Receive requests with job details & budget",
      "Keep 100% of what you earn",
    ],
    cta: "Start Getting Leads",
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-background @container py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="">
          <h2 className="text-balance font-serif text-4xl font-medium">
            Free for Everyone. Zero Commissions.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-balance">
            Most platforms take 15-30% from every job. LabourIn takes nothing. Workers keep every rupee they earn.
          </p>
        </div>
        <div className="grid-cols-1 sm:grid-cols-2 mt-12 grid gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col p-6 ",
                plan.highlighted && "ring-primary ring-2",
              )}
            >
              <div>
                <h3 className="text-foreground font-medium text-lg">{plan.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {plan.description}
                </p>
              </div>
              <div className="mt-6">
                <span className="font-serif text-4xl font-medium">
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-muted-foreground flex items-start gap-2 text-sm"
                  >
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Show when="signed-out">
                <SignUpButton mode="modal" forceRedirectUrl="/select-role" fallbackRedirectUrl="/select-role">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="mt-8 w-full"
                  >
                    {plan.cta}
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <DashboardCta
                  label={plan.cta}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-8 w-full"
                  showChevron={false}
                />
              </Show>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

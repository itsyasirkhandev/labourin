import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "For Customers",
    description: "Find and contact verified local workers whenever emergency repairs strike.",
    price: "Rs. 0",
    period: " / forever free",
    features: [
      "Search CNIC-verified local experts",
      "Direct phone & WhatsApp numbers",
      "Zero platform booking fees",
      "Pay cash directly after job completion",
    ],
    cta: "Find a Worker",
    highlighted: false,
  },
  {
    name: "For Skilled Providers",
    description: "Get direct local job leads without paying per-lead fees or commissions.",
    price: "Rs. 0",
    period: " / forever free",
    features: [
      "Free CNIC identity verification",
      "Real-time 'Available Now' toggle",
      "Direct customer WhatsApp leads",
      "Keep 100% of your hard-earned pay",
    ],
    cta: "Register as Provider",
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-background @container py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="">
          <h2 className="text-balance font-serif text-4xl font-medium">
            100% Free & Transparent
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-balance">
            No commissions, no hidden middleman cuts, and no online payment hurdles. Direct platform access for everyone.
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
              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-8 w-full"
                asChild
              >
                <Link href="/select-role">{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

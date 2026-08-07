import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroHeader } from "./header";
import { ChevronRight, Zap, Wrench, Wind, Hammer, Paintbrush, ShieldCheck, PhoneCall, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <section className="bg-background">
          <div className="relative py-32 md:pt-44">
            <div className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% lg:aspect-9/4 absolute inset-0 aspect-square lg:top-24 dark:opacity-30 dark:invert">
              <Image
                src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="hero background"
                width={2268}
                height={1740}
                priority
                className="size-full object-cover object-top"
              />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="size-3.5" />
                  <span>Available in Lahore, Karachi & Islamabad</span>
                </div>
                <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl">
                  Verified Local Experts, Delivered to Your Doorstep in 2 Hours.
                </h1>
                <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg">
                  Connect with CNIC-verified electricians, plumbers, and technicians ready right now in your area — zero commission fees, direct WhatsApp contact.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="pr-2">
                    <Link href="/select-role">
                      <span className="text-nowrap">Find Local Workers</span>
                      <ChevronRight className="opacity-60" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/select-role">
                      <span>Register as a Provider</span>
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mx-auto mt-20 max-w-2xl">
                <p className="mb-6 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  POPULAR SERVICES & TRUST GUARANTEES
                </p>
                <div className="grid scale-95 grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <Zap className="size-4 text-amber-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      Electricians
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <Wrench className="size-4 text-blue-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      Plumbers
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <Wind className="size-4 text-cyan-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      AC Technicians
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <Hammer className="size-4 text-orange-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      Carpenters
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <Paintbrush className="size-4 text-purple-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      Painters
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      CNIC Verified
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <PhoneCall className="size-4 text-green-500 shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      Direct WhatsApp
                    </span>
                  </Card>
                  <Card className="shadow-foreground/5 flex h-10 w-full flex-row items-center justify-center gap-2 rounded-xl px-3">
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                    <span className="text-nowrap font-medium text-xs sm:text-sm">
                      Available Now
                    </span>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

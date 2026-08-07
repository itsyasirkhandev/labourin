import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-background @container py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <h2 className="text-balance font-serif text-4xl font-medium">
            Need Emergency Repairs or Want Direct Job Leads?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-balance text-base">
            Connect with CNIC-verified local experts or start earning as a skilled service provider in Lahore, Karachi, and Islamabad today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="pr-2">
              <Link href="/select-role">
                <span>Find Local Workers</span>
                <ChevronRight className="opacity-60" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/select-role">
                <span>Register as Provider</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

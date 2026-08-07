"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

/**
 * Smart dashboard CTA for signed-in users.
 * Queries the viewer's role and routes to the correct dashboard:
 *  - customer → /customer
 *  - provider → /provider
 *  - no role yet → /select-role
 *
 * Renders nothing while the role is loading to avoid flashing a wrong link.
 */
export function DashboardCta({
  label = "Go to Dashboard",
  variant = "default",
  size = "lg",
  showChevron = true,
  className,
}: {
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showChevron?: boolean;
  className?: string;
}) {
  const viewer = useQuery(api.authed.account.currentUser);

  // Still loading or user record missing — hide to avoid flashing a wrong destination
  if (viewer === undefined || viewer === null) {
    return null;
  }

  const destination =
    viewer.role === "customer"
      ? "/customer"
      : viewer.role === "provider"
        ? "/provider"
        : "/select-role";

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <Link href={destination}>
        <span className="text-nowrap">{label}</span>
        {showChevron && <ChevronRight className="opacity-60" />}
      </Link>
    </Button>
  );
}

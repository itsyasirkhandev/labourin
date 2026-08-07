"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface AppHeaderProps {
  role?: "customer" | "provider";
}

export function AppHeader({ role }: AppHeaderProps) {
  const homePath = role ? `/${role}` : "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={homePath}
            className="font-sans text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            LabourIn
          </Link>
          {role && (
            <Badge
              variant="secondary"
              className="capitalize text-xs font-medium px-2.5 py-0.5"
            >
              {role}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
          <LogoutButton variant="outline" size="sm" />
        </div>
      </div>
    </header>
  );
}

"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { AppHeader } from "@/components/navigation/AppHeader";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate role="provider">
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppHeader role="provider" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </RoleGate>
  );
}


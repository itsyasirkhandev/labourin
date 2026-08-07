"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { AppHeader } from "@/components/navigation/AppHeader";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate role="customer">
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppHeader role="customer" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </RoleGate>
  );
}


"use client";

import { RoleGate } from "@/components/auth/RoleGate";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate role="customer">
      <div className="flex min-h-screen bg-background text-foreground">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </RoleGate>
  );
}

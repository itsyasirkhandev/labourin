"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  className,
  showText = true,
}: LogoutButtonProps) {
  return (
    <SignOutButton redirectUrl="/">
      <Button variant={variant} size={size} className={className}>
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        {showText && <span>Log out</span>}
      </Button>
    </SignOutButton>
  );
}

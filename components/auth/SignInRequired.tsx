"use client";

import { SignInButton } from "@clerk/nextjs";
import { LockKey } from "@phosphor-icons/react";

export function SignInRequired() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-8 max-w-sm text-center px-6">
        <div>
          <h2 className="text-xl font-bold text-foreground font-sans mb-2">
            Sign in required
          </h2>
          <p className="text-sm text-muted-foreground">
            Please sign in to access this page.
          </p>
        </div>
        <SignInButton mode="modal">
          <button
            type="button"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-6 py-3 rounded-full cursor-pointer transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <LockKey size={18} weight="bold" aria-hidden="true" />
            <span>Sign in</span>
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

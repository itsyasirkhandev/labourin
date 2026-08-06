"use client";

import { SignInButton, Show, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { LockKey } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  return (
    <>
      <ClerkLoading>
        <div className="flex items-center justify-center min-h-screen bg-background" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ClerkLoading>
      
      <ClerkLoaded>
        <Show when="signed-in">
          {children}
        </Show>
        
        <Show when="signed-out">
          <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <div className="flex flex-col items-center gap-8 max-w-sm text-center px-6">
              <div className="flex items-center gap-3">
                <Image src="/convex.svg" alt="Convex Logo" width={40} height={40} />
                <div className="w-px h-10 bg-border"></div>
                <Image
                  src="/nextjs-icon-light-background.svg"
                  alt="Next.js Logo"
                  width={40}
                  height={40}
                  className="dark:hidden"
                />
                <Image
                  src="/nextjs-icon-dark-background.svg"
                  alt="Next.js Logo"
                  width={40}
                  height={40}
                  className="hidden dark:block"
                />
              </div>
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
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-6 py-3 rounded-full cursor-pointer transition-colors transition-transform transition-shadow duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <LockKey size={18} weight="bold" aria-hidden="true" />
                  <span>Sign in</span>
                </button>
              </SignInButton>
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </Show>
      </ClerkLoaded>
    </>
  );
}

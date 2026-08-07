"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { FullScreenLoader } from "@/components/auth/FullScreenLoader";
import { SignInRequired } from "@/components/auth/SignInRequired";

const roleDestinations = {
  customer: "/customer",
  provider: "/provider",
} as const;

interface RoleGateProps {
  role: "customer" | "provider";
  children: React.ReactNode;
}

// Client-side authorization layer: resolves the Convex viewer and routes the
// user to the correct part of the app. Convex remains the authorization
// authority; these redirects are the UX layer.
//
// The viewer query is only subscribed while signed in: the authed guard
// rejects unauthenticated requests, so running it signed out would surface a
// ConvexError to the nearest error boundary.
export function RoleGate({ role, children }: RoleGateProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullScreenLoader label="Loading..." />;
  }

  if (!isSignedIn) {
    // Defensive only — the Proxy redirects signed-out users to sign-in.
    return <SignInRequired />;
  }

  return <AuthedRoleGate role={role}>{children}</AuthedRoleGate>;
}

function AuthedRoleGate({ role, children }: RoleGateProps) {
  const viewer = useQuery(api.authed.account.currentUser);

  if (viewer === undefined || viewer === null) {
    // Convex viewer not synchronized yet (webhook lag) — hold a brief state
    // instead of redirecting, so we never bounce into a redirect loop.
    return <FullScreenLoader label="Preparing your account..." />;
  }

  const viewerRole =
    viewer.role === "customer" || viewer.role === "provider" ? viewer.role : null;

  if (viewerRole !== role) {
    redirect(viewerRole ? roleDestinations[viewerRole] : "/select-role");
  }

  return <>{children}</>;
}


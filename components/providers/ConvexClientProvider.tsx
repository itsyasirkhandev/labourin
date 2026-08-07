"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

import { clientConfig } from "@/lib/services/Config";

function UserSyncTrigger() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const syncUser = useMutation(api.authed.users.getOrCreateUser);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      void syncUser().catch((err) => {
        console.error("Failed to sync user to Convex:", err);
      });
    }
  }, [isAuthenticated, isLoading, syncUser]);

  return null;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [convex] = useState(() => new ConvexReactClient(clientConfig.convexUrl));

  return (
    <ClerkProvider
      signUpForceRedirectUrl="/select-role"
      signUpFallbackRedirectUrl="/select-role"
      signInFallbackRedirectUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserSyncTrigger />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}


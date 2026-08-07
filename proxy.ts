import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Optimistic authorization layer only — Convex remains the authorization
// authority. Signed-out users are bounced to Clerk sign-in before they can
// reach any authenticated route; the role gate then resolves where they go.
const isProtectedRoute = createRouteMatcher([
  "/select-role(.*)",
  "/customer(.*)",
  "/provider(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

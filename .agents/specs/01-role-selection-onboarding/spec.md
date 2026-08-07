# Role Selection Onboarding Specification

## 1. Problem Statement

New users authenticate through Clerk (Google or Facebook) but have no way to
declare what they intend to do on LabourIn. The application currently has no
role model surfaced to the client, no `selectRole` mutation, and no routing
logic that sends a first-time user into the correct part of the app.

This makes it impossible for users to:

- Choose whether they are a customer or a provider
- Reach their role-specific destination after signing in
- Be blocked from entering role-scoped areas they do not belong to
- Have their choice remembered and enforced on every subsequent visit

Solution: This feature introduces a complete role selection onboarding flow
built on three authorization layers (Next.js Proxy, a client-side role gate,
and Convex server enforcement), a multi-step `/select-role` wizard, and role
destination routing. It also removes the starter-only `/dashboard` and
`/server-demo` pages that the role gate replaces.

The scope of this spec is **role selection only**. Provider onboarding
(skills, coverage, CNIC upload), the pending-verification gate, customer
contact collection, admin allowlist access, and catalog data are intentionally
out of scope and are covered by later specs.

## 2. Functional Requirements

The system should:

- Persist the user's public role (`customer` or `provider`) in the Convex
  `users` table exactly once through a `selectRole` mutation.
- Reject any attempt to select the `admin` role from the client.
- Reject any attempt to change an already selected role.
- Expose the current user's Convex record (including role) through a
  `currentUser` query.
- Run a Next.js Proxy (Clerk middleware) that blocks signed-out users from
  every authenticated route and redirects them to sign-in.
- Run a client-side `RoleGate` (replacing `AuthGuard`) that resolves the
  Convex viewer and routes the user:
  - No synchronized Convex user yet -> show a brief synchronization state
  - No role -> `/select-role`
  - Customer -> `/customer`
  - Provider -> `/provider`
- Show the multi-step wizard at `/select-role`:
  - Step 1 Welcome: what LabourIn does and what this flow decides
  - Step 2 Choose: two large role cards ("I Need a Service" and "I Provide a
    Service") with plain-language descriptions
  - Step 3 Confirm: a summary of the chosen role and a "Set my role" action
- Prevent duplicate submission on the confirm step (loading state disables the
  action).
- On successful confirmation, route the user to the destination resolved from
  the chosen role (`/customer` or `/provider`).
- Provide minimal placeholder pages at `/customer` and `/provider` so the role
  gate has real destinations to redirect to.
- Provide loading, empty, and error states on every screen in this flow.
- Remove the `/dashboard` and `/server-demo` pages and all references to them
  (sidebar navigation, landing page CTAs, route links).
- Update the public landing page so signed-out users sign in through Clerk and
  signed-in users are routed through the role gate.

## 3. Inputs and Outputs

### USER ACTION (INPUT): First sign-in through Clerk

**EXPECTED SYSTEM BEHAVIOR**

- Proxy allows the authenticated request through to the role gate.
- `RoleGate` resolves the Convex viewer via `currentUser`.
- If the viewer has no role, the user is redirected to `/select-role`.
- If the viewer already has a role, the user is redirected to their role
  destination without seeing `/select-role`.

### USER ACTION (INPUT): Completing the `/select-role` wizard confirm step

**EXPECTED SYSTEM BEHAVIOR**

- The `selectRole` mutation validates the requested role is `customer` or
  `provider`.
- The mutation rejects the request if the viewer already has a role.
- The mutation rejects the request if the account is soft-deleted.
- The role is written to the `users` document.
- On success the user is redirected to `/customer` or `/provider` according to
  the chosen role.
- A duplicate tap or slow-network resubmission cannot create a second mutation
  or change the role twice.

### USER ACTION (INPUT): A signed-in user with a role visits `/select-role`

**EXPECTED SYSTEM BEHAVIOR**

- `RoleGate` resolves the existing role and redirects the user away from
  `/select-role` to their role destination instead of showing the wizard.

### USER ACTION (INPUT): A signed-out user visits any authenticated route

**EXPECTED SYSTEM BEHAVIOR**

- Proxy detects the signed-out request and redirects to Clerk sign-in.
- After sign-in, the user continues into the role gate flow.

## 4. Constraints

- Use `pnpm` for all package operations.
- Use Effect v4 for all backend code, with the `effectAuthedQuery` /
  `effectAuthedMutation` wrappers from `convex/authed/helpers.ts`.
- Client-facing Convex functions live under `convex/authed/`.
- Backend errors follow the existing tagged `ConvexError` model
  (`convex/effectHelpers.ts` + `convex/authed/errors.ts`) and must remain
  Convex-serializable with only primitive top-level fields.
- Avoid `as any`; infer types from functions wherever possible.
- Use Tailwind CSS and the existing shadcn/Radix primitives for styling.
- Next.js Proxy is used only for optimistic checks (signed-in/signed-out), not
  as the full authorization solution; Convex remains the authorization
  authority.
- The role selection flow must work at narrow mobile widths (320px and up)
  without horizontal scrolling.
- Do not rely on client state for authorization decisions; redirects are a UX
  layer, Convex enforces the truth.
- Every page has one obvious primary action and clear loading/error/success
  states.

## 5. Edge Cases and Error Handling

- **Clerk still loading**
  - Show the existing full-screen loading state; do not redirect during this
    window.
- **Signed in but no synchronized Convex user yet (webhook lag)**
  - Show a brief "Preparing your account..." state that resolves once
    `currentUser` returns a viewer; do not bounce the user into a redirect
    loop.
- **No role on the viewer**
  - Redirect to `/select-role` and show the wizard.
- **User already has a role and visits `/select-role`**
  - Redirect to the role destination; the wizard must not appear.
- **`selectRole` called with `admin`**
  - Return `RoleAlreadySelected`-style safe error / reject. Public role
    selection accepts only `customer` or `provider`. A modified client input
    cannot assign `admin`.
- **`selectRole` called twice (immutability)**
  - Reject with a clear error and keep the original role.
- **Soft-deleted account attempts to select a role**
  - Reject the mutation; deleted accounts cannot use application workflows.
- **Mutation failure (network, Convex error)**
  - Show an inline error with a retry action; do not advance the wizard or
    redirect.
- **Double-tap on confirm**
  - Disable the confirm action while the mutation is pending.
- **Back or refresh during the wizard**
  - Ephemeral state is acceptable: a refresh returns to step 1; back returns
    to the previous wizard step. The role is not committed until the confirm
    mutation succeeds.
- **Provider or customer visits the other role's placeholder**
  - The placeholder pages are minimal and read-only; role-scoped Convex
    authorization is not part of this spec, but the pages must not imply
    access to the other role's future features.
- **Direct URL entry to `/customer` or `/provider` without a role**
  - `RoleGate` redirects to `/select-role`.
- **Signed-out user deep-links to `/customer` or `/provider`**
  - Proxy redirects to Clerk sign-in; after sign-in the role gate applies.

## 6. Acceptance Criteria

This feature is considered complete if:

- A first-time authenticated user reaches `/select-role` and cannot enter
  role-scoped pages before choosing a role.
- The wizard's Welcome, Choose, and Confirm steps render correctly at mobile
  width.
- Selecting a role card and confirming writes `customer` or `provider` to the
  Convex user and redirects to the matching placeholder page.
- A returning user never sees `/select-role` again.
- A user cannot select `admin` through modified client input.
- Back, refresh, and double-tap do not permit role reselection or duplicate
  mutations.
- Soft-deleted accounts are rejected by the role mutation.
- Signed-out users are redirected to sign-in by Proxy on every authenticated
  route.
- `/dashboard` and `/server-demo` are removed and no dangling links remain in
  navigation, layouts, or the landing page.
- `pnpm run convex:gen`, `pnpm run lint`, `pnpm run typecheck`, and
  `pnpm run test:run` all pass.
- Convex integration tests cover role selection, role immutability, admin
  rejection, soft-deleted rejection, and the current user query.
- A frontend test covers the wizard happy path (select -> confirm -> redirect)
  and its error state.

## 7. Implementation Reference

### Backend

- `convex/authed/account.ts` (new): `currentUser` (already exists as a stub in
  `convex/authed/users.ts` and should be moved/kept under the account
  convention) and `selectRole`.
- `selectRole` mutation:
  - Arguments: `{ role: v.union(v.literal("customer"), v.literal("provider")) }`
  - Requires an authenticated viewer.
  - Rejects if `viewer` is missing or `accountStatus === "deleted"`.
  - Rejects if `viewer.role` is already set.
  - Patches `role` and `updatedAt` on the `users` document.
  - Returns the updated viewer.
- Tagged errors (extend `convex/authed/errors.ts` following the existing
  `Schema.TaggedErrorClass` pattern):
  - `RoleRequiredError`
  - `RoleAlreadySelectedError`
  - `DeletedAccountError`
  - Reuse `UnauthorizedError` / `UserNotFoundError` where applicable.
- No schema change is required for this feature: the `users.role` field already
  exists and is optional.

### Proxy (authorization layer 1)

- Update `proxy.ts` to wrap `clerkMiddleware` with route protection:
  - Signed-out users are redirected to sign-in for authenticated route
    prefixes (`/select-role`, `/customer`, `/provider`).
  - Public routes (`/`) remain reachable while signed out.
  - Keep the existing matcher configuration, extending it for the new route
    prefixes if needed.

### Client role gate (authorization layer 2)

- Replace `components/auth/AuthGuard.tsx` with `RoleGate` (same location or
  `components/auth/RoleGate.tsx`):
  - Uses `useConvex`/generated API to subscribe to `currentUser`.
  - Distinguishes Clerk loading, Convex loading, missing synchronized user,
    and missing role to avoid redirect loops.
  - Redirects to `/select-role` when no role, `/customer` when customer,
    `/provider` when provider.
  - Renders children only for the resolved role it is configured to guard.

### Routing and pages

- `app/(customer)/layout.tsx` (new): applies `RoleGate` restricted to the
  customer role.
- `app/(customer)/page.tsx` (new): minimal customer placeholder ("Find a
  service — coming soon").
- `app/(provider)/layout.tsx` (new): applies `RoleGate` restricted to the
  provider role.
- `app/(provider)/page.tsx` (new): minimal provider placeholder.
- `app/(onboarding)/select-role/page.tsx` (new): full-screen wizard, no
  sidebar/header chrome.
- `components/select-role/RoleSelectionWizard.tsx` (new): client component
  holding the 3-step wizard state and the `selectRole` mutation call.
- Delete `app/(authed)/dashboard/` and `app/(authed)/server-demo/`.
- Remove dashboard/server-demo items from `app/(authed)/layout.tsx`
  navigation, or delete the starter layout and move remaining chrome into the
  new role groups as appropriate.

### Landing page

- Update `app/(public)/page.tsx`:
  - Signed-out "Get Started" opens Clerk sign-in.
  - Signed-in users route through the role gate (link to the gate-resolved
    destination instead of `/dashboard`).

### Tests

- `convex/authed/account.test.ts` (or matching `convex-test` suite):
  - Customer role selection succeeds.
  - Provider role selection succeeds.
  - Admin role selection is rejected.
  - Second role selection is rejected (immutability).
  - Soft-deleted account selection is rejected.
  - `currentUser` returns the viewer with the selected role.
- `components/select-role/RoleSelectionWizard.test.tsx`:
  - Wizard renders Welcome, then Choose, then Confirm.
  - Selecting a role and confirming calls `selectRole` and navigates to the
    correct destination.
  - Error state shows a retry action.

## 8. Relevant MCPs, Skills, and Tools

### Skills

- `effect-ts`: Used to build the `selectRole` mutation and tagged errors with
  correct Effect v4 syntax, matching the project's `effectAuthedMutation`
  conventions.
- `react-doctor`: Run after the frontend changes to triage React diagnostics
  (lint, accessibility, bundle size) before the branch is finished.
- `typescript-expert`: Applied when typing the Convex arguments, Effect
  effects, and the client wizard state without `as any`.
- `domain-modeling`: Referenced to keep the role terms (customer, provider,
  viewer, role gate) consistent with `docs/CONTEXT.md` and `docs/backend-convex-plan.md`.

### Project Conventions and Docs

- `AGENTS.md` — global and project rules (pnpm, Effect v4, authed/private
  conventions, lint/typecheck gates).
- `docs/backend-convex-plan.md` — roles and identity rules, Effect error
  model, `selectRole`/`currentUser` function contracts.
- `docs/complete-build-plan.md` — Phase 2 (role selection) acceptance criteria,
  role bootstrap gate behavior, and the role routing table.
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` and
  `01-app/02-guides/authentication.md` — Next.js 16 Proxy conventions and the
  multi-layer optimistic/secure authorization guidance.

### Testing Tools

- `convex-test` + Vitest: backend integration tests for roles and
  authorization.
- `@testing-library/react` + Vitest (`jsdom`): frontend wizard tests.

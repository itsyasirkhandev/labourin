# FixNow PK MVP Complete Build Plan

## Purpose

This document defines the complete implementation order for the FixNow PK MVP, from the existing starter repository to a production-ready launch. It covers foundations, Convex backend work, authentication, shared UI, every MVP page, role workflows, tests, security, accessibility, deployment, and launch verification.

Use these documents together:

- `PRD/build plan mvp .md` defines the product and user experience.
- `docs/backend-convex-plan.md` defines the detailed Convex architecture.
- This document defines the dependency-ordered implementation sequence.

## MVP Outcome

The finished MVP supports this complete workflow:

1. A user authenticates with Google or Facebook through Clerk.
2. A first-time user chooses customer or provider.
3. A provider completes onboarding and uploads CNIC documents.
4. An allowlisted administrator approves or rejects the provider.
5. An approved provider turns on Available Now.
6. A customer selects a category, city, and area.
7. The customer sees only approved and currently available matching providers.
8. The customer opens a provider profile and submits a service request.
9. The provider accepts or rejects the request in real time.
10. Accepted requests unlock Call and WhatsApp actions for both participants.
11. The customer can cancel a pending request.
12. Either participant can mark an accepted request completed.

The MVP excludes payments, ratings, reviews, in-app chat, maps, automatic dispatch, push notifications, and complex scheduling.

## Current Repository Baseline

### Already Available

- Next.js App Router project
- React and Tailwind CSS
- shadcn/Radix UI primitives
- Clerk provider integration
- Google and Facebook authentication configured externally
- Convex client integration with Clerk JWTs
- Clerk webhook endpoint using Svix
- Clerk user create, update, and delete handlers
- Authenticated Convex wrapper conventions
- Effect v4 backend wrapper conventions
- Sonner, React Hook Form, Zustand, Vitest, and `convex-test` dependencies
- Generic authenticated layout and starter UI components

### Still To Build or Replace

- FixNow branding and application metadata
- Dedicated sign-in experience and redirect behavior
- Role selection and role-aware routing
- Customer, provider, and admin application shells
- Production user schema and soft deletion
- Catalog schema, seed data, and APIs
- Provider onboarding and storage workflows
- Admin verification workflow
- Provider availability and discovery projection
- Customer provider search and profile pages
- Service request schema, functions, and pages
- Contact privacy and unlock behavior
- Request lifecycle tests
- Public landing, help, contact, terms, and privacy pages
- Production environment documentation and deployment checks

### Starter Features To Remove Near The End

- Demo number table and functions
- `/dashboard` number demo
- `/server-demo`
- Starter navigation and branding
- Starter-only assets that are no longer referenced

Do not delete the demo references until the production patterns replacing them are implemented and tested.

## Route Map

### Public Routes

```text
/
/sign-in/[[...sign-in]]
/sign-up/[[...sign-up]]
/help
/contact
/terms
/privacy
```

### Shared Authenticated Route

```text
/select-role
```

### Customer Routes

```text
/customer
/customer/providers
/customer/providers/[providerId]
/customer/request/new
/customer/requests
/customer/requests/[requestId]
```

### Provider Routes

```text
/provider/onboarding
/provider/pending
/provider
/provider/requests/[requestId]
```

### Admin Routes

```text
/admin/login
/admin/verification
/admin/verification/[providerId]
```

`/admin/login` uses Clerk authentication and then verifies the server-side admin allowlist. It is not a separate password system.

## Cross-Cutting Rules

Apply these rules throughout every phase:

- Mobile-first layouts are mandatory.
- Every page has loading, empty, error, and success states where applicable.
- Every workflow has one obvious primary action.
- Use large touch targets and clear language for non-technical users.
- Keep city, area, and category selections in URL search parameters where navigation or sharing benefits.
- Store server state only in Convex; do not duplicate it in Zustand.
- Use Zustand only for ephemeral or persisted UI state that is not server authority.
- Never trust role, user ID, provider ID ownership, status, or contact visibility from the client.
- Never use Convex `.filter()` for scalable product queries.
- Paginate potentially unbounded request and provider collections.
- Never return CNIC data or protected contact data from public provider APIs.
- Use authenticated wrappers for client-facing Convex functions.
- Use built-in `internal*` functions for Convex-only calls.
- Run Convex code generation, lint, and typecheck after each backend phase.

## Phase 0: Lock Product Contracts

### Goal

Resolve implementation-level product constants before changing the schema or building forms.

### Work

- Confirm the initial service category list.
- Confirm the initial areas for Lahore, Karachi, and Islamabad.
- Define category icon keys used by the frontend.
- Define English and optional Urdu display names.
- Define provider skill limit, recommended value 8.
- Define provider area limit, recommended value 15.
- Define request photo limit, recommended value 3.
- Define photo maximum size and accepted MIME types.
- Define CNIC file maximum size and accepted MIME types.
- Define request description, address, landmark, and provider-note length limits.
- Define valid budget range in whole PKR.
- Define allowed experience year range.
- Define admin allowlist environment format.
- Decide whether `today` and `scheduled` are in launch scope or whether the initial UI exposes only `asap`.

### Artifacts

- Shared domain constants and validators specification
- Initial catalog seed dataset
- Environment variable checklist

### Exit Gate

- Every enum and validation limit needed by the schema and forms has a single agreed value.
- Seed data contains unique stable slugs.
- Every area belongs to exactly one city.

## Phase 1: Harden The Project Foundation

### Goal

Turn the starter into a reliable FixNow development base before feature implementation.

### Backend Work

- Read the current Convex AI guidelines before changing Convex files.
- Read relevant Next.js 16 documentation under `node_modules/next/dist/docs/` before changing routing, proxy, metadata, or server behavior.
- Add all required variables to `.env.example` without adding secrets.
- Add `CLERK_WEBHOOK_SECRET` documentation.
- Add `ADMIN_EMAIL_ALLOWLIST` documentation.
- Verify Clerk JWT issuer configuration for Convex.
- Verify the Clerk webhook handles configured social identities without assuming email is present.
- Establish typed shared validators for roles, statuses, slugs, phone numbers, and timestamps.
- Establish Effect tagged domain error conventions.

### Frontend Work

- Replace starter metadata with FixNow title, description, and icons.
- Establish responsive page width, spacing, typography, color, focus, and touch-target conventions.
- Keep shared `Toaster` and tooltip providers.
- Create reusable full-page loading, inline loading, empty state, error state, and unauthorized state components.
- Create reusable status badge patterns for provider verification and request states.
- Create a shared mobile header and bottom navigation pattern.
- Create desktop navigation variants without compromising mobile layouts.

### Testing Work

- Split or configure Vitest environments so React tests can use `jsdom` and Convex tests can use the required edge runtime.
- Add a minimal React render test.
- Add a minimal Convex test harness using `convex-test`, schema, and `import.meta.glob`.
- Confirm `pnpm run test:run` discovers both test groups.

### Exit Gate

- `pnpm run lint` passes.
- `pnpm run typecheck` passes.
- `pnpm run test:run` passes.
- The app loads on mobile and desktop.
- No production feature depends on starter branding assumptions.

## Phase 2: Implement Identity, User Lifecycle, And Roles

### Goal

Make every authenticated user resolve to a production-ready Convex user with a safe, immutable public role selection flow.

### Convex Schema

Update `users` with:

- Optional email
- Clerk ID and token identifier
- Name and optional avatar
- Optional role
- Optional customer phone and WhatsApp values
- Optional default city and area
- Active or deleted account status
- Created, updated, and deleted timestamps
- Required indexes from `docs/backend-convex-plan.md`

### Convex Functions

Implement or update:

```text
users.upsertFromClerk
users.deleteFromClerk
authed/account.currentUser
authed/account.selectRole
authed/account.updateCustomerContact
authed/account.updateDefaults
```

### Business Rules

- Webhook data uses explicit Convex validators instead of `v.any()`.
- Missing email is valid.
- Clerk deletion soft-deletes the account.
- Public role selection accepts only customer or provider.
- Public role selection can occur only once.
- Admin cannot be self-assigned.
- Deleted accounts cannot use application workflows.
- Server-side admin allowlist checks are centralized and reusable.

### Frontend Routing

Implement a role bootstrap gate after Clerk authentication:

```text
No Convex user yet -> show synchronization state briefly
No role -> /select-role
Customer -> /customer
Provider without profile -> /provider/onboarding
Provider pending or rejected -> /provider/pending
Approved provider -> /provider
Allowlisted admin entering admin routes -> /admin/verification
Wrong role route -> redirect to role home
```

Avoid redirect loops by distinguishing Clerk loading, Convex authentication loading, missing synchronized user, and missing role.

### Page: `/select-role`

Features:

- Two large role cards: I Need a Service and I Provide a Service.
- Plain-language descriptions of each choice.
- Confirmation before permanently setting the role.
- Mutation loading state that prevents duplicate submission.
- Error recovery with a retry action.
- Successful redirect to the correct role destination.

Acceptance criteria:

- A first-time authenticated user must choose a role before entering role-specific pages.
- A returning user never sees this page unless their role is missing.
- A user cannot submit `admin` through modified client input.
- Back and refresh do not permit role reselection.

### Tests

- Clerk create and update payloads with and without email.
- Soft deletion behavior.
- Customer and provider role selection.
- Admin role rejection.
- Role immutability.
- Deleted account rejection.
- Role routing component behavior.

### Exit Gate

- A newly authenticated user is synchronized and routed through role selection.
- Returning customer and provider accounts reach the correct role home placeholder.
- Unauthorized role APIs fail in Convex, not only in the UI.

## Phase 3: Build The Service And Location Catalog

### Goal

Create scalable category, city, and area data that all onboarding and discovery features can depend on.

### Convex Schema

Add:

```text
serviceCategories
cities
areas
```

Add all indexes and uniqueness rules from `docs/backend-convex-plan.md`.

### Convex Functions

Implement authenticated reads:

```text
authed/catalog.listActiveCategories
authed/catalog.listActiveCities
authed/catalog.listActiveAreas
```

Implement internal seed logic:

```text
internal/catalog.seedInitialCatalog
```

Implement admin catalog functions for future management, even if the admin catalog page is deferred:

```text
authed/adminCatalog.createCategory
authed/adminCatalog.updateCategory
authed/adminCatalog.createCity
authed/adminCatalog.updateCity
authed/adminCatalog.createArea
authed/adminCatalog.updateArea
```

### Business Rules

- Category and city slugs are globally unique within their tables.
- Area slugs are unique within a city.
- Only active records appear in user-facing selectors.
- Disabling catalog data does not delete request history.
- Seed logic is idempotent.
- An area is always validated against its parent city.

### Shared Frontend Features

- Category selection grid.
- City combobox or select.
- Area select disabled until a city is chosen.
- Loading skeletons for catalog data.
- Clear no-data and failed-to-load states.
- Shared labels supporting future Urdu text.

### Tests

- Idempotent seeding.
- Duplicate slug rejection.
- Inactive items excluded from application queries.
- Area queries return only areas in the selected city.
- Non-admin catalog writes are rejected.

### Exit Gate

- Initial catalog records are available in development Convex.
- Shared selectors work with real Convex data.
- Catalog APIs have no unbounded table scans.

## Phase 4: Build Provider Onboarding And Secure Uploads

### Goal

Allow provider-role users to create a complete, reviewable profile securely.

### Convex Schema

Add:

```text
providerProfiles
providerVerificationDocuments
providerSkills
providerServiceAreas
providerAvailability
```

### Convex Functions

Implement:

```text
authed/providers.getMyProviderProfile
authed/providers.generateProviderPhotoUploadUrl
authed/providers.generateProviderDocumentUploadUrl
authed/providers.submitProviderOnboarding
authed/providers.updateProviderProfile
authed/providers.getMyVerificationDocumentUrl
```

### Upload Security

- Generate upload URLs only for authenticated provider-role users.
- Validate storage records after upload.
- Allow only approved image/PDF MIME types for CNIC documents.
- Enforce configured maximum file size.
- Require CNIC front and back if the product contract requires both.
- Never return verification files through public provider APIs.
- Keep profile photos separate from CNIC documents.
- Plan an internal orphaned-upload cleanup routine.

### Business Rules

- One provider profile per provider user.
- A customer cannot onboard as a provider.
- Skills use active category IDs.
- Service areas use active city and area IDs.
- Every area must belong to its submitted city.
- Duplicate categories and areas are rejected or normalized deterministically.
- Skill, area, and listing combination limits are enforced server-side.
- A submitted profile enters `pending`.
- New and resubmitted profiles are unavailable.
- Rejected providers can edit and resubmit.
- Approved providers editing verification-sensitive data return to pending.

### Page: `/provider/onboarding`

Sections:

1. Identity: display name and optional profile photo.
2. Services: multi-select skills with clear category icons.
3. Experience: integer years with plain-language guidance.
4. Coverage: city and one or more areas served.
5. Contact: normalized phone and WhatsApp numbers.
6. Verification: CNIC front and back upload.
7. Review: summary and consent before submission.

Features:

- React Hook Form with shared client validation matching Convex rules.
- Progress indicator suitable for mobile.
- Draft UI state retained while moving between form sections.
- Upload progress and replace-file actions.
- File type and size feedback before submission.
- Clear privacy explanation for CNIC documents.
- Duplicate submission prevention.
- Successful redirect to `/provider/pending`.

Acceptance criteria:

- A provider cannot submit incomplete or inconsistent data.
- Refreshing after successful submission loads the stored profile state.
- CNIC references never appear in client-visible public provider objects.
- Onboarding works at narrow mobile widths without horizontal scrolling.

### Tests

- Valid onboarding.
- Wrong role rejection.
- Duplicate profile prevention.
- Invalid or inactive category rejection.
- Area and city mismatch rejection.
- Skill and area limits.
- Invalid file metadata rejection.
- Pending status and forced unavailability.
- Rejected provider resubmission.

### Exit Gate

- A provider can submit a complete profile with documents.
- The resulting profile appears in the pending backend queue.
- The provider cannot make itself available before approval.

## Phase 5: Build Admin Authorization And Verification

### Goal

Create the trust and safety gate required before any provider can appear to customers.

### Convex Functions

Implement:

```text
authed/adminProviders.listPendingProviders
authed/adminProviders.getProviderForReview
authed/adminProviders.getVerificationDocumentUrl
authed/adminProviders.reviewProvider
```

### Admin Security

- Normalize authenticated email before allowlist comparison.
- Reject admin operations if the identity has no allowlisted email.
- Never accept admin authorization through function arguments.
- Keep allowlist values server-only.
- Return signed CNIC URLs only from the guarded review function.
- Record reviewer, timestamp, decision, and rejection reason.

### Page: `/admin/login`

Features:

- Signed-out users see Clerk sign-in.
- Signed-in non-admin users see a clear access denied state.
- Allowlisted users redirect to `/admin/verification`.
- No separate admin password or credentials are introduced.

### Page: `/admin/verification`

Features:

- Paginated queue of pending provider profiles.
- Provider name, services, city/areas, experience, and submission time.
- Oldest pending submissions are easy to identify.
- Empty state when no providers require review.
- Each item opens the detailed review page.

### Page: `/admin/verification/[providerId]`

Features:

- Complete provider profile.
- Skills and areas served.
- Secure profile and CNIC document viewing.
- Approve action with confirmation.
- Reject action requiring a reason.
- Mutation loading and duplicate-action prevention.
- Clear final decision confirmation and return to queue.

Acceptance criteria:

- Non-admin users cannot retrieve queue or document data even with direct Convex calls.
- Approval does not automatically set Available Now.
- Rejection stores a reason and forces availability off.
- Re-reviewing an already decided submission does not create an invalid transition.

### Tests

- Allowlisted admin access.
- Non-allowlisted access rejection.
- Missing-email admin rejection.
- Secure document URL authorization.
- Approval requirements.
- Mandatory rejection reason.
- Duplicate decision and stale-state handling.
- Availability forced off on rejection.

### Exit Gate

- An allowlisted admin can review and approve a real provider submission.
- A rejected provider sees the stored reason through its own guarded profile API.
- No non-admin API can retrieve CNIC information.

## Phase 6: Build Provider Status And Daily Dashboard

### Goal

Give providers clear verification status and let approved providers control discovery availability.

### Convex Functions

Implement or complete:

```text
authed/providers.setAvailability
authed/providers.getProviderDashboard
```

At this phase, incoming requests can return an empty list until the request tables are added.

### Page: `/provider/pending`

States:

```text
pending -> Under review
rejected -> Rejected with reason and Edit Profile action
approved -> Redirect to /provider
draft or incomplete -> Continue onboarding
```

Features:

- Clear explanation of why the provider is not searchable.
- Expected next action.
- Edit or resubmit action when rejected.
- Real-time status update after admin review.
- No availability toggle while pending or rejected.

### Page: `/provider`

Initial features:

- Provider greeting and verification badge.
- Available Now switch.
- Explanation that availability means ready to receive nearby requests.
- Disabled toggle with explanation if approval is absent.
- Placeholder or empty incoming request section.
- Profile editing entry point.
- Sign-out/account access.

### Business Rules

- Only the owning provider changes availability.
- Only approved providers can enable availability.
- Availability defaults to false.
- Updating availability is idempotent.
- Rejection, resubmission, or sensitive profile edits force it false.

### Tests

- Approved provider can enable and disable availability.
- Pending and rejected providers cannot enable it.
- Customer cannot change provider availability.
- Provider cannot change another provider's availability.
- Pending page reacts to real-time status changes.

### Exit Gate

- The provider journey works from onboarding through approval to enabling availability.
- Provider status behavior is understandable without admin assistance.

## Phase 7: Build Indexed Provider Discovery

### Goal

Make approved and available providers discoverable through scalable category and location matching.

### Convex Schema

Add:

```text
providerListings
```

### Listing Projection

Implement reusable transactional projection logic that:

- Reads provider profile, skills, areas, verification, and availability.
- Replaces stale listing combinations.
- Creates one listing for every allowed category and area combination.
- Sets discoverability only for approved and available providers.
- Copies only search-safe display fields.
- Enforces the maximum materialized row count.

Trigger projection updates when:

- Provider onboarding or profile data changes.
- Skills change.
- Areas change.
- Admin approval changes.
- Availability changes.
- Search-visible profile photo, name, or experience changes.

### Convex Functions

Implement:

```text
authed/providers.searchProviders
authed/providers.getPublicProvider
```

### Page: `/customer`

Features:

- Large category grid loaded from Convex.
- City selector.
- Area selector dependent on city.
- Continue or Search button.
- Optional remembered defaults from the user's profile.
- Search button disabled until all required filters are valid.
- Search navigates to URL parameters.

URL example:

```text
/customer/providers?category=electrician&city=lahore&area=gulberg
```

Use stable slugs in the URL and resolve them to IDs through bounded catalog queries or a dedicated filter-resolution API.

### Page: `/customer/providers`

Features:

- Validated category, city, and area filters from URL parameters.
- Paginated provider cards.
- Card displays provider name, skills, experience, area, verified badge, and Available Now badge.
- Edit filters action.
- Empty state suggesting another area or category.
- Invalid URL filter recovery.
- Mobile-friendly loading skeletons.
- No protected contact details.

### Page: `/customer/providers/[providerId]`

Features:

- Provider display name and photo.
- Approved verification badge.
- Skills.
- Experience years.
- Areas served.
- Availability state.
- Send Request button.
- Back to results action preserving filters where possible.
- Not-found state for hidden, rejected, or unavailable providers.

### Business Rules

- Only approved and available providers appear.
- Search uses the complete materialized listing index.
- No Convex `.filter()` or unbounded `.collect()` is used.
- Provider contact and verification documents are never returned.
- Inactive catalog filters cannot produce new results.
- A provider cannot be requested for a category or area it does not serve.

### Tests

- Correct provider appears for exact category, city, and area.
- Pending, rejected, and unavailable providers do not appear.
- Unsupported skill and area combinations do not appear.
- Listing rebuild removes stale rows.
- Duplicate listing rows are prevented.
- Public provider response contains no phone, WhatsApp, user identity, CNIC, or rejection data.
- Pagination works deterministically.

### Exit Gate

- A customer can search from `/customer` and open a matching provider profile.
- Turning provider availability off removes the provider from results in real time.
- Search remains entirely index-backed.

## Phase 8: Build Service Requests And Photo Security

### Goal

Enable customers to submit actionable requests to a selected provider.

### Convex Schema

Add:

```text
serviceRequests
requestAttachments
requestEvents
```

### Convex Functions

Implement:

```text
authed/requests.generateRequestPhotoUploadUrl
authed/requests.createRequest
authed/requests.listMyCustomerRequests
authed/requests.listMyProviderRequests
authed/requests.getMyRequest
authed/requests.getRequestAttachmentUrl
```

### Request Creation Rules

- Only customer-role users create requests.
- The selected provider exists, is approved, and is available at creation time.
- The exact provider, category, city, and area listing exists.
- Catalog records remain active.
- Budget is a positive whole PKR amount within the agreed limit.
- Description, address, and landmark respect length limits.
- Scheduled time is present only when needed time is scheduled.
- Customer phone is normalized and stored.
- At most three validated request photos are attached.
- Request and attachment records are created atomically where feasible.
- A `created` request event is recorded.
- Display snapshots are copied into the request.

### Page: `/customer/request/new`

Features:

- Selected provider summary.
- Problem description.
- Optional photo upload with previews and removal.
- Budget in PKR.
- City and area confirmation.
- Address.
- First-class landmark input.
- Needed time with ASAP as default.
- Customer phone and optional WhatsApp number.
- Review before submit.
- Submit loading state and duplicate prevention.
- Success confirmation and redirect to request detail.

Acceptance criteria:

- Directly changing `providerId`, category, city, or area in the URL cannot bypass server matching rules.
- A provider becoming unavailable before submission produces a recoverable unavailable result.
- Upload failure does not create a partial request.
- Customer contact is not exposed through provider listings or profiles.

### Page: `/customer/requests`

Features:

- Paginated list of the customer's requests.
- Status badges for pending, accepted, rejected, cancelled, and completed.
- Provider, category, area, budget, and creation time summary.
- Pending requests visually prioritized.
- Optional status tab or filter.
- Empty state links back to customer search.
- Real-time updates.

### Provider Dashboard Enhancement: `/provider`

Add:

- Incoming pending requests first.
- Other recent requests grouped or filtered by status.
- Customer name, category, area, budget, and request time summary.
- Real-time arrival of new requests.
- Empty state explaining that availability must be on to receive new requests.
- Link to provider request detail.

### Tests

- Valid matching request creation.
- Wrong-role request creation rejection.
- Unavailable provider rejection.
- Inactive catalog rejection.
- Mismatched category or area rejection.
- Budget and length validation.
- Attachment count, MIME, size, and ownership validation.
- Customer and provider list ownership.
- Non-participant request and attachment denial.
- Request snapshots remain stable after profile or catalog edits.

### Exit Gate

- A customer can submit a request with optional photos.
- The assigned provider receives it on the dashboard in real time.
- Other providers cannot read the request or its photos.

## Phase 9: Build Request Decisions And Contact Unlocking

### Goal

Complete the core online-to-offline workflow with secure request transitions.

### Convex Functions

Implement:

```text
authed/requests.respondToRequest
authed/requests.cancelRequest
authed/requests.completeRequest
```

Finalize participant-aware output from:

```text
authed/requests.getMyRequest
```

### State Machine

```text
pending -> accepted
pending -> rejected
pending -> cancelled
accepted -> completed
```

Terminal states:

```text
rejected
cancelled
completed
```

### Privacy Rules

- Customer contact is hidden from the provider before acceptance.
- Provider contact is hidden from the customer before acceptance.
- Accepted and completed requests expose participant contact information to both participants.
- Rejected and cancelled requests do not unlock contact information.
- Request address and photos remain visible only to participants.
- Non-participants receive a not-found-style response where practical.

### Page: `/provider/requests/[requestId]`

Pending state features:

- Description and request photos.
- Budget.
- City, area, address, and landmark.
- Needed time.
- Customer display name without protected contact.
- Accept action.
- Reject action with optional or required reason according to final product rule.
- Confirmation for irreversible decisions.

Accepted state features:

- Customer phone Call action.
- Customer WhatsApp deep link.
- Mark Completed action.
- Accepted timestamp and request summary.

Terminal state features:

- Clear rejected, cancelled, or completed status.
- Provider note where appropriate.
- No invalid actions.

### Page: `/customer/requests/[requestId]`

Pending state features:

- Full submitted request summary.
- Provider public summary.
- Waiting-for-response status.
- Cancel action with confirmation.
- No provider contact details.

Accepted state features:

- Provider phone Call action.
- Provider WhatsApp deep link as the primary contact action.
- Mark Completed action.
- Accepted timestamp.

Rejected state features:

- Clear rejection status.
- Provider note when supplied.
- Search for another provider action.

Cancelled and completed state features:

- Clear final status and timestamp.
- No actions that violate the state machine.
- Search again action where useful.

### Call And WhatsApp Links

- Use normalized phone numbers for `tel:` links.
- Use international phone format for WhatsApp links.
- Do not build links until contact access is authorized by Convex output.
- Add a concise prefilled WhatsApp message only if it does not expose sensitive information in the URL.

### Concurrency Rules

- Every transition checks the current status inside the mutation.
- Accept and reject racing can produce only one successful transition.
- Customer cancel racing with provider acceptance can produce only one successful transition.
- Repeated submissions are rejected or handled idempotently without duplicate events.
- Every successful transition writes exactly one request event.

### Tests

- Assigned provider accepts pending request.
- Assigned provider rejects pending request.
- Unassigned provider cannot respond.
- Customer cancels pending request.
- Provider cannot cancel as customer.
- Either participant completes accepted request.
- Pending request cannot complete.
- Terminal states cannot transition.
- Contact is hidden before acceptance.
- Contact is available to participants after acceptance.
- Contact remains unavailable to non-participants.
- Race tests preserve one valid terminal or accepted state.

### Exit Gate

- The complete customer-to-provider workflow functions in real time.
- Contact is unlocked only after acceptance.
- Either participant can complete an accepted offline job.
- Every state transition is authorization-tested.

## Phase 10: Build Role-Specific Application Shells

### Goal

Replace the generic starter shell with focused mobile navigation for each role.

### Customer Shell

Navigation:

```text
Find Service -> /customer
My Requests -> /customer/requests
Account -> Clerk user controls or account sheet
```

### Provider Shell

Navigation:

```text
Dashboard -> /provider
Requests -> provider request list or dashboard section
Profile -> onboarding/edit profile
Account -> Clerk user controls
```

### Admin Shell

Navigation:

```text
Verification -> /admin/verification
Account -> Clerk user controls
```

### Shared Shell Behavior

- Mobile bottom navigation for primary destinations.
- Compact top header with brand and account control.
- Desktop side or top navigation only when useful.
- Correct active route states, including detail pages.
- No customer links shown to providers or provider links shown to customers.
- Role routing still enforced by server-backed gates and Convex authorization.
- Respect safe areas and mobile browser viewport behavior.

### Exit Gate

- Every role sees only relevant navigation.
- Navigation is usable at mobile and desktop sizes.
- Direct URL entry still obeys role authorization.

## Phase 11: Build Public Trust And Support Pages

### Goal

Replace the starter marketing page with a credible FixNow public experience.

### Page: `/`

Sections:

- Header with FixNow logo and Get Started action.
- Hero explaining fast local service discovery.
- Supported cities: Lahore, Karachi, and Islamabad.
- Service category icon strip using active catalog data or a stable initial subset.
- Three-step explanation: Search, Choose, Request.
- Trust strip: verified providers, WhatsApp contact, no online payment.
- Customer and provider entry actions.
- Footer links to Help, Contact, Terms, and Privacy.

Behavior:

- Signed-out Get Started opens or navigates to Clerk sign-in.
- Signed-in users go to their role destination.
- Fast initial load and responsive imagery.
- No authenticated Convex query is required to render essential landing content.

### Page: `/help`

Content:

- How customers find providers.
- How providers become verified.
- What Available Now means.
- How acceptance and contact unlocking work.
- Safety guidance for offline jobs.
- No online payment explanation.

### Page: `/contact`

Content:

- Support channel or support details selected by the business.
- Expected response time.
- Guidance for urgent safety issues.
- No fake contact details; block launch until real details are supplied.

### Page: `/terms`

Minimum topics:

- Platform role as a matching service.
- Offline service responsibility.
- Provider verification limitations.
- Prohibited behavior.
- Account suspension.
- No online payment handling.

### Page: `/privacy`

Minimum topics:

- Clerk identity data.
- Contact information.
- CNIC verification documents.
- Request photos, address, and landmark.
- Who receives contact details and when.
- Data retention and account deletion behavior.
- Support contact for privacy requests.

Legal text must be reviewed by the business or legal counsel before public launch.

### Exit Gate

- No starter-template branding remains on public pages.
- Footer links resolve successfully.
- Public pages work while signed out.
- Privacy language accurately describes implemented data handling.

## Phase 12: Handle Edge Cases And Operational Safety

### Goal

Close workflow gaps that appear outside the happy path.

### Account Edge Cases

- Clerk webhook arrives after first authenticated page load.
- Facebook account has no email.
- User identity updates after role selection.
- User account is deleted while requests exist.
- Admin is removed from allowlist while signed in.

### Provider Edge Cases

- Provider edits verification-sensitive fields after approval.
- Provider removes a category or area with historical requests.
- Provider becomes unavailable while a customer form is open.
- Provider is rejected while currently available.
- Provider uploads a file and abandons onboarding.
- Catalog item is deactivated while used by a provider.

### Request Edge Cases

- Customer refreshes immediately after submitting.
- Provider accepts while customer cancels.
- Duplicate action caused by repeated taps or slow mobile internet.
- Request participant account is later deleted.
- Signed file URL expires while detail page remains open.
- Request link is opened by a non-participant.
- Provider availability changes after a request already exists.

### Operational Functions

- Add internal orphaned-upload cleanup in bounded batches.
- Add internal provider listing repair/rebuild function.
- Add internal catalog seed function safe to rerun.
- Add structured Effect logs for verification decisions and request transitions.
- Avoid logging addresses, CNIC data, phone numbers, or request photo URLs.

### Exit Gate

- Every listed edge case has defined behavior and automated coverage where practical.
- Repair and cleanup functions are internal-only and bounded.
- Sensitive data does not appear in application logs.

## Phase 13: Accessibility, Localization Readiness, And Mobile QA

### Goal

Ensure the application is usable by the intended mobile-first, non-technical audience.

### Accessibility

- All form fields have persistent labels.
- Validation errors are associated with their fields.
- Status updates use appropriate live regions without excessive announcements.
- Dialogs and confirmation flows manage focus correctly.
- Keyboard navigation reaches all actions.
- Touch targets are at least comfortably tappable.
- Color is not the only indicator of request or verification status.
- Loading skeletons do not trap screen-reader users.
- Upload controls have accessible names and progress feedback.
- Focus indicators remain visible.

### Mobile QA

Test at minimum:

- 320px narrow viewport
- iPhone SE-size viewport
- Modern iPhone viewport
- Common Android viewport
- Tablet viewport
- Desktop viewport

Check:

- No horizontal overflow.
- Bottom navigation does not cover content.
- Forms remain usable with the software keyboard open.
- Long names, areas, and addresses wrap correctly.
- Upload previews do not overflow.
- Dialog actions remain reachable.
- Call and WhatsApp actions open valid targets.
- Poor-network loading states remain understandable.

### Localization Readiness

- Keep user-facing strings centralized by feature where practical.
- Support optional Urdu category and location labels from catalog data.
- Do not concatenate fragments that would prevent later translation.
- Use Pakistan-friendly phone and currency formatting.
- Display PKR consistently.

### Exit Gate

- Core customer and provider journeys pass keyboard and screen-reader smoke tests.
- Core pages pass mobile viewport checks.
- No critical accessibility violations remain.

## Phase 14: Complete Automated Testing

### Goal

Protect authorization, privacy, state transitions, and key user interfaces before deployment.

### Convex Integration Suite

Required suites:

```text
users and roles
admin allowlist authorization
catalog and seed idempotency
provider onboarding
verification documents
provider review
availability
listing projection
provider discovery privacy
request creation
request attachment authorization
request ownership
request transitions
contact unlocking
concurrency and idempotency
soft deletion and historical records
```

### Frontend Tests

Required components and flows:

- Role selection success and error states.
- Catalog selector dependencies.
- Provider onboarding validation.
- File input count and type feedback.
- Provider availability disabled states.
- Search empty and loading states.
- Request form validation.
- Request status rendering.
- Contact buttons hidden and visible states.
- Admin rejection reason validation.
- Role navigation visibility.

### End-To-End Smoke Scenarios

If browser automation is added, cover these high-value scenarios:

1. Provider signs in, selects role, and submits onboarding.
2. Admin approves provider.
3. Provider enables availability.
4. Customer signs in, selects role, searches, and submits request.
5. Provider accepts request.
6. Customer sees Call and WhatsApp actions.
7. Customer or provider completes request.
8. Rejected request never exposes contact information.

### Quality Commands

After every Convex change:

```bash
pnpm run convex:gen
pnpm run lint
pnpm run typecheck
pnpm run test:run
```

Before launch:

```bash
pnpm run build
pnpm run fallow:audit
pnpm run doctor
```

Review diagnostic output rather than blindly accepting automated changes.

### Exit Gate

- Authorization and privacy rules have integration tests.
- Request state transitions and races have integration tests.
- Core forms and status displays have frontend tests.
- All quality commands pass or have explicitly documented, accepted exceptions.

## Phase 15: Remove Starter Code And Finalize Documentation

### Goal

Remove temporary scaffolding only after all production replacements are working.

### Cleanup

- Remove the `numbers` table from the schema.
- Remove number demo functions.
- Remove `/dashboard` or redirect it to the role-aware home.
- Remove `/server-demo`.
- Remove starter navigation items and copy.
- Remove unused starter skeletons and assets.
- Remove obsolete private API-key examples only if they are no longer intentionally retained as project references.
- Keep convention demos only when documentation explicitly depends on them.
- Update README from starter setup to FixNow development instructions.
- Update `docs/CONTEXT.md` domain glossary and route conventions.
- Document seed commands and admin setup.
- Document Clerk webhook URL and expected event types.
- Document local, preview, and production environment variables.

### Migration Safety

- If demo data exists in a deployed Convex environment, follow a safe schema migration sequence before removing the table.
- Widen first when adding required user fields to existing users.
- Backfill existing user records.
- Narrow validators only after backfill completes.
- Do not deploy a schema that immediately rejects existing documents.

### Exit Gate

- No user-facing starter content remains.
- Documentation describes the actual application.
- Existing deployed documents remain valid through schema changes.
- No unused demo API is exposed to clients.

## Phase 16: Preview Deployment And Acceptance Testing

### Goal

Validate the complete application against real hosted Clerk and Convex environments before production launch.

### Preview Setup

- Create or verify a preview Convex deployment.
- Configure Clerk keys and Convex JWT integration.
- Configure Clerk webhook secret and hosted Convex webhook URL.
- Configure admin allowlist.
- Seed preview catalog data.
- Configure Next.js public Convex URL and site URL.
- Verify image host configuration for Clerk social profile images.
- Confirm no secrets are exposed in client bundles.

### Acceptance Accounts

Prepare distinct accounts:

- Customer account
- Provider account
- Allowlisted admin account
- Non-admin account for authorization tests
- Rejected provider scenario

### Full Acceptance Run

1. Authenticate a new provider through Google or Facebook.
2. Select provider role.
3. Complete onboarding on mobile.
4. Upload valid CNIC files.
5. Verify pending state.
6. Sign in as admin.
7. Review documents and approve provider.
8. Verify provider sees approval in real time.
9. Enable Available Now.
10. Authenticate a new customer.
11. Select customer role.
12. Search exact category, city, and area.
13. Open provider profile.
14. Submit request with and without a photo in separate runs.
15. Verify provider receives request in real time.
16. Verify contact is hidden before acceptance.
17. Accept request.
18. Verify Call and WhatsApp actions for both parties.
19. Complete request from each role in separate runs.
20. Repeat with rejection and cancellation paths.
21. Verify non-participant direct links reveal no data.
22. Verify provider disappears immediately after turning availability off.

### Exit Gate

- Every acceptance step passes in the preview environment.
- Google and Facebook sign-in both work.
- Webhook synchronization is reliable.
- Mobile workflows work on at least one physical iOS or Android device if available.
- No protected contact or CNIC data is visible outside authorized contexts.

## Phase 17: Production Launch

### Goal

Deploy a secure, observable, supportable MVP.

### Production Configuration

- Configure production Convex deployment.
- Configure production Clerk instance and JWT template.
- Configure production Clerk webhook and secret.
- Configure production admin allowlist.
- Seed production catalog exactly once with idempotent tooling.
- Configure production site URL and Convex URLs.
- Verify terms, privacy, contact, and support details.
- Verify domain and HTTPS behavior.

### Launch Checks

- Run production build.
- Run all automated tests.
- Verify schema deployment and generated API.
- Verify webhook delivery from Clerk dashboard.
- Verify admin access with a real allowlisted account.
- Verify a complete provider approval and customer request smoke flow.
- Verify logs contain no CNIC, address, phone, or signed URL data.
- Verify error pages do not expose stack traces.
- Verify rate and abuse risks are documented for post-MVP hardening.

### Initial Monitoring

Monitor:

- Clerk webhook failures
- User synchronization failures
- Provider onboarding submission errors
- Storage upload errors
- Admin verification errors
- Provider listing projection mismatches
- Request creation failures
- Invalid transition errors
- Convex read/write limits and latency

### Exit Gate

- Production smoke flow passes.
- A support owner and admin owner are identified.
- Recovery steps for webhook, catalog, and listing issues are documented.
- The MVP is available to users in the supported cities.

## Phase 18: Immediate Post-Launch Work

### Goal

Stabilize the MVP using real operational evidence without expanding scope prematurely.

### First Priorities

- Fix authorization, privacy, data-loss, and broken-workflow issues before adding features.
- Monitor areas and categories with no available providers.
- Monitor provider response and rejection patterns without introducing ratings.
- Review abandoned onboarding uploads and cleanup behavior.
- Review invalid request transitions and repeated submission patterns.
- Improve copy and empty states based on support questions.
- Add abuse controls if spam requests or upload misuse appears.

### Deferred Feature Review

Only after the MVP is stable, evaluate:

- Notifications
- Better scheduling
- Admin catalog UI
- Provider suspension tooling
- Reporting and moderation
- Ratings and reviews
- Payments
- Maps
- In-app chat

Each deferred feature requires a separate product and backend design before implementation.

## Page Completion Checklist

Every application page is complete only when all relevant conditions pass:

- Correct role can access it.
- Wrong role cannot access its data through Convex.
- Signed-out behavior is defined.
- Initial loading state exists.
- Empty state exists where a collection can be empty.
- Recoverable error state exists.
- Mutation loading prevents duplicate actions.
- Success feedback is clear.
- Mobile layout works at narrow width.
- Keyboard navigation works.
- Focus states are visible.
- Protected data is absent until authorized.
- Direct URL and invalid parameter behavior is defined.
- Real-time state changes render correctly.
- Relevant tests exist.

## Feature Completion Checklist

Every backend feature is complete only when:

- Convex arguments have explicit validators.
- Client-facing functions use authenticated wrappers.
- Internal functions use `internal*` registration.
- Role and ownership are derived server-side.
- Queries use indexes and bounded reads.
- Returned objects expose only necessary fields.
- State transitions are validated transactionally.
- Effect errors are tagged, safe, and Convex-serializable.
- Sensitive values are not logged.
- Integration tests include unauthorized behavior.
- `pnpm run convex:gen` passes.
- `pnpm run lint` passes.
- `pnpm run typecheck` passes.
- `pnpm run test:run` passes.

## Critical Dependency Chain

The shortest valid dependency order is:

```text
Project foundation
-> Users and roles
-> Catalog
-> Provider onboarding
-> Admin verification
-> Provider availability
-> Provider listing projection
-> Customer discovery
-> Request creation
-> Provider response
-> Contact unlocking
-> Completion
-> Public trust pages
-> Hardening and launch
```

Do not build these out of order:

- Do not build provider search before provider approval and availability rules exist.
- Do not build request creation before exact provider/category/area matching is enforceable.
- Do not build contact buttons before participant-aware request output is implemented.
- Do not expose verification documents before admin authorization is tested.
- Do not remove starter demos before production patterns and test harnesses replace them.
- Do not deploy required schema fields before existing documents are backfilled.

## Recommended Delivery Milestones

### Milestone 1: Authenticated Accounts

Includes Phases 0 through 2.

Demo outcome: new users authenticate, synchronize, select a role, and reach the correct role route.

### Milestone 2: Verified Provider Supply

Includes Phases 3 through 6.

Demo outcome: provider submits onboarding, admin approves, and provider enables availability.

### Milestone 3: Customer Discovery

Includes Phase 7.

Demo outcome: customer searches exact category and location and sees only discoverable providers.

### Milestone 4: Complete Service Workflow

Includes Phases 8 and 9.

Demo outcome: customer requests service, provider accepts or rejects, contacts unlock after acceptance, and either participant completes the job.

### Milestone 5: Product-Ready Experience

Includes Phases 10 through 15.

Demo outcome: role-specific navigation, credible public pages, robust edge handling, accessibility, tests, and no starter residue.

### Milestone 6: Launch

Includes Phases 16 through 18.

Demo outcome: preview acceptance passes, production is deployed, and immediate operational monitoring is active.

## Final MVP Definition Of Done

The MVP is done only when:

- Clerk authentication works with Google and Facebook.
- Clerk webhook synchronization works for create, update, and delete events.
- Customer and provider roles are immutable through public APIs.
- Admin access is enforced through the server environment allowlist.
- Provider onboarding securely stores profile and CNIC references.
- Admin can approve and reject providers.
- Only approved providers can enable availability.
- Search returns only approved, available, exact-match providers through indexed queries.
- Customers can submit valid requests with optional photos.
- Providers receive requests in real time.
- Providers can accept or reject only their assigned pending requests.
- Customers can cancel only their pending requests.
- Contact details remain hidden until acceptance.
- Either participant can complete an accepted request.
- Non-participants cannot access requests, attachments, contacts, or verification documents.
- Every MVP page has appropriate loading, empty, error, and mobile states.
- Core authorization, privacy, discovery, and lifecycle tests pass.
- Production build, lint, typecheck, Convex code generation, and tests pass.
- Public help, contact, terms, and privacy content is accurate.
- Preview acceptance and production smoke tests pass.

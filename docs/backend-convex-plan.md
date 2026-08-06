# FixNow PK MVP Convex Backend Plan

## Purpose

This document is the implementation reference for the FixNow PK MVP backend. It refines the product plan in `PRD/build plan mvp .md` into a Convex schema, authorization model, API surface, request state machine, storage policy, testing strategy, and implementation sequence.

The architecture is organized around four boundaries:

1. Identity and roles
2. Catalog and location data
3. Provider onboarding and discovery
4. Service request lifecycle

## Confirmed Decisions

- Clerk authentication and the existing Clerk webhook remain the canonical source for user synchronization.
- Google and Facebook are the configured social authentication methods.
- Cities, areas, and service categories use scalable Convex catalog tables rather than hard-coded constants.
- Either request participant can immediately mark an accepted request as completed.
- Admin access is granted through a protected server environment allowlist.
- There are no payments, ratings, reviews, in-app chat, or maps in the MVP.
- Client-facing Convex functions use the authenticated wrappers in `convex/authed`.
- Convex-only functions use built-in `internalQuery`, `internalMutation`, and `internalAction`.
- Backend code follows the project's Effect v4 conventions.

## Core Design Refinements

The initial PRD is the product source of truth, with these backend refinements:

- Store categories, cities, and areas in normalized catalog tables.
- Normalize provider skills and service coverage instead of using growing arrays on provider documents.
- Use materialized `providerListings` rows for fully indexed provider discovery.
- Separate high-churn provider availability from stable provider profile data.
- Never expose phone, WhatsApp, address, landmarks, or CNIC data through public provider results.
- Enforce roles and ownership in Convex even when Next.js routes are protected.
- Preserve historical users referenced by requests through soft deletion.
- Store request photos and provider verification files as separate child documents.
- Record immutable request lifecycle events for auditability.

## Roles and Identity

### Roles

```ts
type UserRole = "customer" | "provider" | "admin";
```

Rules:

- A new synchronized user starts without a role.
- Public role selection accepts only `customer` or `provider`.
- A user can publicly select a role only once.
- A client can never assign itself the `admin` role.
- Admin authorization is derived from a normalized server-side environment allowlist.
- Every customer, provider, and admin function verifies the effective role.
- Next.js route protection is a UX layer; Convex is the authorization authority.

Recommended environment variable:

```env
ADMIN_EMAIL_ALLOWLIST=admin1@example.com,admin2@example.com
```

Allowlist values must be trimmed and lowercased before comparison.

### Contact Information

Google and Facebook identities cannot guarantee that Clerk provides a phone number. The app must therefore collect contact information separately:

- Providers supply a phone number and WhatsApp number during onboarding.
- Customers supply a phone number before or during their first request.
- Phone values are normalized to E.164, such as `+923001234567`.
- Contact information is not exposed to the other party until a request is accepted.

## Schema

All tables are defined in `convex/schema.ts`. Every index name includes all indexed fields, following the Convex project guidelines.

### `users`

Stores stable application account and Clerk identity information.

```ts
users: {
  clerkId: string;
  tokenIdentifier: string;
  name: string;
  email?: string;
  avatarUrl?: string;

  role?: "customer" | "provider" | "admin";

  phoneNumber?: string;
  whatsappNumber?: string;

  defaultCityId?: Id<"cities">;
  defaultAreaId?: Id<"areas">;

  accountStatus: "active" | "deleted";
  deletedAt?: number;

  createdAt: number;
  updatedAt: number;
}
```

Indexes:

```ts
by_token_identifier: ["tokenIdentifier"]
by_clerk_id: ["clerkId"]
by_email: ["email"]
by_role: ["role"]
```

Rules:

- Clerk webhook synchronization creates and updates these records.
- `deleteFromClerk` must not physically delete users referenced by service requests.
- Clerk deletion marks the account as deleted and scrubs fields no longer required.
- Request history remains intact after account deletion.

### `serviceCategories`

Admin-managed service taxonomy.

```ts
serviceCategories: {
  slug: string;
  name: string;
  nameUrdu?: string;
  description?: string;
  iconKey: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
```

Indexes:

```ts
by_slug: ["slug"]
by_is_active_and_sort_order: ["isActive", "sortOrder"]
```

The `slug` must be unique and enforced in mutations with `.unique()`.

Initial examples:

- electrician
- plumber
- ac-technician
- carpenter
- painter

### `cities`

```ts
cities: {
  slug: string;
  name: string;
  nameUrdu?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
```

Indexes:

```ts
by_slug: ["slug"]
by_is_active_and_sort_order: ["isActive", "sortOrder"]
```

Initial records:

- Lahore
- Karachi
- Islamabad

### `areas`

```ts
areas: {
  cityId: Id<"cities">;
  slug: string;
  name: string;
  nameUrdu?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}
```

Indexes:

```ts
by_city_id_and_slug: ["cityId", "slug"]
by_city_id_and_is_active_and_sort_order: ["cityId", "isActive", "sortOrder"]
```

The combination of `cityId` and `slug` must be unique.

### `providerProfiles`

Stores stable provider profile and verification state.

```ts
providerProfiles: {
  userId: Id<"users">;

  displayName: string;
  profilePhotoId?: Id<"_storage">;
  experienceYears: number;
  bio?: string;

  phoneNumber: string;
  whatsappNumber: string;

  verificationStatus: "draft" | "pending" | "approved" | "rejected";
  verificationReason?: string;
  submittedAt?: number;
  reviewedAt?: number;
  reviewedBy?: Id<"users">;

  createdAt: number;
  updatedAt: number;
}
```

Indexes:

```ts
by_user_id: ["userId"]
by_verification_status_and_submitted_at: ["verificationStatus", "submittedAt"]
```

Rules:

- Exactly one provider profile exists per provider user.
- Customers cannot create provider profiles.
- Approval requires at least one active skill and one active service area.
- Editing identity, CNIC, skills, or coverage after approval may return the profile to `pending`.
- Cosmetic changes such as a bio update do not necessarily require re-verification.

### `providerVerificationDocuments`

Stores private verification document references separately from public profile data.

```ts
providerVerificationDocuments: {
  providerId: Id<"providerProfiles">;
  kind: "cnic_front" | "cnic_back";
  storageId: Id<"_storage">;
  uploadedAt: number;
}
```

Indexes:

```ts
by_provider_id: ["providerId"]
by_provider_id_and_kind: ["providerId", "kind"]
```

Only these users can obtain signed document URLs:

- The provider who owns the document
- An allowlisted administrator reviewing the provider

CNIC storage IDs and URLs must never be returned from customer-facing provider queries.

### `providerSkills`

Normalized provider-to-category relationship.

```ts
providerSkills: {
  providerId: Id<"providerProfiles">;
  categoryId: Id<"serviceCategories">;
  createdAt: number;
}
```

Indexes:

```ts
by_provider_id: ["providerId"]
by_provider_id_and_category_id: ["providerId", "categoryId"]
by_category_id: ["categoryId"]
```

Enforce a product limit of eight active skills per provider for the MVP.

### `providerServiceAreas`

Normalized provider coverage.

```ts
providerServiceAreas: {
  providerId: Id<"providerProfiles">;
  cityId: Id<"cities">;
  areaId: Id<"areas">;
  createdAt: number;
}
```

Indexes:

```ts
by_provider_id: ["providerId"]
by_provider_id_and_area_id: ["providerId", "areaId"]
by_city_id_and_area_id: ["cityId", "areaId"]
```

Validation must ensure that `area.cityId === cityId`.

### `providerAvailability`

High-churn availability is separated from stable profile data.

```ts
providerAvailability: {
  providerId: Id<"providerProfiles">;
  availableNow: boolean;
  updatedAt: number;
}
```

Index:

```ts
by_provider_id: ["providerId"]
```

Rules:

- Exactly one availability row exists per provider.
- Only an approved provider can set `availableNow` to `true`.
- Rejecting or otherwise disabling a provider forces availability to `false`.

### `providerListings`

Materialized provider search projection. One row represents one provider, category, and area combination.

```ts
providerListings: {
  providerId: Id<"providerProfiles">;
  providerUserId: Id<"users">;
  categoryId: Id<"serviceCategories">;
  cityId: Id<"cities">;
  areaId: Id<"areas">;

  isDiscoverable: boolean;

  displayName: string;
  experienceYears: number;
  profilePhotoId?: Id<"_storage">;

  updatedAt: number;
}
```

Indexes:

```ts
by_provider_id: ["providerId"]
by_provider_id_and_category_id_and_area_id: ["providerId", "categoryId", "areaId"]
by_is_discoverable_and_category_id_and_city_id_and_area_id: [
  "isDiscoverable",
  "categoryId",
  "cityId",
  "areaId"
]
```

Search implementation:

```ts
ctx.db
  .query("providerListings")
  .withIndex(
    "by_is_discoverable_and_category_id_and_city_id_and_area_id",
    (q) =>
      q
        .eq("isDiscoverable", true)
        .eq("categoryId", categoryId)
        .eq("cityId", cityId)
        .eq("areaId", areaId),
  )
  .paginate(paginationOpts);
```

This avoids:

- Table scans
- Convex `.filter()`
- Reading all providers and filtering in application code
- Runtime intersections across skills, areas, verification, and availability

Listings must be rebuilt transactionally when:

- Skills change
- Service areas change
- Verification status changes
- Availability changes
- Search-visible profile information changes

MVP limits:

```text
maximum skills: 8
maximum areas: 15
maximum listing rows: 120
```

### `serviceRequests`

Primary service request and job state.

```ts
serviceRequests: {
  customerUserId: Id<"users">;
  providerId: Id<"providerProfiles">;
  providerUserId: Id<"users">;

  categoryId: Id<"serviceCategories">;
  cityId: Id<"cities">;
  areaId: Id<"areas">;

  categoryNameSnapshot: string;
  cityNameSnapshot: string;
  areaNameSnapshot: string;
  providerNameSnapshot: string;
  customerNameSnapshot: string;

  description: string;
  budgetAmount: number;
  currency: "PKR";

  address: string;
  landmark?: string;
  neededTime: "asap" | "today" | "scheduled";
  scheduledFor?: number;

  customerPhoneNumber: string;
  customerWhatsappNumber?: string;

  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "completed";

  providerNote?: string;

  acceptedAt?: number;
  rejectedAt?: number;
  cancelledAt?: number;
  completedAt?: number;
  completedByUserId?: Id<"users">;

  createdAt: number;
  updatedAt: number;
}
```

Indexes:

```ts
by_customer_user_id_and_created_at: ["customerUserId", "createdAt"]
by_customer_user_id_and_status_and_created_at: [
  "customerUserId",
  "status",
  "createdAt"
]
by_provider_user_id_and_created_at: ["providerUserId", "createdAt"]
by_provider_user_id_and_status_and_created_at: [
  "providerUserId",
  "status",
  "createdAt"
]
```

Store both foreign keys and display snapshots:

- IDs preserve relationships.
- Snapshots preserve historical display values when names or taxonomy records change.

Money is stored as an integer number of PKR, not as a floating-point decimal.

### `requestAttachments`

Stores request photos separately from the request document.

```ts
requestAttachments: {
  requestId: Id<"serviceRequests">;
  storageId: Id<"_storage">;
  kind: "problem_photo";
  uploadedByUserId: Id<"users">;
  createdAt: number;
}
```

Index:

```ts
by_request_id: ["requestId"]
```

MVP rules:

- Maximum three photos per request.
- Validate MIME type and storage metadata.
- Enforce an upload size limit.
- Only request participants can obtain signed URLs.

### `requestEvents`

Immutable lifecycle audit trail.

```ts
requestEvents: {
  requestId: Id<"serviceRequests">;
  actorUserId: Id<"users">;
  type: "created" | "accepted" | "rejected" | "cancelled" | "completed";
  note?: string;
  createdAt: number;
}
```

Index:

```ts
by_request_id_and_created_at: ["requestId", "createdAt"]
```

## Request State Machine

Allowed transitions:

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

Rules:

- Only the assigned provider can accept or reject.
- Only the customer can cancel.
- Cancellation is allowed only while pending.
- Either participant can complete an accepted request.
- Completion happens immediately.
- A rejected, cancelled, or completed request cannot transition again.
- Accept and reject operations check the current status inside the mutation transaction.
- Contact information is unlocked only for accepted and completed requests.

## Convex API Organization

All client-facing functions use the existing `effectAuthedQuery` and `effectAuthedMutation` wrappers.

Convex-only work uses `internalQuery`, `internalMutation`, and `internalAction`. API-key-guarded public functions are not used for Convex-to-Convex calls.

Recommended structure:

```text
convex/
  schema.ts
  http.ts
  users.ts

  domain/
    validators.ts
    authorization.ts
    listings.ts
    requests.ts
    phone.ts

  authed/
    account.ts
    catalog.ts
    providers.ts
    requests.ts
    adminProviders.ts
    adminCatalog.ts
    uploads.ts

  internal/
    listings.ts
    maintenance.ts
```

### Account Functions

File: `convex/authed/account.ts`

```ts
currentUser()
selectRole({ role })
updateCustomerContact({ phoneNumber, whatsappNumber? })
updateDefaults({ cityId, areaId })
```

Authorization and validation:

- `selectRole` accepts only `customer` or `provider`.
- Changing an already selected public role is rejected.
- A selected default area must belong to the selected city.
- `currentUser` can return an effective admin role when the identity is allowlisted.

### Catalog Functions

File: `convex/authed/catalog.ts`

```ts
listActiveCategories()
listActiveCities()
listActiveAreas({ cityId })
```

Catalog queries are bounded, return only active records, and use indexes.

### Customer Provider Functions

File: `convex/authed/providers.ts`

```ts
searchProviders({
  categoryId,
  cityId,
  areaId,
  paginationOpts,
})

getPublicProvider({ providerId })
```

`searchProviders` must:

- Require the customer role.
- Validate that category, city, and area are active.
- Verify that the area belongs to the city.
- Query only `providerListings` with `isDiscoverable: true`.
- Return no contact information.
- Return a paginated result.

`getPublicProvider` must:

- Require the customer role.
- Return only an approved, currently discoverable provider.
- Return public skills and service areas.
- Never return phone numbers, WhatsApp numbers, CNIC IDs, verification notes, or internal user data.

### Provider Profile Functions

File: `convex/authed/providers.ts`

```ts
getMyProviderProfile()
generateProviderDocumentUploadUrl()
submitProviderOnboarding({
  displayName,
  experienceYears,
  bio?,
  phoneNumber,
  whatsappNumber,
  categoryIds,
  serviceAreas,
  verificationDocuments,
})
updateProviderProfile(...)
setAvailability({ availableNow })
```

Provider onboarding responsibilities:

1. Require the provider role.
2. Validate category and area records.
3. Validate and normalize phone values.
4. Validate experience range.
5. Enforce skill, area, and listing-row limits.
6. Validate uploaded storage metadata.
7. Upsert the provider profile.
8. Replace normalized skill and area records.
9. Save verification document references.
10. Set verification status to `pending`.
11. Force availability to `false`.
12. Rebuild materialized provider listings.

### Request Functions

File: `convex/authed/requests.ts`

```ts
generateRequestPhotoUploadUrl()

createRequest({
  providerId,
  categoryId,
  cityId,
  areaId,
  description,
  budgetAmount,
  address,
  landmark?,
  neededTime,
  scheduledFor?,
  customerPhoneNumber,
  customerWhatsappNumber?,
  photoStorageIds,
})

listMyCustomerRequests({ status?, paginationOpts })
listMyProviderRequests({ status?, paginationOpts })
getMyRequest({ requestId })
cancelRequest({ requestId })
respondToRequest({ requestId, decision, note? })
completeRequest({ requestId })
```

`createRequest` verifies transactionally:

- The viewer has the customer role.
- The provider exists and is approved.
- The provider is currently available.
- A matching listing exists for the provider, category, city, and area.
- Category, city, and area are active.
- Description and address lengths are valid.
- Budget is a positive integer within an accepted maximum.
- A customer phone number is available.
- No more than three photos are attached.
- Every attachment belongs to the submitting user's upload flow.

A provider becoming unavailable after creation does not invalidate an existing request. Availability is checked when the request is created.

### Admin Verification Functions

File: `convex/authed/adminProviders.ts`

```ts
listPendingProviders({ paginationOpts })
getProviderForReview({ providerId })
getVerificationDocumentUrl({ documentId })
reviewProvider({ providerId, decision, reason? })
```

Rules:

- Every admin operation verifies the environment allowlist.
- Client-supplied admin roles are never trusted.
- Approval requires complete onboarding data.
- Rejection requires a non-empty reason.
- Approval sets verification to `approved` but does not automatically enable availability.
- Rejection forces availability to `false`.
- Every decision rebuilds provider listings.

### Admin Catalog Functions

File: `convex/authed/adminCatalog.ts`

```ts
createCategory(...)
updateCategory(...)
createCity(...)
updateCity(...)
createArea(...)
updateArea(...)
```

Seed the initial catalog through an internal mutation. An admin catalog UI can be postponed while retaining the scalable schema.

## Privacy-Safe Responses

Raw documents containing protected fields must not be returned directly.

### Public Provider Result

```ts
{
  providerId,
  displayName,
  profilePhotoUrl,
  experienceYears,
  skills,
  serviceAreas,
  verificationStatus: "approved",
  availableNow: true,
}
```

Never include:

- Internal `userId`
- Clerk ID
- CNIC IDs or URLs
- Phone number
- WhatsApp number
- Admin rejection reason

### Request Detail Before Acceptance

The customer can see:

- Submitted request data
- Provider public profile data
- Current status
- Provider note after rejection

The provider can see:

- Request description
- Budget
- Address and landmark
- Customer display name
- Request photos
- Needed time

The provider cannot see customer contact information before acceptance.

### Request Detail After Acceptance

Both participants receive the other party's:

- Display name
- Phone number
- WhatsApp number

Non-participants receive a not-found-style error where practical to prevent request ID enumeration.

## File Storage Policy

Convex storage flow:

1. An authenticated mutation generates an upload URL.
2. The client uploads directly to Convex storage.
3. The final onboarding or request mutation receives storage IDs.
4. The mutation validates ownership, count, and storage metadata.
5. A guarded query generates signed download URLs.

Security rules:

- Never expose CNIC URLs in provider search.
- Request photo URLs are available only to the customer and assigned provider.
- Add an internal cleanup process for uploads that were never attached.
- Persist storage IDs only; never persist expiring signed URLs.

## Effect Error Model

Extend the existing Effect tagged errors with domain-specific errors:

```ts
UnauthorizedError
ForbiddenError
UserNotFoundError
RoleRequiredError
RoleAlreadySelectedError
ValidationError
ProviderNotFoundError
ProviderNotApprovedError
ProviderUnavailableError
RequestNotFoundError
InvalidRequestTransitionError
CatalogItemInactiveError
AdminAccessRequiredError
UploadValidationError
```

Frontend errors use stable tags and safe messages. They must not expose Clerk identity details, allowlist contents, CNIC metadata, or the existence of unrelated requests.

## Test Plan

Use `convex-test` with Vitest for backend integration tests.

### Roles and Authorization

- A new user can select customer.
- A new user can select provider.
- A user cannot select admin.
- A user cannot change an already selected role.
- A customer cannot call provider mutations.
- A provider cannot call customer mutations.
- A non-allowlisted user cannot call admin functions.
- An allowlisted admin can review providers.

### Provider Onboarding

- A provider can submit valid onboarding.
- A customer cannot submit provider onboarding.
- An invalid category is rejected.
- An area and city mismatch is rejected.
- Duplicate skills and areas are rejected or normalized.
- Missing CNIC is rejected.
- A provider starts unavailable and pending.
- A pending provider cannot enable availability.
- An approved provider can enable availability.
- A rejected provider is forced unavailable.

### Discovery

- An approved and available provider appears in matching search results.
- A pending provider does not appear.
- A rejected provider does not appear.
- An approved but unavailable provider does not appear.
- A provider does not appear for an unsupported category.
- A provider does not appear for an unsupported area.
- Public provider queries do not leak contact or CNIC data.
- A listing rebuild removes stale category and area combinations.

### Requests

- A customer can create a request for a matching provider.
- A customer cannot request an unavailable provider.
- A provider cannot create a customer request.
- An unassigned provider cannot read or respond to a request.
- The assigned provider can accept a pending request.
- The assigned provider can reject a pending request.
- A customer can cancel only a pending request.
- Either participant can complete an accepted request.
- A pending request cannot be completed.
- A terminal request cannot transition again.
- Contacts are hidden before acceptance.
- Contacts are visible to participants after acceptance.
- Request photos are inaccessible to non-participants.

### Concurrency and Idempotency

- Two provider responses cannot both succeed.
- Cancel racing with accept leaves one valid final state.
- Duplicate onboarding submission does not create duplicate provider profiles.
- Duplicate catalog slugs are rejected.

## Implementation Sequence

1. Update the user and role model.
2. Add catalog tables and seed Lahore, Karachi, Islamabad, their areas, and initial categories.
3. Add provider profiles, skills, coverage, verification documents, and availability.
4. Add environment allowlist admin authorization.
5. Implement provider onboarding and admin verification.
6. Add materialized provider listings and transactional rebuild logic.
7. Implement indexed provider search and public provider profiles.
8. Add requests, attachments, and request event tables.
9. Implement request creation and state transitions.
10. Implement role-aware request detail and contact unlocking.
11. Add upload security and signed URL queries.
12. Add `convex-test` coverage for authorization, discovery, privacy, and request lifecycle transitions.
13. Run `pnpm run convex:gen` after Convex changes.
14. Run `pnpm run lint`.
15. Run `pnpm run typecheck`.
16. Run `pnpm run test:run`.

## Existing Backend Follow-Ups

Address these starter issues before or during backend implementation:

- Replace `v.any()` for Clerk webhook data in `convex/users.ts` with an explicit validator for the fields used by the webhook handler.
- Change Clerk user deletion from physical deletion to soft deletion before requests reference users.
- Correct the Firebase comment in `convex/authed/users.ts`; the application uses Clerk.
- Make user email optional because Facebook identities may not provide one.
- Add role, account status, contact fields, and timestamps to users.
- Do not use API-key-based `convex/private` wrappers for Convex-to-Convex calls; use built-in `internal*` functions.
- Keep new Effect tagged errors small and Convex-serializable because `runEffect` converts them into `ConvexError` data.

## Scope Guardrails

The backend plan intentionally excludes these features from the MVP:

- Online payments
- Ratings and reviews
- In-app chat
- Map or GPS-based matching
- Automatic provider dispatch
- Complex scheduling
- Push notifications
- Admin analytics and charts

The model leaves room to add these later without compromising MVP provider discovery or request history.

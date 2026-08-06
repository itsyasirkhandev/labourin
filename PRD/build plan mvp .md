## **LabourIn PK MVP — Complete Plan (Pages \+ Features \+ Architecture \+ Tech Stack Usage)**

### **What you are building (MVP definition)**

A **mobile-first** platform for **non-technical users in Pakistan** (Lahore, Karachi, Islamabad) where:

> 1. A customer selects **City \+ Area** and a **service category** (electrician, plumber, etc.).

> 2. The customer sees **only providers who are Verified \+ Available Now** in that location and category.

> 3. The customer picks one provider, fills a short **request form** (problem \+ budget \+ address/landmark).

> 4. The provider **Accepts or Rejects**.

> 5. On accept, the app shows **Call \+ WhatsApp** buttons and the job happens **offline**.

> 6. Customer/provider can mark the request **Completed**.

No payments. No ratings/reviews. No optional pages unless clearly marked.

# **1\) Simple Architecture (how it works)**

### **Components**

* **Next.js App Router**: Hosts the web app UI and server routes (including webhooks).

* **React**: Renders UI components and pages.

* **Convex**: Your backend \+ database \+ realtime updates.

* **Clerk**: Google auth \+ Facebook

* **Svix**: Verifies incoming webhook signatures (e.g., from Clerk).

* **Tailwind \+ shadcn/ui \+ Radix**: UI styling \+ accessible components.

* **React Hook Form \+ Zod**: Forms \+ validation (critical for non-technical users).

* **Zustand**: Small client state (selected city/area/category, UI state).

* **Nuqs**: Keeps search filters in the URL (shareable links \+ back button works).

* **Sonner**: Toast notifications (success/error feedback).

* **Effect-TS**: Optional but useful for backend workflows (validation \+ safe business logic composition inside Convex actions/mutations).

* **Vitest \+ convex-test**: Unit \+ backend integration tests.

### **Data flow (plain language)**

* The UI (Next.js/React) calls **Convex queries** to load providers and requests.

* The UI calls **Convex mutations** to create requests, accept/reject, toggle availability.

* Convex pushes updates in realtime to both customer and provider screens.

* Clerk manages who the user is; Convex stores the user’s role/profile and enforces authorization.

# **2\) Tech Stack — what each thing is used for (your list)**

| Tool | Used for (in this MVP) |
| :---- | :---- |
| Next.js (16.2.10) | App Router pages/layouts, server routes (webhooks), hosting the full app |
| React (19.2.7) | UI rendering and interactive components |
| Convex (1.42.1) | Database \+ backend functions (queries/mutations/actions), realtime subscriptions |
| convex-helpers | Helpers for auth patterns, pagination, common Convex utilities |
| effect (Effect-TS) | Clean/typed backend logic (ex: request validation pipelines, error handling) inside Convex functions |
| Clerk (@clerk/nextjs) | Phone OTP auth, sessions, route protection, user identity |
| Tailwind CSS | Styling (fast UI iteration) |
| Radix UI | Accessible primitives (dialogs, dropdowns, tabs) |
| shadcn/ui | Prebuilt component patterns \+ consistent UI |
| next-themes | Theme toggling (can be disabled for MVP; optional) |
| Zustand | Minimal client state (selected city/area/category; optional cache) |
| React Hook Form | Fast form handling for onboarding \+ request form |
| Zod | Runtime validation \+ types (form schema, Convex input validation) |
| Nuqs | URL search params state (category/city/area) for easy navigation |
| Immer | Optional helper for immutable updates (not critical for MVP) |
| Svix | Webhook signature verification (e.g., Clerk webhooks) |
| Recharts | Admin stats charts (not required for bare MVP; keep for later) |
| Sonner | Toasts: “Request sent”, “Accepted”, errors |
| Phosphor/Iconify | Icons (categories, nav) |
| Vitest | Unit tests (shared utils, validation) |
| convex-test | Integration tests for Convex functions |
| Fallow / React Doctor | Code cleanup and performance diagnostics (later, not day-1 critical) |
| pnpm | Dependency/workspace management |

# **3\) Roles & Routing (MVP rules)**

### **Roles**

* customer

* provider

* admin (not selectable publicly; set by allowlist)

### **Role selection**

After phone OTP login, user must choose:

* “I Need a Service” → customer

* “I Provide a Service” → provider

### **Access rules**

* Customer pages only for customer

* Provider pages only for provider

* Admin pages only for admin

* Provider cannot become “Available” unless verificationStatus \= approved

Implementation approach:

* Store role in Convex users table, optionally mirror into Clerk publicMetadata.

* Use **Next.js middleware \+ Clerk** to protect routes.

* Convex functions enforce auth again (server-side enforcement).

# **4\) Pages (MVP) — Complete list with features \+ exactly what each feature does**

## **A) Public / Shared Pages**

### **1\) Landing Page (/)**

Sections (keep it simple and fast):

* **Header (Logo \+ Get Started)** → takes users to login quickly.

* **Hero headline \+ supported cities** → tells users it’s for Lahore/Karachi/Islamabad.

* **Category icons strip** → shows what services exist without reading.

* **How it works (3 steps)** → reduces confusion (Search → Choose → Request).

* **Trust strip (“Verified providers”, “WhatsApp contact”, “No online payment”)** → reduces fear for first-time Pakistani users.

* **Footer (Help/Contact/Terms/Privacy)** → makes platform look legitimate.

### **2\) Login/Signup (/auth/\* via Clerk)**

* **Phone OTP login** → simplest for Pakistani audience; reduces password friction.

### **3\) Role Selection (/select-role)**

* **Two big buttons** → sets role and routes user correctly.

* **Persist role** → user never needs to choose again.

## **B) Customer Pages (minimum required)**

### **4\) Customer Search Home (/customer)**

Features:

* **Category grid (big buttons)** → customer selects electrician/plumber etc. without typing.

* **City dropdown (Lahore/Karachi/Islamabad)** → keeps results locally relevant.

* **Area dropdown (per city)** → supports neighborhood-based matching (simpler than maps).

* **Continue/Search button** → navigates to provider list with filters in URL.

What it does: starts the entire customer journey in 2–3 taps.

### **5\) Provider List / Results (/customer/providers?category=\&city=\&area=)**

Features:

* **List of provider cards** → shows available providers to choose from.

* **Show only: Verified \+ Available Now** → ensures “can come within 1–2 hours” promise.

* **Card fields: name, skills, area, availability badge** → enough info to choose without overload.

* **Empty state** → “No one available right now” \+ encourages changing area/category.

What it does: the core “browse available now” experience.

### **6\) Provider Profile (/customer/providers/\[providerId\])**

Features:

* **Provider details (skills, experience, areas)** → builds confidence without reviews.

* **Verified badge** → trust signal (CNIC verified by admin).

* **Send Request button** → starts request form.

What it does: final decision screen before sending details/budget.

### **7\) Request Form (to selected provider) (/customer/request/new?providerId=...)**

Features:

* **Description field** → customer explains problem in simple words.

* **Photo upload (optional)** → helps provider judge quickly (wiring/leak).

* **Budget field** → provider can accept/reject based on budget immediately.

* **Address \+ landmark** → matches how people give directions in Pakistan.

* **Time needed (ASAP default)** → aligns urgency expectations.

* **Submit** → creates request (status=pending) addressed to that provider.

What it does: converts browsing into a real actionable lead.

### **8\) My Requests (Customer) (/customer/requests)**

Features:

* **List of requests with status** (pending/accepted/rejected/completed/cancelled) → tracking for non-technical users.

* **Tap to open request detail** → continue the workflow.

What it does: gives customers a single place to see “what’s happening”.

### **9\) Request Detail (Customer) (/customer/requests/\[requestId\])**

Features:

* **Shows request summary** → what they asked for and budget/address.

* **Shows provider decision** (accepted/rejected \+ optional note) → clarity.

* **If accepted: Call button** → opens phone dialer.

* **If accepted: WhatsApp button** → opens WhatsApp chat.

* **Cancel (only if pending)** → stops the request cleanly.

* **Mark Completed** → closes the loop after offline service.

What it does: makes acceptance actionable and finishes the lifecycle.

## **C) Provider Pages (minimum required)**

### **10\) Provider Onboarding (/provider/onboarding)**

Features:

* **Name \+ photo (optional)** → basic identity.

* **Skills multi-select** → controls search matching.

* **Experience years** → trust without reviews.

* **City \+ Areas served** → local matching for Lahore/Karachi/Islamabad.

* **CNIC upload** → verification requirement.

* **Submit** → creates provider profile; sets verificationStatus=pending.

What it does: turns a new provider into a reviewable candidate.

### **11\) Pending Verification (/provider/pending)**

Features:

* **Status message (“Under review”)** → explains why they can’t appear in search.

* **Edit profile button** → allows corrections before approval.

What it does: prevents unverified providers from going live.

### **12\) Provider Dashboard (/provider)**

Features:

* **Available Now toggle** → controls whether they appear in customer results.

* **Incoming requests list** (pending first) → provider sees requests immediately.

* **Tap request** → opens request detail.

What it does: provider’s daily operational screen.

### **13\) Provider Request Detail (/provider/requests/\[requestId\])**

Features:

* **Request details** (description, photos, budget, address, time) → decision info.

* **Accept button** → status=accepted; unlock customer contact.

* **Reject button \+ optional reason** → status=rejected; customer sees outcome.

* **After accept: Call \+ WhatsApp** → coordinate offline quickly.

* **Mark Completed** → closes loop post-service.

What it does: converts requests into real-world jobs.

## **D) Admin Pages (absolute minimum required)**

### **14\) Admin Login (/admin/login)**

Features:

* **Admin-only access** (allowlist by phone/email) → prevents unauthorized access.

What it does: secure entry to moderation tools.

### **15\) Provider Verification Queue (/admin/verification)**

Features:

* **List pending providers** → shows what needs review.

* **View provider profile \+ CNIC** → identity check.

* **Approve** → provider verificationStatus=approved (can go live).

* **Reject \+ reason** → verificationStatus=rejected and store reason.

What it does: your trust/safety gate (critical since no ratings/reviews).

# **5\) Convex Backend Plan (what functions you’ll need)**

## **Tables (minimum)**

> 1. users

* clerkId, role, name, phone, createdAt

* Optional: defaultCity, defaultArea

> 2. providers

* userId

* skills\[\]

* experienceYears

* cityAreas\[\] (ex: { city: "Lahore", areas: \["DHA", "Gulberg"\] })

* availableNow boolean

* verificationStatus (pending|approved|rejected)

* cnicFileId

* verificationReason optional

> 3. requests

* customerUserId

* providerUserId

* category

* description

* photoFileIds\[\]

* budget

* city, area

* address, landmark

* neededTime (string or enum, MVP can be “ASAP”)

* status (pending|accepted|rejected|cancelled|completed)

* providerNote optional

* timestamps

## **Queries / Mutations (minimum)**

Customer:

* getProvidersByFilters(category, city, area) (query)

* getProvider(providerId) (query)

* createRequest(input) (mutation)

* listMyRequests() (query)

* getRequest(requestId) (query)

* cancelRequest(requestId) (mutation)

* markRequestCompleted(requestId) (mutation)

Provider:

* getMyProviderProfile() (query)

* submitProviderOnboarding(data) (mutation)

* toggleAvailability(availableNow) (mutation)

* listIncomingRequests() (query)

* respondToRequest(requestId, accept/reject, note?) (mutation)

* markRequestCompleted(requestId) (mutation)

Admin:

* listPendingProviders() (query)

* verifyProvider(providerId, approve/reject, reason?) (mutation)

Authorization rule: every mutation checks the current user role \+ ownership.

# **6\) UI/UX Rules (Pakistan \+ non-technical)**

* Big buttons, minimal typing, clear Urdu-friendly labels (even partial).

* City/area dropdowns instead of maps.

* Landmark field is first-class (people rely on landmarks).

* WhatsApp deep link as the primary follow-up action after accept.

* Every page must have empty/loading states and one obvious next step.

# **7\) Fastest Build Order (bare-minimum, no optional pages)**

> 1. Next.js layouts \+ route groups (/customer, /provider, /admin, /auth)

> 2. Clerk phone OTP login

> 3. Role selection page \+ role stored in Convex

> 4. Convex schema \+ auth rules

> 5. Provider onboarding \+ CNIC upload \+ pending screen

> 6. Admin verification queue (approve/reject)

> 7. Provider dashboard (available toggle \+ incoming list) \+ provider request detail (accept/reject)

> 8. Customer search home (category \+ city/area)

> 9. Customer provider list \+ provider profile

> 10. Customer request form

> 11. Customer my requests \+ request detail (contact unlock \+ cancel \+ complete)

> 12. Minimal testing (convex-test for core flows) \+ deploy
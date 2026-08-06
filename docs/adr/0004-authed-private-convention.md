# ADR 0004: Authed vs Internal function guard convention

**Status**: Accepted (updated 2026-08-06)
**Date**: 2025-01-01

## Context

Convex functions need different security models depending on who calls them.

## Decision

Two guard patterns: the authed guard uses `convex-helpers/server/customFunctions`, the internal guard uses Convex's built-in registration:

### Authed guard (`convex/authed/helpers.ts`)
- For **client-facing** functions
- Validates the Clerk JWT via `ctx.auth.getUserIdentity()`
- Injects `ctx.identity` into the handler as `AuthedContext` Effect Service
- Use: `effectAuthedQuery`, `effectAuthedMutation`, `effectAuthedAction`

### Internal guard (`convex/private/helpers.ts`)
- For **Convex-to-Convex** functions
- Uses Convex's built-in `internalQuery`, `internalMutation`, and `internalAction` registration, so the functions are never part of the public HTTP API
- Use: `effectInternalQuery`, `effectInternalMutation`, `effectInternalAction`

## Rationale

- **Single auth check**: `customCtxAndArgs` defines the identity check once, all three wrappers (query/mutation/action) share it
- **Type safety**: `ctx.identity` is typed and guaranteed non-null inside authed handlers
- **Separation of concerns**: Client-facing vs internal APIs have different security requirements
- **Deep Modules**: The effect wrappers allow us to write unified feature logic directly in the `authed/` and `private/` handlers, avoiding a shallow passthrough to a separate `services/` layer.

## When to use which

| Scenario | Guard |
|----------|-------|
| React hook calls (useQuery, useMutation) | `authed` |
| Server component preloading | `authed` |
| Backend-to-backend calls | `internal` (Convex built-in) |
| Cron jobs | `internal` (Convex built-in) |
| Webhooks | `httpAction` |

## Demo files

- `convex/authed/demo.ts` — Minimal working example of the authed pattern
- `convex/private/demo.ts` — Minimal working example of the internal pattern
- These are **AI-readable convention references**, not dead code

import { internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";

// Explicit contract for the Clerk webhook payload fields this handler uses.
// http.ts extracts these from the full Clerk event before calling the mutation,
// so unknown Clerk fields never reach the validator.
const clerkUserData = v.object({
  id: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  email: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
});

async function findUserByClerkData(
  db: MutationCtx['db'],
  clerkId: string,
  tokenIdentifier: string,
  email?: string
) {
  let existing = await db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!existing) {
    existing = await db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();
  }

  if (!existing && email) {
    existing = await db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  }

  return existing;
}

function computeClerkUserUpdates(
  existing: Doc<"users">,
  data: { email?: string; avatarUrl?: string; phoneNumber?: string },
  name: string,
  clerkId: string,
  tokenIdentifier: string
) {
  const updates: Partial<WithoutSystemFields<Doc<"users">>> = {};
  if (name && existing.name !== name) updates.name = name;
  if (data.email && existing.email !== data.email) updates.email = data.email;
  if (data.avatarUrl && existing.avatarUrl !== data.avatarUrl) updates.avatarUrl = data.avatarUrl;
  if (data.phoneNumber && existing.phoneNumber !== data.phoneNumber) updates.phoneNumber = data.phoneNumber;
  if (clerkId && existing.clerkId !== clerkId) updates.clerkId = clerkId;
  if (tokenIdentifier && existing.tokenIdentifier !== tokenIdentifier) updates.tokenIdentifier = tokenIdentifier;

  if (existing.accountStatus === "deleted") {
    updates.accountStatus = "active";
    updates.deletedAt = undefined;
  }

  return updates;
}

export const upsertFromClerk = internalMutation({
  args: { data: clerkUserData },
  async handler(ctx, { data }) {
    const clerkId = data.id;
    const email = data.email;
    const name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
    const avatarUrl = data.avatarUrl;
    const phoneNumber = data.phoneNumber;

    const domain = process.env.CLERK_FRONTEND_API_URL || process.env.CLERK_JWT_ISSUER_DOMAIN;
    const tokenIdentifier = domain ? `${domain}|${clerkId}` : `clerk|${clerkId}`;

    const existing = await findUserByClerkData(ctx.db, clerkId, tokenIdentifier, email);
    const now = Date.now();

    if (existing) {
      const updates = computeClerkUserUpdates(existing, data, name, clerkId, tokenIdentifier);
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = now;
        await ctx.db.patch(existing._id, updates);
      }
    } else {
      await ctx.db.insert("users", {
        name,
        email,
        avatarUrl,
        phoneNumber,
        clerkId,
        tokenIdentifier,
        accountStatus: "active",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();

    if (existing) {
      // Soft delete: keep the row so requests referencing this user stay intact.
      await ctx.db.patch(existing._id, {
        accountStatus: "deleted",
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

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

    // 1. Check by clerkId
    let existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    // 2. Check by tokenIdentifier
    if (!existing) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();
    }

    // 3. Check by email if present (Facebook accounts may not expose one)
    if (!existing && email) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    }

    const now = Date.now();

    if (existing) {
      const updates: {
        name?: string;
        email?: string;
        avatarUrl?: string;
        phoneNumber?: string;
        clerkId?: string;
        tokenIdentifier?: string;
        accountStatus?: "active" | "deleted";
        deletedAt?: number;
        updatedAt?: number;
      } = {};
      if (name && existing.name !== name) updates.name = name;
      if (email && existing.email !== email) updates.email = email;
      if (avatarUrl && existing.avatarUrl !== avatarUrl) updates.avatarUrl = avatarUrl;
      if (phoneNumber && existing.phoneNumber !== phoneNumber) updates.phoneNumber = phoneNumber;
      if (clerkId && existing.clerkId !== clerkId) updates.clerkId = clerkId;
      if (tokenIdentifier && existing.tokenIdentifier !== tokenIdentifier) updates.tokenIdentifier = tokenIdentifier;

      // Reactivate a soft-deleted account when the user re-registers.
      if (existing.accountStatus === "deleted") {
        updates.accountStatus = "active";
        updates.deletedAt = undefined;
      }

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

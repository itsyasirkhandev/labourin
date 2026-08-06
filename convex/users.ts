import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertFromClerk = internalMutation({
  args: { data: v.any() }, // Using v.any() to accept the Clerk webhook event.data payload
  async handler(ctx, { data }) {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address ?? "";
    const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
    const avatarUrl = data.image_url;

    const domain = process.env.CLERK_FRONTEND_API_URL || process.env.CLERK_JWT_ISSUER_DOMAIN;
    const tokenIdentifier = domain ? `${domain}|${clerkId}` : `clerk|${clerkId}`;

    // 1. Check by clerkId
    let existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    // 2. Check by tokenIdentifier
    if (!existing && tokenIdentifier) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();
    }

    // 3. Check by email if non-empty
    if (!existing && email) {
      existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    }

    if (existing) {
      const updates: Record<string, string | undefined> = {};
      if (name && existing.name !== name) updates.name = name;
      if (email && existing.email !== email) updates.email = email;
      if (avatarUrl && existing.avatarUrl !== avatarUrl) updates.avatarUrl = avatarUrl;
      if (clerkId && existing.clerkId !== clerkId) updates.clerkId = clerkId;
      if (tokenIdentifier && existing.tokenIdentifier !== tokenIdentifier) updates.tokenIdentifier = tokenIdentifier;

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
    } else {
      await ctx.db.insert("users", {
        name,
        email,
        avatarUrl,
        clerkId,
        tokenIdentifier,
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
      await ctx.db.delete(existing._id);
    }
  },
});

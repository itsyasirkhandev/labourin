import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		phoneNumber: v.optional(v.string()),
		tokenIdentifier: v.string(),
		clerkId: v.string(),
		role: v.optional(v.union(v.literal('customer'), v.literal('provider'), v.literal('admin'))),
		accountStatus: v.union(v.literal('active'), v.literal('deleted')),
		deletedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_token', ['tokenIdentifier'])
		.index('by_clerk_id', ['clerkId'])
		.index('by_email', ['email'])
		.index('by_role', ['role']),

	numbers: defineTable({
		value: v.number()
	})
});

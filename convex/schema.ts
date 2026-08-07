import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		phoneNumber: v.optional(v.string()),
		whatsappNumber: v.optional(v.string()),
		tokenIdentifier: v.string(),
		clerkId: v.string(),
		role: v.optional(v.union(v.literal('customer'), v.literal('provider'), v.literal('admin'))),
		// Optional for backwards compatibility with docs created before these
		// fields existed; getOrCreateUser backfills them on the next sign-in.
		accountStatus: v.optional(v.union(v.literal('active'), v.literal('deleted'))),
		deletedAt: v.optional(v.number()),
		createdAt: v.optional(v.number()),
		updatedAt: v.optional(v.number())
	})
		.index('by_token', ['tokenIdentifier'])
		.index('by_clerk_id', ['clerkId'])
		.index('by_email', ['email'])
		.index('by_role', ['role']),

	numbers: defineTable({
		value: v.number()
	}),

	categories: defineTable({
		name: v.string(),
		slug: v.string(),
		isActive: v.boolean()
	}).index('by_slug', ['slug']),

	skills: defineTable({
		categoryId: v.id('categories'),
		name: v.string(),
		isActive: v.boolean()
	}).index('by_category', ['categoryId']),

	cities: defineTable({
		name: v.string(),
		code: v.string(),
		isActive: v.boolean()
	}).index('by_code', ['code']),

	areas: defineTable({
		cityId: v.id('cities'),
		name: v.string(),
		isActive: v.boolean()
	}).index('by_city', ['cityId']),

	providerProfiles: defineTable({
		userId: v.id('users'),
		displayName: v.string(),
		bio: v.string(),
		experienceYears: v.number(),
		primaryCategoryId: v.id('categories'),
		skillIds: v.array(v.id('skills')),
		cityId: v.id('cities'),
		areaIds: v.array(v.id('areas')),
		phoneNumber: v.string(),
		whatsappNumber: v.optional(v.string()),
		cnicNumber: v.string(),
		cnicFrontStorageId: v.id('_storage'),
		cnicBackStorageId: v.id('_storage'),
		verificationStatus: v.union(
			v.literal('pending'),
			v.literal('approved'),
			v.literal('rejected')
		),
		rejectionReason: v.optional(v.string()),
		isAvailable: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_user_id', ['userId'])
		.index('by_verification_status', ['verificationStatus'])
		.index('by_city_and_status', ['cityId', 'verificationStatus'])
		.index('by_city_and_category_and_status', ['cityId', 'primaryCategoryId', 'verificationStatus'])
});

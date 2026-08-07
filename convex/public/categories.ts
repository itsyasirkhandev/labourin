import { v } from 'convex/values';
import { query } from '../_generated/server';

export const listCategories = query({
	args: {
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const onlyActive = args.onlyActive ?? true;
		const categories = await ctx.db.query('categories').collect();
		if (onlyActive) {
			return categories.filter((cat) => cat.isActive);
		}
		return categories;
	}
});

export const listSkills = query({
	args: {
		categoryId: v.optional(v.id('categories')),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const onlyActive = args.onlyActive ?? true;

		let skills;
		if (args.categoryId) {
			skills = await ctx.db
				.query('skills')
				.withIndex('by_category', (q) => q.eq('categoryId', args.categoryId!))
				.collect();
		} else {
			skills = await ctx.db.query('skills').collect();
		}

		if (onlyActive) {
			return skills.filter((skill) => skill.isActive);
		}
		return skills;
	}
});

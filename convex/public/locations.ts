import { v } from 'convex/values';
import { query } from '../_generated/server';

export const listCities = query({
	args: {
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const onlyActive = args.onlyActive ?? true;
		const cities = await ctx.db.query('cities').collect();
		if (onlyActive) {
			return cities.filter((city) => city.isActive);
		}
		return cities;
	}
});

export const listAreas = query({
	args: {
		cityId: v.optional(v.id('cities')),
		onlyActive: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const onlyActive = args.onlyActive ?? true;

		let areas;
		if (args.cityId) {
			areas = await ctx.db
				.query('areas')
				.withIndex('by_city', (q) => q.eq('cityId', args.cityId!))
				.collect();
		} else {
			areas = await ctx.db.query('areas').collect();
		}

		if (onlyActive) {
			return areas.filter((area) => area.isActive);
		}
		return areas;
	}
});

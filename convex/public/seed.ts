import { mutation } from '../_generated/server';

const SEED_CATEGORIES = [
	{
		name: 'Plumbing',
		slug: 'plumbing',
		skills: [
			'Pipe Leak Repair',
			'Fixture & Tap Installation',
			'Drainage Unclogging',
			'Water Heater / Geyser Service'
		]
	},
	{
		name: 'Electrical Work',
		slug: 'electrical',
		skills: [
			'House Wiring & Repair',
			'Appliance Fitting',
			'Circuit Breaker / Switchboard',
			'UPS & Solar Inverter Wiring'
		]
	},
	{
		name: 'Carpentry',
		slug: 'carpentry',
		skills: [
			'Furniture Repair & Polish',
			'Door & Lock Fitting',
			'Custom Cabinetry & Wardrobes'
		]
	},
	{
		name: 'Painting & Renovation',
		slug: 'painting',
		skills: [
			'Interior Wall Painting',
			'Exterior Weather Shield',
			'Roof Waterproofing & Sealing'
		]
	},
	{
		name: 'HVAC & AC Service',
		slug: 'hvac',
		skills: [
			'AC Mounting & Installation',
			'AC Master Chemical Cleaning',
			'Gas Refill & Leak Testing'
		]
	}
];

const SEED_CITIES = [
	{
		name: 'Lahore',
		code: 'LHR',
		areas: [
			'Gulberg I, II, III',
			'DHA Phases 1-8',
			'Johar Town',
			'Model Town',
			'Allama Iqbal Town',
			'Lahore Cantt'
		]
	},
	{
		name: 'Karachi',
		code: 'KHI',
		areas: [
			'Clifton & Bath Island',
			'DHA Phases 1-8',
			'Gulshan-e-Iqbal',
			'P.E.C.H.S',
			'North Nazimabad'
		]
	},
	{
		name: 'Islamabad',
		code: 'ISB',
		areas: [
			'Sectors F-6 & F-7',
			'Sectors F-8, F-10 & F-11',
			'Sectors G-6 to G-11',
			'Sectors I-8 & I-9',
			'DHA Islamabad',
			'Bahria Town Islamabad'
		]
	},
	{
		name: 'Rawalpindi',
		code: 'RWP',
		areas: [
			'Saddar & Cantt',
			'Satellite Town',
			'Bahria Town Phases 1-8',
			'Chaklala Scheme 3'
		]
	}
];

export const seedInitialData = mutation({
	args: {},
	handler: async (ctx) => {
		const existingCategory = await ctx.db.query('categories').first();
		const existingCity = await ctx.db.query('cities').first();

		let categoriesInserted = 0;
		let skillsInserted = 0;
		let citiesInserted = 0;
		let areasInserted = 0;

		if (!existingCategory) {
			for (const cat of SEED_CATEGORIES) {
				const catId = await ctx.db.insert('categories', {
					name: cat.name,
					slug: cat.slug,
					isActive: true
				});
				categoriesInserted++;

				for (const skillName of cat.skills) {
					await ctx.db.insert('skills', {
						categoryId: catId,
						name: skillName,
						isActive: true
					});
					skillsInserted++;
				}
			}
		}

		if (!existingCity) {
			for (const city of SEED_CITIES) {
				const cityId = await ctx.db.insert('cities', {
					name: city.name,
					code: city.code,
					isActive: true
				});
				citiesInserted++;

				for (const areaName of city.areas) {
					await ctx.db.insert('areas', {
						cityId,
						name: areaName,
						isActive: true
					});
					areasInserted++;
				}
			}
		}

		return {
			seeded: categoriesInserted > 0 || citiesInserted > 0,
			categoriesInserted,
			skillsInserted,
			citiesInserted,
			areasInserted
		};
	}
});

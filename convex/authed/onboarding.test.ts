/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("/convex/**/*.ts");

const customerIdentity = {
	subject: "user_customer_123",
	issuer: "https://clerk.labourin.test",
	tokenIdentifier: "https://clerk.labourin.test|user_customer_123",
	name: "Test Customer",
	email: "customer@labourin.test",
};

const providerIdentity = {
	subject: "user_provider_123",
	issuer: "https://clerk.labourin.test",
	tokenIdentifier: "https://clerk.labourin.test|user_provider_123",
	name: "Test Provider",
	email: "provider@labourin.test",
};

async function setupCustomerUser() {
	const t = convexTest(schema, modules);
	const authed = t.withIdentity(customerIdentity);
	const userId = await authed.mutation(api.authed.users.getOrCreateUser);
	await authed.mutation(api.authed.account.selectRole, { role: "customer" });
	return { t, authed, userId };
}

async function setupProviderUser() {
	const t = convexTest(schema, modules);
	const authed = t.withIdentity(providerIdentity);
	const userId = await authed.mutation(api.authed.users.getOrCreateUser);
	await authed.mutation(api.authed.account.selectRole, { role: "provider" });
	return { t, authed, userId };
}

test("completeCustomerContact succeeds for customer and fails for non-customer", async () => {
	const { authed: customerAuthed } = await setupCustomerUser();

	const updatedUser = await customerAuthed.mutation(
		api.authed.contact.completeCustomerContact,
		{
			phoneNumber: "03001234567",
			whatsappNumber: "+923001234567",
		}
	);
	expect(updatedUser.phoneNumber).toBe("03001234567");
	expect(updatedUser.whatsappNumber).toBe("+923001234567");

	const { authed: providerAuthed } = await setupProviderUser();
	await expect(
		providerAuthed.mutation(api.authed.contact.completeCustomerContact, {
			phoneNumber: "03001234567",
		})
	).rejects.toMatchObject({ data: { tag: "RoleRequiredError" } });
});

test("completeCustomerContact validates phone number format", async () => {
	const { authed } = await setupCustomerUser();

	await expect(
		authed.mutation(api.authed.contact.completeCustomerContact, {
			phoneNumber: "12345",
		})
	).rejects.toMatchObject({ data: { tag: "InvalidPhoneFormatError" } });
});

test("generateCnicUploadUrl succeeds for provider and fails for customer", async () => {
	const { authed: providerAuthed } = await setupProviderUser();

	const uploadUrl = await providerAuthed.mutation(
		api.authed.storage.generateCnicUploadUrl,
		{}
	);
	expect(typeof uploadUrl).toBe("string");

	const { authed: customerAuthed } = await setupCustomerUser();
	await expect(
		customerAuthed.mutation(api.authed.storage.generateCnicUploadUrl, {})
	).rejects.toMatchObject({ data: { tag: "RoleRequiredError" } });
});

test("submitProviderOnboarding sets status to pending, forces isAvailable = false, and validates hierarchy", async () => {
	const { t, authed: providerAuthed, userId } = await setupProviderUser();

	const categoryId = await t.run(async (ctx) => {
		return await ctx.db.insert("categories", {
			name: "Plumbing",
			slug: "plumbing",
			isActive: true,
		});
	});

	await t.run(async (ctx) => {
		return await ctx.db.insert("categories", {
			name: "Electrical",
			slug: "electrical",
			isActive: true,
		});
	});

	const skillId = await t.run(async (ctx) => {
		return await ctx.db.insert("skills", {
			categoryId,
			name: "Pipe Repair",
			isActive: true,
		});
	});

	const cityId = await t.run(async (ctx) => {
		return await ctx.db.insert("cities", {
			name: "Lahore",
			code: "LHR",
			isActive: true,
		});
	});

	const otherCityId = await t.run(async (ctx) => {
		return await ctx.db.insert("cities", {
			name: "Karachi",
			code: "KHI",
			isActive: true,
		});
	});

	const areaId = await t.run(async (ctx) => {
		return await ctx.db.insert("areas", {
			cityId,
			name: "Gulberg",
			isActive: true,
		});
	});

	const wrongCityAreaId = await t.run(async (ctx) => {
		return await ctx.db.insert("areas", {
			cityId: otherCityId,
			name: "Clifton",
			isActive: true,
		});
	});

	const cnicFrontStorageId = await t.run(async (ctx) => {
		return await ctx.storage.store(new Blob(["front"]));
	});

	const cnicBackStorageId = await t.run(async (ctx) => {
		return await ctx.storage.store(new Blob(["back"]));
	});

	const statusInitial = await providerAuthed.query(
		api.authed.onboarding.getProviderOnboardingStatus,
		{}
	);
	expect(statusInitial.status).toBe("unonboarded");

	await expect(
		providerAuthed.mutation(api.authed.onboarding.submitProviderOnboarding, {
			displayName: "Ali Khan",
			bio: "Experienced plumber",
			experienceYears: 5,
			primaryCategoryId: categoryId,
			skillIds: [skillId],
			cityId: cityId,
			areaIds: [wrongCityAreaId],
			phoneNumber: "03001234567",
			cnicFrontStorageId,
			cnicBackStorageId,
			cnicNumber: "35202-1234567-1",
		})
	).rejects.toMatchObject({ data: { tag: "InvalidHierarchyError" } });

	const profileId = await providerAuthed.mutation(
		api.authed.onboarding.submitProviderOnboarding,
		{
			displayName: "Ali Khan",
			bio: "Experienced plumber",
			experienceYears: 5,
			primaryCategoryId: categoryId,
			skillIds: [skillId],
			cityId: cityId,
			areaIds: [areaId],
			phoneNumber: "03001234567",
			whatsappNumber: "03001234567",
			cnicFrontStorageId,
			cnicBackStorageId,
			cnicNumber: "35202-1234567-1",
		}
	);
	expect(profileId).toBeDefined();

	const statusAfter = await providerAuthed.query(
		api.authed.onboarding.getProviderOnboardingStatus,
		{}
	);
	expect(statusAfter.status).toBe("pending");
	expect(statusAfter.profile).toBeDefined();
	expect(statusAfter.profile?.displayName).toBe("Ali Khan");
	expect(statusAfter.profile?.isAvailable).toBe(false);
	expect("cnicNumber" in (statusAfter.profile || {})).toBe(false);

	const user = await t.run(async (ctx) => {
		return await ctx.db.get(userId);
	});
	expect(user?.phoneNumber).toBe("03001234567");
	expect(user?.whatsappNumber).toBe("03001234567");
});

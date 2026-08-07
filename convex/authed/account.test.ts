/// <reference types="vite/client" />
// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

// Root-anchored so module keys stay relative to the convex directory
// (/convex/authed/account.ts), which convex-test needs to resolve api paths.
const modules = import.meta.glob("/convex/**/*.ts");

const identity = {
	subject: "user_123",
	issuer: "https://clerk.labourin.test",
	tokenIdentifier: "https://clerk.labourin.test|user_123",
	name: "Test User",
	email: "test@labourin.test",
};

async function setupUser() {
	const t = convexTest(schema, modules);
	const authed = t.withIdentity(identity);
	const userId = await authed.mutation(api.authed.users.getOrCreateUser);
	return { t, authed, userId };
}

test("customer role selection succeeds and currentUser reflects it", async () => {
	const { authed } = await setupUser();

	const viewer = await authed.mutation(api.authed.account.selectRole, {
		role: "customer",
	});
	expect(viewer.role).toBe("customer");

	const current = await authed.query(api.authed.account.currentUser);
	expect(current?.role).toBe("customer");
});

test("provider role selection succeeds", async () => {
	const { authed } = await setupUser();

	const viewer = await authed.mutation(api.authed.account.selectRole, {
		role: "provider",
	});
	expect(viewer.role).toBe("provider");
});

test("admin role selection is rejected", async () => {
	const { authed } = await setupUser();

	await expect(
		authed.mutation(api.authed.account.selectRole, { role: "admin" } as never)
	).rejects.toThrow();
});

test("second role selection is rejected (immutability)", async () => {
	const { authed } = await setupUser();

	await authed.mutation(api.authed.account.selectRole, { role: "customer" });

	await expect(
		authed.mutation(api.authed.account.selectRole, { role: "provider" })
	).rejects.toMatchObject({ data: { tag: "RoleAlreadySelectedError" } });

	const current = await authed.query(api.authed.account.currentUser);
	expect(current?.role).toBe("customer");
});

test("soft-deleted account selection is rejected", async () => {
	const { t, authed, userId } = await setupUser();
	await t.run(async (ctx) => {
		await ctx.db.patch(userId, { accountStatus: "deleted" });
	});

	await expect(
		authed.mutation(api.authed.account.selectRole, { role: "customer" })
	).rejects.toMatchObject({ data: { tag: "DeletedAccountError" } });
});

test("selectRole requires an authenticated viewer", async () => {
	const t = convexTest(schema, modules);

	await expect(
		t.mutation(api.authed.account.selectRole, { role: "customer" })
	).rejects.toMatchObject({ data: { tag: "UnauthorizedError" } });
});

// User management — syncs Clerk auth identity to the Convex users table.
//
// This file shows the pattern for user upsert:
// 1. Look up user by tokenIdentifier (stable across token refreshes)
// 2. Create if missing, update if fields changed
// 3. Return the Convex user document

import { effectAuthedMutation, AuthedContext } from './helpers';
import { Effect } from 'effect';
import { ConvexDBWriter } from '../services/ConvexDB';
import { UserIdentity, WithoutSystemFields } from 'convex/server';
import { Doc } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';
import { UserNotFoundError } from './errors';

function deriveUserName(identity: UserIdentity): string {
	return (
		identity.name ||
		[identity.givenName, identity.familyName].filter(Boolean).join(' ') ||
		identity.nickname ||
		''
	);
}

function findExistingUser(db: MutationCtx['db'], identity: UserIdentity) {
	return Effect.gen(function* () {
		const tokenIdentifier = identity.tokenIdentifier;
		let viewer: Doc<'users'> | null = yield* Effect.tryPromise(() =>
			db
				.query('users')
				.withIndex('by_token', (q) => q.eq('tokenIdentifier', tokenIdentifier))
				.unique()
		);

		if (!viewer && identity.subject) {
			viewer = yield* Effect.tryPromise(() =>
				db
					.query('users')
					.withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
					.unique()
			);
		}

		const userEmail = identity.email;
		if (!viewer && userEmail) {
			viewer = yield* Effect.tryPromise(() =>
				db
					.query('users')
					.withIndex('by_email', (q) => q.eq('email', userEmail))
					.first()
			);
		}

		return viewer;
	});
}

function buildUserUpdates(
	viewer: Doc<'users'>,
	identity: UserIdentity,
	name: string,
	now: number
): Partial<WithoutSystemFields<Doc<'users'>>> {
	const updates: Partial<WithoutSystemFields<Doc<'users'>>> = {};
	const email = identity.email;
	const pictureUrl = identity.pictureUrl;
	const tokenIdentifier = identity.tokenIdentifier;

	if (name && viewer.name !== name) updates.name = name;
	if (email && viewer.email !== email) updates.email = email;
	if (pictureUrl && viewer.avatarUrl !== pictureUrl) updates.avatarUrl = pictureUrl;
	if (identity.subject && viewer.clerkId !== identity.subject) updates.clerkId = identity.subject;
	if (tokenIdentifier && viewer.tokenIdentifier !== tokenIdentifier) updates.tokenIdentifier = tokenIdentifier;

	if (viewer.accountStatus === 'deleted') {
		updates.accountStatus = 'active';
		updates.deletedAt = undefined;
	} else if (viewer.accountStatus === undefined) {
		updates.accountStatus = 'active';
	}

	if (viewer.createdAt === undefined) updates.createdAt = now;
	if (viewer.updatedAt === undefined) updates.updatedAt = now;

	return updates;
}

export const getOrCreateUser = effectAuthedMutation({
	args: {},
	handler: () =>
		Effect.gen(function* () {
			const { identity } = yield* AuthedContext;
			yield* Effect.logInfo(`getOrCreateUser for: ${identity.email || 'unknown'}`);

			const { db } = yield* ConvexDBWriter;
			const name = deriveUserName(identity);
			const email = identity.email;
			const pictureUrl = identity.pictureUrl;
			const tokenIdentifier = identity.tokenIdentifier;
			const now = Date.now();

			let viewer = yield* findExistingUser(db, identity);

			if (viewer) {
				const viewerId = viewer._id;
				const updates = buildUserUpdates(viewer, identity, name, now);

				if (Object.keys(updates).length > 0) {
					updates.updatedAt = now;
					yield* Effect.tryPromise(() => db.patch(viewerId, updates));
					const refreshed = yield* Effect.tryPromise(() => db.get(viewerId));
					if (!refreshed) {
						return yield* new UserNotFoundError({
							message: 'User record disappeared during update.'
						});
					}
					viewer = refreshed;
				}
			} else {
				const userId = yield* Effect.tryPromise(() =>
					db.insert('users', {
						name,
						email,
						avatarUrl: pictureUrl,
						tokenIdentifier,
						clerkId: identity.subject,
						accountStatus: 'active',
						createdAt: now,
						updatedAt: now
					})
				);
				const created = yield* Effect.tryPromise(() => db.get(userId));
				if (!created) {
					return yield* new UserNotFoundError({
						message: 'Failed to retrieve newly created user record.'
					});
				}
				viewer = created;
			}

			return viewer._id;
		})
});


// User management — syncs Clerk auth identity to the Convex users table.
//
// This file shows the pattern for user upsert:
// 1. Look up user by tokenIdentifier (stable across token refreshes)
// 2. Create if missing, update if fields changed
// 3. Return the Convex user document

import { effectAuthedMutation, effectAuthedQuery, AuthedContext } from './helpers';
import { Effect } from 'effect';
import { ConvexDB } from '../services/ConvexDB';
import { GenericDatabaseWriter } from 'convex/server';
import { DataModel } from '../_generated/dataModel';

export const getOrCreateUser = effectAuthedMutation({
	args: {},
	handler: () =>
		Effect.gen(function* () {
			const { identity } = yield* AuthedContext;
			yield* Effect.logInfo(`getOrCreateUser for: ${identity.email || 'unknown'}`);

			const { db } = yield* ConvexDB;
			const writerDb = db as GenericDatabaseWriter<DataModel>;
			const tokenIdentifier = identity.tokenIdentifier;

			let viewer = yield* Effect.tryPromise(() =>
				writerDb
					.query('users')
					.withIndex('by_token', (q) => q.eq('tokenIdentifier', tokenIdentifier))
					.unique()
			);

			if (!viewer && identity.subject) {
				viewer = yield* Effect.tryPromise(() =>
					writerDb
						.query('users')
						.withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
						.unique()
				);
			}

			const userEmail = identity.email;
			if (!viewer && userEmail) {
				viewer = yield* Effect.tryPromise(() =>
					writerDb
						.query('users')
						.withIndex('by_email', (q) => q.eq('email', userEmail))
						.first()
				);
			}

			const name =
				identity.name ||
				[identity.givenName, identity.familyName].filter(Boolean).join(' ') ||
				identity.nickname ||
				'';
			// Facebook identities may not expose an email, so it stays optional.
			const email = identity.email;
			const pictureUrl = identity.pictureUrl;

			const now = Date.now();

			if (viewer) {
				const updates: {
					name?: string;
					email?: string;
					avatarUrl?: string;
					clerkId?: string;
					tokenIdentifier?: string;
					accountStatus?: 'active' | 'deleted';
					deletedAt?: number;
					updatedAt?: number;
				} = {};
				if (name && viewer.name !== name) {
					updates.name = name;
				}
				if (email && viewer.email !== email) {
					updates.email = email;
				}
				if (pictureUrl && viewer.avatarUrl !== pictureUrl) {
					updates.avatarUrl = pictureUrl;
				}
				if (identity.subject && viewer.clerkId !== identity.subject) {
					updates.clerkId = identity.subject;
				}
				if (tokenIdentifier && viewer.tokenIdentifier !== tokenIdentifier) {
					updates.tokenIdentifier = tokenIdentifier;
				}

				// Reactivate a soft-deleted account when the user signs back in.
				if (viewer.accountStatus === 'deleted') {
					updates.accountStatus = 'active';
					updates.deletedAt = undefined;
				}

				if (Object.keys(updates).length > 0) {
					updates.updatedAt = now;
					yield* Effect.tryPromise(() => writerDb.patch(viewer!._id, updates));
					viewer = (yield* Effect.tryPromise(() => writerDb.get(viewer!._id)))!;
				}
			} else {
				const userId = yield* Effect.tryPromise(() =>
					writerDb.insert('users', {
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
				viewer = (yield* Effect.tryPromise(() => writerDb.get(userId)))!;
			}

			return viewer._id;
		})
});

export const currentUser = effectAuthedQuery({
	args: {},
	handler: () =>
		Effect.gen(function* () {
			const { viewer } = yield* AuthedContext;
			return viewer;
		})
});

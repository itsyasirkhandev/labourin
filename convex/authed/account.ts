// Account management — role selection onboarding.
//
// selectRole is the single entry point for a user to declare their public
// role (customer or provider). The role is immutable once set and the admin
// role can never be assigned from the client: the args validator only accepts
// customer/provider, so a modified client payload cannot escalate.

import { v } from 'convex/values';
import { effectAuthedMutation, effectAuthedQuery, AuthedContext } from './helpers';
import { Effect } from 'effect';
import { ConvexDBWriter } from '../services/ConvexDB';
import { DeletedAccountError, RoleAlreadySelectedError, UserNotFoundError } from './errors';

export const currentUser = effectAuthedQuery({
	args: {},
	handler: () =>
		Effect.gen(function* () {
			const { viewer } = yield* AuthedContext;
			return viewer;
		})
});

export const selectRole = effectAuthedMutation({
	args: {
		role: v.union(v.literal('customer'), v.literal('provider'))
	},
	handler: ({ role }) =>
		Effect.gen(function* () {
			const { viewer } = yield* AuthedContext;
			if (!viewer) {
				return yield* new UserNotFoundError({
					message: 'Account record not found yet. Please try again in a moment.'
				});
			}
			if (viewer.accountStatus === 'deleted') {
				return yield* new DeletedAccountError({
					message: 'This account has been deleted and cannot use application workflows.'
				});
			}
			if (viewer.role) {
				return yield* new RoleAlreadySelectedError({
					message: 'A role has already been selected for this account.'
				});
			}

			const { db } = yield* ConvexDBWriter;
			yield* Effect.tryPromise(() =>
				db.patch(viewer._id, { role, updatedAt: Date.now() })
			);
			const updatedViewer = yield* Effect.tryPromise(() => db.get(viewer._id));
			if (!updatedViewer) {
				return yield* new UserNotFoundError({
					message: 'Account record disappeared while assigning role.'
				});
			}

			return updatedViewer;
		})
});

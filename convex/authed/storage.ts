import { effectAuthedMutation, AuthedContext } from './helpers';
import { Effect } from 'effect';
import { ConvexStorageWriter } from '../services/ConvexDB';
import {
	DeletedAccountError,
	RoleRequiredError,
	UserNotFoundError
} from './errors';

export const generateCnicUploadUrl = effectAuthedMutation({
	args: {},
	handler: () =>
		Effect.gen(function* () {
			const { viewer } = yield* AuthedContext;

			if (!viewer) {
				return yield* new UserNotFoundError({
					message: 'Account record not found.'
				});
			}

			if (viewer.accountStatus === 'deleted') {
				return yield* new DeletedAccountError({
					message: 'This account has been deleted.'
				});
			}

			if (viewer.role !== 'provider') {
				return yield* new RoleRequiredError({
					message: 'Only provider accounts can generate CNIC upload URLs.'
				});
			}

			const { storage } = yield* ConvexStorageWriter;

			const uploadUrl = yield* Effect.tryPromise(() => storage.generateUploadUrl());

			return uploadUrl;
		})
});

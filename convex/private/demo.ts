// Private convention reference — AI-readable demonstration of the Convex-to-Convex pattern.
//
// Pattern: effectInternalQuery with Effect.gen + Effect.tryPromise for all async work.
// Internal functions are registered with internal* and callable only from other Convex
// functions. See docs/adr/0003-effect-ts-convex.md and docs/adr/0004-authed-private-convention.md.

import { v } from 'convex/values';
import { effectInternalQuery } from './helpers';
import { Effect, Schema } from 'effect';

// Domain error for internal routes using Effect v4 TaggedErrorClass
export class PrivateDemoError extends Schema.TaggedErrorClass<PrivateDemoError>()("PrivateDemoError", {
	message: Schema.String
}) {}

export const privateDemoQuery = effectInternalQuery({
	args: {
		username: v.string()
	},
	handler: (args) =>
		Effect.gen(function* () {
			const { username } = args;

			// 1. Structured logging with Effect
			yield* Effect.logInfo(`Internal Convex-to-Convex route accessed for: ${username}`);

			// 2. Typed domain error
			if (username === 'admin') {
				return yield* new PrivateDemoError({ message: "Admin access requires elevated privileges" });
			}

			// 3. For db calls, use Effect.tryPromise
			// const { db } = yield* ConvexDB;
			// yield* Effect.tryPromise(() => db.query('table').order('desc').take(10));

			return { username };
		}).pipe(
			Effect.catchTag("PrivateDemoError", (error) =>
				Effect.succeed({ error: error.message, username: null })
			)
		)
});

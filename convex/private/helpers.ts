// "private" queries/mutations/actions are ones that get called from other Convex
// functions, never from the client. They use Convex's built-in internal functions
// (internalQuery/internalMutation/internalAction), which are not exposed over HTTP.

import { internalQuery, internalMutation, internalAction } from '../_generated/server';
import { ObjectType, PropertyValidators } from 'convex/values';
import { Effect } from 'effect';
import { ConvexDB } from '../services/ConvexDB';
import { runEffect } from "../effectHelpers";

export const effectInternalQuery = <Args extends PropertyValidators, R, E>(options: {
	args: Args;
	handler: (args: ObjectType<Args>) => Effect.Effect<R, E, ConvexDB>;
}) => {
	return internalQuery({
		args: options.args,
		handler: async (ctx, ...args) => {
			const [argsObj] = args as [ObjectType<Args>];
			return runEffect(
				options.handler(argsObj).pipe(
					Effect.provideService(ConvexDB, { db: ctx.db })
				)
			) as Promise<R>;
		}
	});
};

export const effectInternalMutation = <Args extends PropertyValidators, R, E>(options: {
	args: Args;
	handler: (args: ObjectType<Args>) => Effect.Effect<R, E, ConvexDB>;
}) => {
	return internalMutation({
		args: options.args,
		handler: async (ctx, ...args) => {
			const [argsObj] = args as [ObjectType<Args>];
			return runEffect(
				options.handler(argsObj).pipe(
					Effect.provideService(ConvexDB, { db: ctx.db })
				)
			) as Promise<R>;
		}
	});
};

export const effectInternalAction = <Args extends PropertyValidators, R, E>(options: {
	args: Args;
	handler: (args: ObjectType<Args>) => Effect.Effect<R, E, never>;
}) => {
	return internalAction({
		args: options.args,
		handler: async (ctx, ...args) => {
			const [argsObj] = args as [ObjectType<Args>];
			return runEffect(
				options.handler(argsObj)
			) as Promise<R>;
		}
	});
};

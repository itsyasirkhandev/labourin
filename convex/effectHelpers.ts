import { Effect } from "effect";
import { ConvexError } from "convex/values";

type SerializableErrorData = Record<string, string | number | boolean | null>;

// Tagged errors are deliberately small: only primitive top-level fields are
// kept so the ConvexError data stays small and Convex-serializable. Any nested
// or non-primitive fields are dropped rather than coerced.
function toSerializableErrorData(error: Record<string, unknown>): SerializableErrorData {
	const data: SerializableErrorData = {};
	for (const [key, value] of Object.entries(error)) {
		if (key === "_tag") {
			continue;
		}
		if (
			value === null ||
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			data[key] = value;
		}
	}
	return data;
}

export async function runEffect<Result, Error>(
	effect: Effect.Effect<Result, Error, never>
): Promise<Result> {
	try {
		return await Effect.runPromise(effect);
	} catch (error) {
		if (error && typeof error === 'object' && '_tag' in error) {
			const taggedError = error as { _tag: string; [key: string]: unknown };
			throw new ConvexError({
				tag: taggedError._tag,
				data: toSerializableErrorData(taggedError)
			});
		}
		throw error;
	}
}

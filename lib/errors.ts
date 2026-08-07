import { ConvexError } from 'convex/values';

/**
 * Extracts a human-readable error message from an unknown error (ConvexError, Error, or string fallback).
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred."
): string {
  if (error instanceof ConvexError && error.data && typeof error.data === "object") {
    const data = error.data as { message?: unknown; data?: { message?: unknown } };
    if (typeof data.message === "string") return data.message;
    if (typeof data.data?.message === "string") return data.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallbackMessage;
}


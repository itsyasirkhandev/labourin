/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authed_account from "../authed/account.js";
import type * as authed_contact from "../authed/contact.js";
import type * as authed_demo from "../authed/demo.js";
import type * as authed_errors from "../authed/errors.js";
import type * as authed_helpers from "../authed/helpers.js";
import type * as authed_numbers from "../authed/numbers.js";
import type * as authed_onboarding from "../authed/onboarding.js";
import type * as authed_storage from "../authed/storage.js";
import type * as authed_users from "../authed/users.js";
import type * as effectHelpers from "../effectHelpers.js";
import type * as http from "../http.js";
import type * as private_demo from "../private/demo.js";
import type * as private_helpers from "../private/helpers.js";
import type * as public_categories from "../public/categories.js";
import type * as public_locations from "../public/locations.js";
import type * as public_numbers from "../public/numbers.js";
import type * as public_seed from "../public/seed.js";
import type * as services_ConvexDB from "../services/ConvexDB.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "authed/account": typeof authed_account;
  "authed/contact": typeof authed_contact;
  "authed/demo": typeof authed_demo;
  "authed/errors": typeof authed_errors;
  "authed/helpers": typeof authed_helpers;
  "authed/numbers": typeof authed_numbers;
  "authed/onboarding": typeof authed_onboarding;
  "authed/storage": typeof authed_storage;
  "authed/users": typeof authed_users;
  effectHelpers: typeof effectHelpers;
  http: typeof http;
  "private/demo": typeof private_demo;
  "private/helpers": typeof private_helpers;
  "public/categories": typeof public_categories;
  "public/locations": typeof public_locations;
  "public/numbers": typeof public_numbers;
  "public/seed": typeof public_seed;
  "services/ConvexDB": typeof services_ConvexDB;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

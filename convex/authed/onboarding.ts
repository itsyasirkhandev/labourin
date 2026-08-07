import { v } from 'convex/values';
import { effectAuthedMutation, effectAuthedQuery, AuthedContext } from './helpers';
import { Effect } from 'effect';
import { ConvexDB, ConvexDBWriter } from '../services/ConvexDB';
import {
	DeletedAccountError,
	InvalidCnicFormatError,
	InvalidHierarchyError,
	InvalidPhoneFormatError,
	RoleRequiredError,
	UserNotFoundError
} from './errors';
import { isValidPakistaniPhone } from './contact';

export function isValidPakistaniCnic(cnic: string): boolean {
	const regex = /^(\d{13}|\d{5}-\d{7}-\d{1})$/;
	return regex.test(cnic);
}

export const getProviderOnboardingStatus = effectAuthedQuery({
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

			const { db } = yield* ConvexDB;

			const existingProfile = yield* Effect.tryPromise(() =>
				db
					.query('providerProfiles')
					.withIndex('by_user_id', (q) => q.eq('userId', viewer._id))
					.unique()
			);

			if (!existingProfile) {
				return { status: 'unonboarded' as const };
			}

			return {
				status: existingProfile.verificationStatus,
				profile: {
					_id: existingProfile._id,
					userId: existingProfile.userId,
					displayName: existingProfile.displayName,
					bio: existingProfile.bio,
					experienceYears: existingProfile.experienceYears,
					primaryCategoryId: existingProfile.primaryCategoryId,
					skillIds: existingProfile.skillIds,
					cityId: existingProfile.cityId,
					areaIds: existingProfile.areaIds,
					phoneNumber: existingProfile.phoneNumber,
					whatsappNumber: existingProfile.whatsappNumber,
					verificationStatus: existingProfile.verificationStatus,
					rejectionReason: existingProfile.rejectionReason,
					isAvailable: existingProfile.isAvailable,
					createdAt: existingProfile.createdAt,
					updatedAt: existingProfile.updatedAt
				}
			};
		})
});

export const submitProviderOnboarding = effectAuthedMutation({
	args: {
		displayName: v.string(),
		bio: v.string(),
		experienceYears: v.number(),
		primaryCategoryId: v.id('categories'),
		skillIds: v.array(v.id('skills')),
		cityId: v.id('cities'),
		areaIds: v.array(v.id('areas')),
		phoneNumber: v.string(),
		whatsappNumber: v.optional(v.string()),
		cnicFrontStorageId: v.id('_storage'),
		cnicBackStorageId: v.id('_storage'),
		cnicNumber: v.string()
	},
	handler: (args) =>
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
					message: 'Only provider accounts can submit provider onboarding.'
				});
			}

			if (!isValidPakistaniPhone(args.phoneNumber)) {
				return yield* new InvalidPhoneFormatError({
					message: 'Invalid phone number format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX).',
					phoneNumber: args.phoneNumber
				});
			}

			if (args.whatsappNumber && !isValidPakistaniPhone(args.whatsappNumber)) {
				return yield* new InvalidPhoneFormatError({
					message: 'Invalid WhatsApp number format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX).',
					phoneNumber: args.whatsappNumber
				});
			}

			if (!isValidPakistaniCnic(args.cnicNumber)) {
				return yield* new InvalidCnicFormatError({
					message: 'Invalid CNIC format. Must be 13 digits (e.g. 12345-1234567-1 or 1234512345671).',
					cnicNumber: args.cnicNumber
				});
			}

			const { db } = yield* ConvexDBWriter;

			for (const areaId of args.areaIds) {
				const areaDoc = yield* Effect.tryPromise(() => db.get(areaId));
				if (areaDoc && areaDoc.cityId !== args.cityId) {
					return yield* new InvalidHierarchyError({
						message: `Area "${areaDoc.name}" does not belong to the selected city.`
					});
				}
			}

			for (const skillId of args.skillIds) {
				const skillDoc = yield* Effect.tryPromise(() => db.get(skillId));
				if (skillDoc && skillDoc.categoryId !== args.primaryCategoryId) {
					return yield* new InvalidHierarchyError({
						message: `Skill "${skillDoc.name}" does not belong to the primary category.`
					});
				}
			}

			const now = Date.now();

			const existingProfile = yield* Effect.tryPromise(() =>
				db
					.query('providerProfiles')
					.withIndex('by_user_id', (q) => q.eq('userId', viewer._id))
					.unique()
			);

			let profileId;

			if (existingProfile) {
				profileId = existingProfile._id;
				yield* Effect.tryPromise(() =>
					db.patch(existingProfile._id, {
						displayName: args.displayName,
						bio: args.bio,
						experienceYears: args.experienceYears,
						primaryCategoryId: args.primaryCategoryId,
						skillIds: args.skillIds,
						cityId: args.cityId,
						areaIds: args.areaIds,
						phoneNumber: args.phoneNumber,
						whatsappNumber: args.whatsappNumber,
						cnicNumber: args.cnicNumber,
						cnicFrontStorageId: args.cnicFrontStorageId,
						cnicBackStorageId: args.cnicBackStorageId,
						verificationStatus: 'pending',
						rejectionReason: undefined,
						isAvailable: false,
						updatedAt: now
					})
				);
			} else {
				profileId = yield* Effect.tryPromise(() =>
					db.insert('providerProfiles', {
						userId: viewer._id,
						displayName: args.displayName,
						bio: args.bio,
						experienceYears: args.experienceYears,
						primaryCategoryId: args.primaryCategoryId,
						skillIds: args.skillIds,
						cityId: args.cityId,
						areaIds: args.areaIds,
						phoneNumber: args.phoneNumber,
						whatsappNumber: args.whatsappNumber,
						cnicNumber: args.cnicNumber,
						cnicFrontStorageId: args.cnicFrontStorageId,
						cnicBackStorageId: args.cnicBackStorageId,
						verificationStatus: 'pending',
						isAvailable: false,
						createdAt: now,
						updatedAt: now
					})
				);
			}

			yield* Effect.tryPromise(() =>
				db.patch(viewer._id, {
					phoneNumber: args.phoneNumber,
					...(args.whatsappNumber !== undefined ? { whatsappNumber: args.whatsappNumber } : {}),
					updatedAt: now
				})
			);

			return profileId;
		})
});

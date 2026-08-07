import { v } from 'convex/values';
import { effectAuthedMutation, AuthedContext } from './helpers';
import { Effect } from 'effect';
import { ConvexDBWriter } from '../services/ConvexDB';
import {
	DeletedAccountError,
	InvalidPhoneFormatError,
	RoleRequiredError,
	UserNotFoundError
} from './errors';

export function isValidPakistaniPhone(phone: string): boolean {
	const regex = /^(?:\+923\d{9}|03\d{9})$/;
	return regex.test(phone);
}

export const completeCustomerContact = effectAuthedMutation({
	args: {
		phoneNumber: v.string(),
		whatsappNumber: v.optional(v.string())
	},
	handler: ({ phoneNumber, whatsappNumber }) =>
		Effect.gen(function* () {
			const { viewer } = yield* AuthedContext;

			if (!viewer) {
				return yield* new UserNotFoundError({
					message: 'Account record not found yet.'
				});
			}

			if (viewer.accountStatus === 'deleted') {
				return yield* new DeletedAccountError({
					message: 'This account has been deleted and cannot use application workflows.'
				});
			}

			if (viewer.role !== 'customer') {
				return yield* new RoleRequiredError({
					message: 'Only customer accounts can complete customer contact details.'
				});
			}

			if (!isValidPakistaniPhone(phoneNumber)) {
				return yield* new InvalidPhoneFormatError({
					message: 'Invalid phone number format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX).',
					phoneNumber
				});
			}

			if (whatsappNumber && !isValidPakistaniPhone(whatsappNumber)) {
				return yield* new InvalidPhoneFormatError({
					message: 'Invalid WhatsApp number format. Must be a valid Pakistani mobile number (e.g. 03XXXXXXXXX or +923XXXXXXXXX).',
					phoneNumber: whatsappNumber
				});
			}

			const { db } = yield* ConvexDBWriter;

			yield* Effect.tryPromise(() =>
				db.patch(viewer._id, {
					phoneNumber,
					...(whatsappNumber !== undefined ? { whatsappNumber } : {}),
					updatedAt: Date.now()
				})
			);

			const updatedViewer = yield* Effect.tryPromise(() => db.get(viewer._id));
			if (!updatedViewer) {
				return yield* new UserNotFoundError({
					message: 'Account record disappeared while updating contact info.'
				});
			}

			return updatedViewer;
		})
});

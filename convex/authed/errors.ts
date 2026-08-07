import { Schema } from 'effect';

export class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()("UnauthorizedError", {
	message: Schema.String
}) {}

export class UserNotFoundError extends Schema.TaggedErrorClass<UserNotFoundError>()("UserNotFoundError", {
	message: Schema.String,
	userId: Schema.optional(Schema.String)
}) {}

export class ValidationError extends Schema.TaggedErrorClass<ValidationError>()("ValidationError", {
	message: Schema.String,
	field: Schema.optional(Schema.String)
}) {}

export class RoleRequiredError extends Schema.TaggedErrorClass<RoleRequiredError>()("RoleRequiredError", {
	message: Schema.String
}) {}

export class RoleAlreadySelectedError extends Schema.TaggedErrorClass<RoleAlreadySelectedError>()("RoleAlreadySelectedError", {
	message: Schema.String
}) {}

export class DeletedAccountError extends Schema.TaggedErrorClass<DeletedAccountError>()("DeletedAccountError", {
	message: Schema.String
}) {}

export class InvalidPhoneFormatError extends Schema.TaggedErrorClass<InvalidPhoneFormatError>()("InvalidPhoneFormatError", {
	message: Schema.String,
	phoneNumber: Schema.optional(Schema.String)
}) {}

export class InvalidCnicFormatError extends Schema.TaggedErrorClass<InvalidCnicFormatError>()("InvalidCnicFormatError", {
	message: Schema.String,
	cnicNumber: Schema.optional(Schema.String)
}) {}

export class InvalidHierarchyError extends Schema.TaggedErrorClass<InvalidHierarchyError>()("InvalidHierarchyError", {
	message: Schema.String
}) {}

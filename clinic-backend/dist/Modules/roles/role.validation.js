"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleValidation = exports.assignRoleToUserValidation = exports.createRoleValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createRoleValidation = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        "string.min": "roleName must be at least 2 characters long.",
        "string.max": "roleName must be at most 50 characters long.",
        "any.required": "roleName is required.",
    }),
});
exports.assignRoleToUserValidation = joi_1.default.object({
    userId: joi_1.default.string().required().messages({ "any.required": "UserId is required.", }),
    roleId: joi_1.default.string().required().messages({ "any.required": "RoleId is required.", }),
});
exports.updateRoleValidation = joi_1.default.object({
    id: joi_1.default.string().required(),
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        "string.min": "roleName must be at least 2 characters long.",
        "string.max": "roleName must be at most 50 characters long.",
        "any.required": "roleName is required.",
    }),
});

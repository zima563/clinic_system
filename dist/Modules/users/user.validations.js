"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoleToUserValidation = exports.createRoleValidation = exports.loginValidation = exports.UpdateUser = exports.addUser = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addUser = joi_1.default.object({
    userName: joi_1.default.string()
        .min(3)
        .max(50)
        .required()
        .messages({
        "string.min": "Username must be at least 3 characters long.",
        "string.max": "Username must be at most 50 characters long.",
        "any.required": "Username is required.",
    }),
    email: joi_1.default.string()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .required()
        .messages({
        "string.pattern.base": "Invalid email format.",
        "any.required": "Email is required.",
    }),
    password: joi_1.default.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/)
        .required()
        .messages({
        "string.pattern.base": "Password must be at least 8 characters long, including uppercase, lowercase, a number, and a special character.",
        "any.required": "Password is required.",
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .required()
        .messages({
        "string.pattern.base": "Invalid email format.",
        "any.required": "Phone is required. "
    })
});
exports.UpdateUser = joi_1.default.object({
    id: joi_1.default.string().required(),
    userName: joi_1.default.string()
        .min(3)
        .max(50)
        .messages({
        "string.min": "Username must be at least 3 characters long.",
        "string.max": "Username must be at most 50 characters long."
    }),
    email: joi_1.default.string()
        .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .messages({
        "string.pattern.base": "Invalid email format.",
    }),
    password: joi_1.default.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/)
        .messages({
        "string.pattern.base": "Password must be at least 8 characters long, including uppercase, lowercase, a number, and a special character.",
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .messages({
        "string.pattern.base": "Invalid email format.",
    })
});
exports.loginValidation = joi_1.default.object({
    emailOrPhone: joi_1.default.string()
        .required()
        .messages({
        "string.empty": "Email or Phone is required",
        "any.required": "Email or Phone is required",
    }),
    password: joi_1.default.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/)
        .required()
        .messages({
        "string.pattern.base": "Password must be at least 8 characters long, including uppercase, lowercase, a number, and a special character.",
        "any.required": "Password is required.",
    }),
});
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

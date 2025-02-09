"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDoctorValidationSchema = exports.addDoctorValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addDoctorValidationSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must be less than or equal to 100 characters",
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[0-9]{7,15}$/)
        .required()
        .messages({
        "string.pattern.base": "Phone must be a valid number with 7 to 15 digits",
        "string.empty": "Phone is required",
    }),
    icon: joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string()
            .valid("image/png", "image/jpg", "image/jpeg")
            .required(),
        size: joi_1.default.number().required(),
        buffer: joi_1.default.any(),
    }),
    specialtyId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "Specialty ID must be a number",
        "number.integer": "Specialty ID must be an integer",
        "number.positive": "Specialty ID must be a positive number",
        "any.required": "Specialty ID is required",
    }),
    info: joi_1.default.string().max(1000).optional().messages({
        "string.base": "Info must be a string.",
        "string.max": "Info must not exceed 1000 characters.",
    }),
});
exports.UpdateDoctorValidationSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    name: joi_1.default.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must be less than or equal to 100 characters",
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[0-9]{7,15}$/)
        .required()
        .messages({
        "string.pattern.base": "Phone must be a valid number with 7 to 15 digits",
        "string.empty": "Phone is required",
    }),
    icon: joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string()
            .valid("image/png", "image/jpg", "image/jpeg")
            .required(),
        size: joi_1.default.number().required(),
        buffer: joi_1.default.any(),
    }),
    specialtyId: joi_1.default.number().integer().positive().messages({
        "number.base": "Specialty ID must be a number",
        "number.integer": "Specialty ID must be an integer",
        "number.positive": "Specialty ID must be a positive number",
    }),
    info: joi_1.default.string().max(1000).optional().messages({
        "string.base": "Info must be a string.",
        "string.max": "Info must not exceed 1000 characters.",
    }),
});

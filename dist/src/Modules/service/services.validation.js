"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceValidation = exports.addServiceValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addServiceValidation = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).required().messages({
        "string.base": "Title must be a string.",
        "string.min": "Title must be at least 3 characters long.",
        "string.max": "Title cannot exceed 100 characters.",
        "any.required": "Title is required.",
    }),
    desc: joi_1.default.string().min(10).max(1000).required().messages({
        "string.base": "Description must be a string.",
        "string.min": "Description must be at least 10 characters long.",
        "string.max": "Description cannot exceed 1000 characters.",
        "any.required": "Description is required.",
    }),
    status: joi_1.default.boolean().optional().default(true).messages({
        "boolean.base": "Status must be true or false.",
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
});
exports.updateServiceValidation = joi_1.default.object({
    id: joi_1.default.string().required(),
    title: joi_1.default.string().min(3).max(100).messages({
        "string.base": "Title must be a string.",
        "string.min": "Title must be at least 3 characters long.",
        "string.max": "Title cannot exceed 100 characters.",
    }),
    desc: joi_1.default.string().min(10).max(1000).messages({
        "string.base": "Description must be a string.",
        "string.min": "Description must be at least 10 characters long.",
        "string.max": "Description cannot exceed 1000 characters.",
    }),
    status: joi_1.default.boolean().optional().default(true).messages({
        "boolean.base": "Status must be true or false.",
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
});
//# sourceMappingURL=services.validation.js.map
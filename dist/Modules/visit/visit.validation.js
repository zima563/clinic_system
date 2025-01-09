"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendVisitSchema = exports.createVisitSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createVisitSchema = joi_1.default.object({
    patientId: joi_1.default.number().integer().required().messages({
        "any.required": "patientId is required",
        "number.base": "patientId must be a number",
        "number.integer": "patientId must be an integer",
    }),
    visitDetails: joi_1.default.array()
        .items(joi_1.default.object({
        scheduleId: joi_1.default.number().integer().required().messages({
            "any.required": "scheduleId is required",
            "number.base": "scheduleId must be a number",
            "number.integer": "scheduleId must be an integer",
        }),
        dateId: joi_1.default.number().integer().positive().required().messages({
            "number.base": "The date ID must be a number.",
            "number.integer": "The date ID must be an integer.",
            "number.positive": "The date ID must be a positive number.",
            "any.required": "The date ID is required.",
        }),
    }))
        .min(1)
        .required()
        .messages({
        "any.required": "visitDetails are required",
        "array.min": "visitDetails must have at least one entry",
    }),
    paymentMethod: joi_1.default.string()
        .valid("Cash", "Visa", "instaPay", "Wallet", "payPal", "CreditCard")
        .required()
        .messages({
        "any.required": "paymentMethod is required",
        "any.only": "paymentMethod must be one of: Cash, Visa, instaPay, Wallet, payPal, CreditCard",
    }),
    appointmentId: joi_1.default.number().integer().optional().messages({
        "number.base": "scheduleId must be a number",
        "number.integer": "scheduleId must be an integer",
    }),
});
exports.appendVisitSchema = joi_1.default.object({
    visitId: joi_1.default.number().integer().required().messages({
        "any.required": "patientId is required",
        "number.base": "patientId must be a number",
        "number.integer": "patientId must be an integer",
    }),
    patientId: joi_1.default.number().integer().required().messages({
        "any.required": "patientId is required",
        "number.base": "patientId must be a number",
        "number.integer": "patientId must be an integer",
    }),
    visitDetails: joi_1.default.array()
        .items(joi_1.default.object({
        scheduleId: joi_1.default.number().integer().required().messages({
            "any.required": "scheduleId is required",
            "number.base": "scheduleId must be a number",
            "number.integer": "scheduleId must be an integer",
        }),
        dateId: joi_1.default.number().integer().positive().required().messages({
            "number.base": "The date ID must be a number.",
            "number.integer": "The date ID must be an integer.",
            "number.positive": "The date ID must be a positive number.",
            "any.required": "The date ID is required.",
        }),
    }))
        .min(1)
        .required()
        .messages({
        "any.required": "visitDetails are required",
        "array.min": "visitDetails must have at least one entry",
    }),
});

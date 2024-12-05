"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceDetailValidation = exports.addInvoiceDetailValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addInvoiceDetailValidation = joi_1.default.object({
    description: joi_1.default.string().min(1).max(255).required().messages({
        "string.base": "Description must be a string.",
        "string.empty": "Description cannot be empty.",
        "string.min": "Description must be at least 1 character long.",
        "string.max": "Description must not exceed 255 characters.",
        "any.required": "Description is required.",
    }),
    amount: joi_1.default.number().precision(2).positive().required().messages({
        "any.required": "Amount is required.",
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be a positive value.",
        "number.precision": "Amount can have up to 2 decimal places.",
    }),
});
exports.updateInvoiceDetailValidation = joi_1.default.object({
    id: joi_1.default.string().required(),
    description: joi_1.default.string().min(1).max(255).required().messages({
        "string.base": "Description must be a string.",
        "string.empty": "Description cannot be empty.",
        "string.min": "Description must be at least 1 character long.",
        "string.max": "Description must not exceed 255 characters.",
    }),
    amount: joi_1.default.number().precision(2).positive().required().messages({
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be a positive value.",
        "number.precision": "Amount can have up to 2 decimal places.",
    }),
});

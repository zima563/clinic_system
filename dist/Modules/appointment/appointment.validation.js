"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAppointmentValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addAppointmentValidationSchema = joi_1.default.object({
    patientId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "The patient ID must be a number.",
        "number.integer": "The patient ID must be an integer.",
        "number.positive": "The patient ID must be a positive number.",
        "any.required": "The patient ID is required.",
    }),
    dateId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "The schedule ID must be a number.",
        "number.integer": "The schedule ID must be an integer.",
        "number.positive": "The schedule ID must be a positive number.",
        "any.required": "The schedule ID is required.",
    }),
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentSchema = exports.updateAppointmentStatusSchema = exports.addAppointmentValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addAppointmentValidationSchema = joi_1.default.object({
    date: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
        "string.pattern.base": `"date" must be in the format YYYY-MM-DD`,
        "any.required": "Date is required.",
    }),
    patientId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "The patient ID must be a number.",
        "number.integer": "The patient ID must be an integer.",
        "number.positive": "The patient ID must be a positive number.",
        "any.required": "The patient ID is required.",
    }),
    scheduleId: joi_1.default.number().integer().positive().required().messages({
        "number.base": "The schedule ID must be a number.",
        "number.integer": "The schedule ID must be an integer.",
        "number.positive": "The schedule ID must be a positive number.",
        "any.required": "The schedule ID is required.",
    }),
});
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["pending"] = "pending";
    AppointmentStatus["confirmed"] = "confirmed";
    AppointmentStatus["canceled"] = "canceled";
})(AppointmentStatus || (AppointmentStatus = {}));
exports.updateAppointmentStatusSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    status: joi_1.default.string()
        .valid(AppointmentStatus.pending, AppointmentStatus.confirmed, AppointmentStatus.canceled)
        .required(),
});
exports.updateAppointmentSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    date: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .messages({
        "string.pattern.base": `"date" must be in the format YYYY-MM-DD`,
        "any.required": "Date is required.",
    }),
    patientId: joi_1.default.number().integer().positive().messages({
        "number.base": "The patient ID must be a number.",
        "number.integer": "The patient ID must be an integer.",
        "number.positive": "The patient ID must be a positive number.",
    }),
    scheduleId: joi_1.default.number().integer().positive().messages({
        "number.base": "The schedule ID must be a number.",
        "number.integer": "The schedule ID must be an integer.",
        "number.positive": "The schedule ID must be a positive number.",
    }),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.addscheduleSchema = void 0;
const Joi = require("joi");
exports.addscheduleSchema = Joi.object({
    doctorId: Joi.number().integer().positive().required().messages({
        "number.base": "Doctor ID must be a number.",
        "number.integer": "Doctor ID must be an integer.",
        "number.positive": "Doctor ID must be a positive number.",
        "any.required": "Doctor ID is required.",
    }),
    servicesId: Joi.number().integer().positive().required().messages({
        "number.base": "Service ID must be a number.",
        "number.integer": "Service ID must be an integer.",
        "number.positive": "Service ID must be a positive number.",
        "any.required": "Service ID is required.",
    }),
    price: Joi.number().positive().required().messages({
        "number.base": "Price must be a number.",
        "number.positive": "Price must be a positive number.",
        "any.required": "Price is required.",
    }),
    date: Joi.string().isoDate().required().messages({
        "string.base": "Date must be a string.",
        "string.isoDate": "Date must be in ISO 8601 format.",
        "any.required": "Date is required.",
    }),
    fromTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .required()
        .messages({
        "string.base": "From time must be a string.",
        "string.pattern.base": "From time must be in HH:mm:ss format.",
        "any.required": "From time is required.",
    }),
    toTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .required()
        .messages({
        "string.base": "To time must be a string.",
        "string.pattern.base": "To time must be in HH:mm:ss format.",
        "any.required": "To time is required.",
    }),
});
exports.updateScheduleSchema = Joi.object({
    id: Joi.string().required(),
    doctorId: Joi.number().integer().positive().messages({
        "number.base": "Doctor ID must be a number.",
        "number.integer": "Doctor ID must be an integer.",
        "number.positive": "Doctor ID must be a positive number.",
    }),
    servicesId: Joi.number().integer().positive().messages({
        "number.base": "Service ID must be a number.",
        "number.integer": "Service ID must be an integer.",
        "number.positive": "Service ID must be a positive number.",
    }),
    price: Joi.number().positive().messages({
        "number.base": "Price must be a number.",
        "number.positive": "Price must be a positive number.",
    }),
    date: Joi.string().isoDate().messages({
        "string.base": "Date must be a string.",
        "string.isoDate": "Date must be in ISO 8601 format.",
    }),
    fromTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .messages({
        "string.base": "From time must be a string.",
        "string.pattern.base": "From time must be in HH:mm:ss format.",
    }),
    toTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
        .messages({
        "string.base": "To time must be a string.",
        "string.pattern.base": "To time must be in HH:mm:ss format.",
    }),
});

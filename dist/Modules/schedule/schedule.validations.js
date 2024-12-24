"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.addscheduleSchema = void 0;
const Joi = require("joi");
exports.addscheduleSchema = Joi.object({
    doctorId: Joi.number().integer().positive().required().messages({
        "number.base": "Doctor ID must be a number.",
        "number.positive": "Doctor ID must be a positive number.",
        "any.required": "Doctor ID is required.",
    }),
    servicesId: Joi.number().integer().positive().required().messages({
        "number.base": "Service ID must be a number.",
        "number.positive": "Service ID must be a positive number.",
        "any.required": "Service ID is required.",
    }),
    price: Joi.number().positive().required().messages({
        "number.base": "Price must be a number.",
        "number.positive": "Price must be a positive number.",
        "any.required": "Price is required.",
    }),
    dates: Joi.array()
        .items(Joi.object({
        day: Joi.string()
            .valid("mon", "tue", "wed", "thu", "fri", "sat", "sun")
            .required()
            .messages({
            "any.only": "Day must be one of 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'.",
            "any.required": "Day is required.",
        }),
        fromTime: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
            "string.pattern.base": "From time must be in HH:mm format.",
            "any.required": "From time is required.",
        }),
        toTime: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
            "string.pattern.base": "To time must be in HH:mm format.",
            "any.required": "To time is required.",
        }),
    }))
        .min(1)
        .required()
        .messages({
        "array.base": "Dates must be an array.",
        "array.min": "At least one date object is required.",
        "any.required": "Dates field is required.",
    }),
});
exports.updateScheduleSchema = Joi.object({
    id: Joi.string().required(),
    doctorId: Joi.number().integer().positive().messages({
        "number.base": "Doctor ID must be a number.",
        "number.positive": "Doctor ID must be a positive number.",
        "any.required": "Doctor ID is required.",
    }),
    servicesId: Joi.number().integer().positive().messages({
        "number.base": "Service ID must be a number.",
        "number.positive": "Service ID must be a positive number.",
        "any.required": "Service ID is required.",
    }),
    price: Joi.number().positive().messages({
        "number.base": "Price must be a number.",
        "number.positive": "Price must be a positive number.",
        "any.required": "Price is required.",
    }),
    dates: Joi.array()
        .items(Joi.object({
        day: Joi.string()
            .valid("mon", "tue", "wed", "thu", "fri", "sat", "sun")
            .required()
            .messages({
            "any.only": "Day must be one of 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'.",
            "any.required": "Day is required.",
        }),
        fromTime: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
            "string.pattern.base": "From time must be in HH:mm format.",
            "any.required": "From time is required.",
        }),
        toTime: Joi.string()
            .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .required()
            .messages({
            "string.pattern.base": "To time must be in HH:mm format.",
            "any.required": "To time is required.",
        }),
    }))
        .min(1)
        .messages({
        "array.base": "Dates must be an array.",
        "array.min": "At least one date object is required.",
        "any.required": "Dates field is required.",
    }),
});

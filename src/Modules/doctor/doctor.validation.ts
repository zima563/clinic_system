import Joi from "joi";

export const addDoctorValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be less than or equal to 100 characters",
  }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a valid number with 7 to 15 digits",
      "string.empty": "Phone is required",
    }),
  icon: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid("image/png", "image/jpg", "image/jpeg")
      .required(),
    size: Joi.number().required(),
    buffer: Joi.any(),
  }).required(),
  specialtyId: Joi.number().integer().positive().required().messages({
    "number.base": "Specialty ID must be a number",
    "number.integer": "Specialty ID must be an integer",
    "number.positive": "Specialty ID must be a positive number",
    "any.required": "Specialty ID is required",
  }),
  info: Joi.string().max(1000).optional().messages({
    "string.base": "Info must be a string.",
    "string.max": "Info must not exceed 1000 characters.",
  }),
});

export const UpdateDoctorValidationSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must be less than or equal to 100 characters",
  }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a valid number with 7 to 15 digits",
      "string.empty": "Phone is required",
    }),
  icon: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid("image/png", "image/jpg", "image/jpeg")
      .required(),
    size: Joi.number().required(),
    buffer: Joi.any(),
  }),
  specialtyId: Joi.number().integer().positive().messages({
    "number.base": "Specialty ID must be a number",
    "number.integer": "Specialty ID must be an integer",
    "number.positive": "Specialty ID must be a positive number",
  }),
  info: Joi.string().max(1000).optional().messages({
    "string.base": "Info must be a string.",
    "string.max": "Info must not exceed 1000 characters.",
  }),
});

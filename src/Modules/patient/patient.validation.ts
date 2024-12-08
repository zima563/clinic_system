import Joi from "joi";

export const addPatientSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.base": "Name must be a string.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 255 characters.",
    "any.required": "Name is required.",
  }),

  phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.base": "Phone number must be a string.",
      "string.pattern.base": "Phone number must be a valid format.",
      "any.required": "Phone number is required.",
    }),

  birthdate: Joi.date().less("now").required().messages({
    "date.base": "Birthdate must be a valid date.",
    "date.less": "Birthdate must be a date in the past.",
    "any.required": "Birthdate is required.",
  }),

  gender: Joi.string().valid("male", "female").required().messages({
    "string.base": "Gender must be a string.",
    "string.valid": "Gender must be either 'male' or 'female'.",
    "any.required": "Gender is required.",
  }),

  medicalHistory: Joi.string().max(1000).optional().messages({
    "string.base": "Medical history must be a string.",
    "string.max": "Medical history must not exceed 1000 characters.",
  }),

  info: Joi.string().max(1000).optional().messages({
    "string.base": "Info must be a string.",
    "string.max": "Info must not exceed 1000 characters.",
  }),
});

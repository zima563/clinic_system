import Joi from "joi";

export const addAppointmentValidationSchema = Joi.object({
  patientId: Joi.number().integer().positive().required().messages({
    "number.base": "The patient ID must be a number.",
    "number.integer": "The patient ID must be an integer.",
    "number.positive": "The patient ID must be a positive number.",
    "any.required": "The patient ID is required.",
  }),
  dateId: Joi.number().integer().positive().required().messages({
    "number.base": "The schedule ID must be a number.",
    "number.integer": "The schedule ID must be an integer.",
    "number.positive": "The schedule ID must be a positive number.",
    "any.required": "The schedule ID is required.",
  }),
});

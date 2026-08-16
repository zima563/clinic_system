import Joi from "joi";

export const addAppointmentValidationSchema = Joi.object({
  dateTime: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": `"date" must be in the format YYYY-MM-DD`,
      "any.required": "Date is required.",
    }),
  patientId: Joi.number().integer().positive().required().messages({
    "number.base": "The patient ID must be a number.",
    "number.integer": "The patient ID must be an integer.",
    "number.positive": "The patient ID must be a positive number.",
    "any.required": "The patient ID is required.",
  }),
  scheduleId: Joi.number().integer().positive().required().messages({
    "number.base": "The schedule ID must be a number.",
    "number.integer": "The schedule ID must be an integer.",
    "number.positive": "The schedule ID must be a positive number.",
    "any.required": "The schedule ID is required.",
  }),
  dateId: Joi.number().integer().positive().required().messages({
    "number.base": "The date ID must be a number.",
    "number.integer": "The date ID must be an integer.",
    "number.positive": "The date ID must be a positive number.",
    "any.required": "The date ID is required.",
  }),
});

enum AppointmentStatus {
  pending = "pending",
  confirmed = "confirmed",
  canceled = "canceled",
}

export const updateAppointmentStatusSchema = Joi.object({
  id: Joi.string().required(),
  status: Joi.string()
    .valid(
      AppointmentStatus.pending,
      AppointmentStatus.confirmed,
      AppointmentStatus.canceled
    )
    .required(),
});

export const updateAppointmentSchema = Joi.object({
  id: Joi.string().required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.pattern.base": `"date" must be in the format YYYY-MM-DD`,
      "any.required": "Date is required.",
    }),
  patientId: Joi.number().integer().positive().messages({
    "number.base": "The patient ID must be a number.",
    "number.integer": "The patient ID must be an integer.",
    "number.positive": "The patient ID must be a positive number.",
  }),
  scheduleId: Joi.number().integer().positive().messages({
    "number.base": "The schedule ID must be a number.",
    "number.integer": "The schedule ID must be an integer.",
    "number.positive": "The schedule ID must be a positive number.",
  }),
});

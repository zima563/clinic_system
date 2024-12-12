import Joi from "joi";

export const addAppointmentValidationSchema = Joi.object({
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

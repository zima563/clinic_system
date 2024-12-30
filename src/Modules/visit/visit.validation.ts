import Joi from "joi";

export const createVisitSchema = Joi.object({
  patientId: Joi.number().integer().required().messages({
    "any.required": "patientId is required",
    "number.base": "patientId must be a number",
    "number.integer": "patientId must be an integer",
  }),
  visitDetails: Joi.array()
    .items(
      Joi.object({
        scheduleId: Joi.number().integer().required().messages({
          "any.required": "scheduleId is required",
          "number.base": "scheduleId must be a number",
          "number.integer": "scheduleId must be an integer",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "visitDetails are required",
      "array.min": "visitDetails must have at least one entry",
    }),
  paymentMethod: Joi.string()
    .valid("Cash", "Visa", "instaPay", "Wallet", "payPal", "CreditCard")
    .required()
    .messages({
      "any.required": "paymentMethod is required",
      "any.only":
        "paymentMethod must be one of: Cash, Visa, instaPay, Wallet, payPal, CreditCard",
    }),
  appointmentId: Joi.number().integer().optional().messages({
    "number.base": "scheduleId must be a number",
    "number.integer": "scheduleId must be an integer",
  }),
});

export const appendVisitSchema = Joi.object({
  visitId: Joi.number().integer().required().messages({
    "any.required": "patientId is required",
    "number.base": "patientId must be a number",
    "number.integer": "patientId must be an integer",
  }),
  patientId: Joi.number().integer().required().messages({
    "any.required": "patientId is required",
    "number.base": "patientId must be a number",
    "number.integer": "patientId must be an integer",
  }),
  visitDetails: Joi.array()
    .items(
      Joi.object({
        scheduleId: Joi.number().integer().required().messages({
          "any.required": "scheduleId is required",
          "number.base": "scheduleId must be a number",
          "number.integer": "scheduleId must be an integer",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "visitDetails are required",
      "array.min": "visitDetails must have at least one entry",
    }),
});

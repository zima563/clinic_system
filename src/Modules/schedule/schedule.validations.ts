const Joi = require("joi");

export const addscheduleSchema = Joi.object({
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

  dates: Joi.array()
    .items(
      Joi.object({
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
      }).custom((value: any, helpers: any) => {
        const fromTime = new Date(`1970-01-01T${value.fromTime}Z`);
        const toTime = new Date(`1970-01-01T${value.toTime}Z`);

        if (fromTime >= toTime) {
          return helpers.error(
            "any.custom",
            "From time must be earlier than to time."
          );
        }

        return value;
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Dates must be an array.",
      "array.min": "At least one date-time range is required.",
      "any.required": "Dates field is required.",
    }),
});

export const updateScheduleSchema = Joi.object({
  id: Joi.string().required(),
  doctorId: Joi.number().integer().positive().messages({
    "number.base": "Doctor ID must be a number.",
    "number.integer": "Doctor ID must be an integer.",
    "number.positive": "Doctor ID must be a positive number.",
    "any.required": "Doctor ID is required.",
  }),

  servicesId: Joi.number().integer().positive().messages({
    "number.base": "Service ID must be a number.",
    "number.integer": "Service ID must be an integer.",
    "number.positive": "Service ID must be a positive number.",
    "any.required": "Service ID is required.",
  }),

  price: Joi.number().positive().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
    "any.required": "Price is required.",
  }),

  dates: Joi.array()
    .items(
      Joi.object({
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
      }).custom((value: any, helpers: any) => {
        const fromTime = new Date(`1970-01-01T${value.fromTime}Z`);
        const toTime = new Date(`1970-01-01T${value.toTime}Z`);

        if (fromTime >= toTime) {
          return helpers.error(
            "any.custom",
            "From time must be earlier than to time."
          );
        }

        return value;
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Dates must be an array.",
      "array.min": "At least one date-time range is required.",
      "any.required": "Dates field is required.",
    }),
});

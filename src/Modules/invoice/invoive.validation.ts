import Joi from "joi";

const addInvoiceDetailValidation = Joi.object({
  description: Joi.string().min(1).max(255).required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description cannot be empty.",
    "string.min": "Description must be at least 1 character long.",
    "string.max": "Description must not exceed 255 characters.",
    "any.required": "Description is required.",
  }),

  amount: Joi.number().precision(2).positive().required().messages({
    "any.required": "Amount is required.",
    "number.base": "Amount must be a number.",
    "number.positive": "Amount must be a positive value.",
    "number.precision": "Amount can have up to 2 decimal places.",
  }),
});

export default addInvoiceDetailValidation;

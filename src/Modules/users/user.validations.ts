import Joi from "joi";

export const addUser = Joi.object({
  userName: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must be at most 50 characters long.",
      "any.required": "Username is required.",
    }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid email format.",
      "any.required": "Email is required.",
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, including uppercase, lowercase, a number, and a special character.",
      "any.required": "Password is required.",
    }),
  phone: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base" : "Invalid email format.",
        "any.required": "Phone is required. "
      })
});

export const UpdateUser = Joi.object({
  id: Joi.string().required(),
  userName: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.min": "Username must be at least 3 characters long.",
      "string.max": "Username must be at most 50 characters long."
    }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, including uppercase, lowercase, a number, and a special character.",
    }),
  phone: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .messages({
        "string.pattern.base" : "Invalid email format.",
      })
});

export const loginValidation = Joi.object({
  emailOrPhone: Joi.string()
      .required()
      .messages({
          "string.empty": "Email or Phone is required",
          "any.required": "Email or Phone is required",
      }),
      password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long, including uppercase, lowercase, a number, and a special character.",
        "any.required": "Password is required.",
      }),
});


import Joi from "joi";

export const addUser = Joi.object({
  userName: Joi.string().min(3).max(50).required().messages({
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
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long.",
      "any.required": "Password is required.",
    }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone format.",
      "any.required": "Phone is required. ",
    }),
  roleId: Joi.number().integer().positive().optional().messages({
    "number.base": "Role ID must be a number.",
    "number.positive": "Role ID must be a positive number.",
  }),
});

export const UpdateUser = Joi.object({
  id: Joi.string().required(),
  userName: Joi.string().min(3).max(50).messages({
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must be at most 50 characters long.",
  }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),
});

export const changePassword = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required.",
  }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "New password must be at least 6 characters long.",
      "any.required": "New password is required.",
    }),
  repassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Re-entered password must match the new password.",
    "any.required": "Repassword is required.",
  }),
});

export const UpdateUserProfile = Joi.object({
  userName: Joi.string().min(3).max(50).messages({
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must be at most 50 characters long.",
  }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),
});

export const loginValidation = Joi.object({
  emailOrPhone: Joi.string().required().messages({
    "string.empty": "Email or Phone is required",
    "any.required": "Email or Phone is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});

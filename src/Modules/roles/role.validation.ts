import Joi from "joi"


export const createRoleValidation = Joi.object({
    name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.min": "roleName must be at least 2 characters long.",
      "string.max": "roleName must be at most 50 characters long.",
      "any.required": "roleName is required.",
    }),
  })
  
  export const assignRoleToUserValidation = Joi.object({
    userId: Joi.string().required().messages({"any.required": "UserId is required.",}),
    roleId: Joi.string().required().messages({"any.required": "RoleId is required.",}),
  })
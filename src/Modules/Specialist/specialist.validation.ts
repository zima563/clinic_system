import Joi from "joi";

export const specialtySchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title is required",
    "string.base": "Title must be a string",
  }),

  icon: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string()
      .valid("image/png", "image/jpg", "image/jpeg")
      .required(),
    size: Joi.number().required(),
    buffer: Joi.any(),
  }).required(),
});

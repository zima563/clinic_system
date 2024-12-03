import Joi from "joi";

export const AddCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().max(1000).required(),
  image: Joi.string().required(),
  parentId: Joi.number().optional(), // Optional field, could be nullable
});

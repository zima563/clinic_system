import Joi from "joi";


export const addServiceValidation = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Title must be a string.',
      'string.min': 'Title must be at least 3 characters long.',
      'string.max': 'Title cannot exceed 100 characters.',
      'any.required': 'Title is required.',
    }),
  
  desc: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.base': 'Description must be a string.',
      'string.min': 'Description must be at least 10 characters long.',
      'string.max': 'Description cannot exceed 1000 characters.',
      'any.required': 'Description is required.',
    }),

  status: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Status must be true or false.',
    }),
});

export const updateServiceValidation = Joi.object({
    id: Joi.string().required(),
    title: Joi.string()
      .min(3)
      .max(100)
      .messages({
        'string.base': 'Title must be a string.',
        'string.min': 'Title must be at least 3 characters long.',
        'string.max': 'Title cannot exceed 100 characters.'
      }),
    
    desc: Joi.string()
      .min(10)
      .max(1000)
      .messages({
        'string.base': 'Description must be a string.',
        'string.min': 'Description must be at least 10 characters long.',
        'string.max': 'Description cannot exceed 1000 characters.'
      }),
  
    status: Joi.boolean()
      .optional()
      .default(true)
      .messages({
        'boolean.base': 'Status must be true or false.',
      }),
  });
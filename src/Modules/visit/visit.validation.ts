import Joi from "joi";

export const createVisitSchema = Joi.object({
  visitDetails: Joi.array()
    .items(
      Joi.object({
        patientId: Joi.number().integer().required(),
        status: Joi.boolean().required(),
        price: Joi.number().precision(2).positive().required(),
        scheduleId: Joi.number().integer().required(),
      })
    )
    .min(1)
    .required(),
});

export const appendVisitSchema = Joi.object({
  visitId: Joi.string().required(),
  visitDetails: Joi.array()
    .items(
      Joi.object({
        patientId: Joi.number().integer().required(),
        status: Joi.boolean().required(),
        price: Joi.number().precision(2).positive().required(),
        scheduleId: Joi.number().integer().required(),
      })
    )
    .min(1)
    .required(),
});

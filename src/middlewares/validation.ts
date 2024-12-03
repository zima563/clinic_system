import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { ObjectSchema } from "joi";
import ApiError from "../utils/ApiError";

export function createValidationMiddleware(schema: ObjectSchema) {
  @Middleware({ type: "before" })
  class ValidationMiddleware implements ExpressMiddlewareInterface {
    use(request: any, response: any, next: (err?: any) => void): void {

      // Combine request data (body, params, query)
      let filter = {};

      if (request.file) {
        filter = { image: request.file, ...request.params, ...request.body, ...request.query };
      } else if (request.files) {
        filter = { ...request.files, ...request.params, ...request.body, ...request.query };
      } else {
        filter = { ...request.params, ...request.body, ...request.query };
      }

      const { error } = schema.validate(filter, { abortEarly: false });

      if (error) {
        const errMsg = error.details.map((detail) => detail.message).join(", ");
        return next(new ApiError(errMsg, 400));
      }

      next();
    }
  }

  return ValidationMiddleware;
}

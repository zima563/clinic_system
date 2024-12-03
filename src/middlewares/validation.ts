import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { ObjectSchema } from "joi";
import ApiError from "../utils/ApiError";

export function createValidationMiddleware(schema: ObjectSchema) {
  @Middleware({ type: "before" })
  class ValidationMiddleware implements ExpressMiddlewareInterface {
    use(request: any, response: any, next: (err?: any) => void): void {
      const { error } = schema.validate(request.body, { abortEarly: false });

      if (error) {
        const errMsg = error.details.map((detail) => detail.message).join(", ");
        return next(new ApiError(errMsg, 400));
      }

      next();
    }
  }

  return ValidationMiddleware;
}

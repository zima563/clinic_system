import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Request, Response, NextFunction } from "express";

@Middleware({ type: "after" }) // This runs after all other middlewares and controllers
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction) {
    const statusCode = error.httpCode || 500;

    // Send JSON response
    return response.status(statusCode).json({
      status: "error",
      message: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined, // Include stack only in development mode
    });
  }
}

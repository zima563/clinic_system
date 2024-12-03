import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Middleware({ type: "before" }) // Runs before the controllers
export class CheckEmailMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required",
        });
      }

      // Check if the email already exists in the database
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        return res.status(409).json({
          status: "error",
          message: "Email already exists",
        });
      }

      // If email does not exist, proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error("Error checking email:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
}

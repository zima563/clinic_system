import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../utils/ApiError";

const prisma = new PrismaClient();

@Middleware({ type: "before" }) // Runs before the controllers
export class checkScheduleMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleId } = req.body;

      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new ApiError("schedule not found with this scheduleId");
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
}

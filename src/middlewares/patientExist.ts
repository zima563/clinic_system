import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../utils/ApiError";

const prisma = new PrismaClient();

@Middleware({ type: "before" }) // Runs before the controllers
export class checkPatientMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.body;

      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new ApiError("patient not found with this patientId");
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

import {
  Body,
  JsonController,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addAppointmentValidationSchema } from "./appointment.validation";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

@JsonController("/api/appointment")
export class appointmentController {
  @Post("/")
  @UseBefore(createValidationMiddleware(addAppointmentValidationSchema))
  async addAppointment(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    let appointment = await prisma.appointment.create({
      data: body,
    });
    return res.status(200).json(appointment);
  }
}

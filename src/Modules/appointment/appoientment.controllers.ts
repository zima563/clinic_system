import {
  Body,
  Get,
  JsonController,
  Post,
  QueryParam,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addAppointmentValidationSchema } from "./appointment.validation";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
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
    // let date = await prisma.scheduleDate.findFirst({
    //    where:{ dateId: body.dateId }
    // })
    // const scheduleDate: number = date?.id || undefined,
    // let appointment = await prisma.appointment.create({
    //   data: {
    //     patientId: body.patientId,
    //     scheduleDateId: date?.id,
    //   },
    // });
    // return res.status(200).json(appointment);
  }

  @Get("/")
  async getAppointment(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("patientId") patientId?: number
  ) {
    if (!patientId) {
      throw new ApiError("patientId must exist", 401);
    }
    // let appointments = await prisma.appointment.findMany({
    //   where: { patientId },
    //   include: {
    //     schedule: {
    //       include: {
    //         dates: true,
    //       },
    //     },
    //   },
    // });
    // return res.status(200).json({
    //   data: appointments,
    //   count: appointments.length,
    // });
  }
}

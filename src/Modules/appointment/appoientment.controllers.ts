import {
  Body,
  Get,
  JsonController,
  Param,
  Patch,
  Post,
  QueryParam,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addAppointmentValidationSchema,
  updateAppointmentStatusSchema,
} from "./appointment.validation";
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
    let appointment = await prisma.appointment.create({
      data: body,
    });
    return res.status(200).json(appointment);
  }

  @Get("/patient")
  async getPatientAppointment(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("patientId") patientId?: number
  ) {
    if (!patientId) {
      throw new ApiError("patientId must exist", 401);
    }
    let appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        schedule: true,
        patient: true,
      },
    });
    return res.status(200).json({
      data: appointments,
      count: appointments.length,
    });
  }

  @Get("/")
  async getAppointment(@Req() req: Request, @Res() res: Response) {
    const today = new Date();

    const normalizedDate = today.toISOString().split("T")[0];

    let appointments = await prisma.appointment.findMany({
      where: {
        schedule: {
          date: `${normalizedDate}T00:00:00.000Z`,
        },
      },
      include: {
        schedule: true,
        patient: true,
      },
    });
    return res.status(200).json({
      data: appointments,
      count: appointments.length,
    });
  }

  @Get("/:id")
  async showAppointmnetDetail(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
      include: {
        schedule: true,
        patient: true,
      },
    });
    if (!appointment) {
      throw new ApiError("appointment not found", 404);
    }
    return res.status(200).json(appointment);
  }

  @Patch("/:id")
  @UseBefore(createValidationMiddleware(updateAppointmentStatusSchema))
  async updateStatus(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (!(await prisma.appointment.findUnique({ where: { id } }))) {
      throw new ApiError("appointment not found", 404);
    }
    await prisma.appointment.update({
      where: { id },
      data: {
        status: body.status,
      },
    });
    return res
      .status(200)
      .json({ message: `appointment updated successfully to ${body.status}` });
  }
}

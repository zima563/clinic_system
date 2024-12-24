import {
  Body,
  Get,
  JsonController,
  Param,
  Patch,
  Post,
  Put,
  QueryParam,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addAppointmentValidationSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.validation";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
const prisma = new PrismaClient();

@JsonController("/api/appointment")
export class appointmentController {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("addAppointment"),
    createValidationMiddleware(addAppointmentValidationSchema)
  )
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
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("getPatientAppointment")
  )
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
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("getAppointment")
  )
  async getAppointment(@Req() req: Request, @Res() res: Response) {
    const today = new Date();

    const normalizedDate = today.toISOString().split("T")[0];

    let appointments = await prisma.appointment.findMany({
      where: {
        date: `${normalizedDate}T00:00:00.000Z`,
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
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("showAppointmnetDetail")
  )
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
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateStatus"),
    createValidationMiddleware(updateAppointmentStatusSchema)
  )
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

  @Put("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateAppointment"),
    createValidationMiddleware(updateAppointmentSchema)
  )
  async updateAppointment(
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
      data: body,
    });
    return res
      .status(200)
      .json({ message: `appointment updated successfully` });
  }
}

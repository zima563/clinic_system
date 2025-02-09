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
import ApiError from "../../utils/ApiError";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import {
  validateAppoientment,
  validatePatient,
  validateSchedule,
} from "./validators";
import * as appointmentService from "./appoientment.service";

@JsonController("/api/appointment")
export class appointmentController {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addAppointment"),
    createValidationMiddleware(addAppointmentValidationSchema)
  )
  async addAppointment(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    await validatePatient(body.patientId);
    await validateSchedule(body.scheduleId);
    let appointment = await appointmentService.createAppointment({
      ...body,
      dateTime: new Date(body.dateTime).toISOString(),
      createdBy: req.user?.id,
    });
    return res.status(200).json(appointment);
  }

  @Get("/patient")
  @UseBefore(...secureRouteWithPermissions("getPatientAppointment"))
  async getPatientAppointment(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("patientId") patientId?: number
  ) {
    if (!patientId) throw new ApiError("patientId must exist", 401);

    let appointments = await appointmentService.getAllAppoientmentPatient(
      patientId
    );
    return res.status(200).json({
      data: appointments,
      count: appointments.length,
    });
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("getAppointment"))
  async getAppointment(@Req() req: Request, @Res() res: Response) {
    let appointments = await appointmentService.getAppointments(req.query);
    appointments.result.map((app: any) => {
      app.schedule.doctor.image =
        process.env.base_url + app.schedule.doctor.image;
    });
    return res.status(200).json({
      data: appointments.result,
      count: appointments.result.length,
    });
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showAppointmnetDetail"))
  async showAppointmnetDetail(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let appointment = await appointmentService.showAppointmnetDetail(id);
    if (!appointment) {
      throw new ApiError("appointment not found", 404);
    }
    return res.status(200).json(appointment);
  }

  @Patch("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateStatus"),
    createValidationMiddleware(updateAppointmentStatusSchema)
  )
  async updateStatus(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    await validateAppoientment(id);
    await appointmentService.updateStatus(id, body);
    return res
      .status(200)
      .json({ message: `appointment updated successfully to ${body.status}` });
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateAppointment"),
    createValidationMiddleware(updateAppointmentSchema)
  )
  async updateAppointment(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    await validatePatient(body.patientId);
    await validateSchedule(body.scheduleId);
    await validateAppoientment(id);
    if (body.date) {
      body.date = new Date(body.date);
    }
    await appointmentService.updateAppointment(id, body);
    return res
      .status(200)
      .json({ message: `appointment updated successfully` });
  }
}

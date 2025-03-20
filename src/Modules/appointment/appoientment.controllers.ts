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
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";

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
    return await appointmentService.createAppointment(
      {
        ...body,
        dateTime: new Date(body.dateTime).toISOString(),
        createdBy: req.user?.id,
      },
      res
    );
  }

  @Get("/patient")
  @UseBefore(...secureRouteWithPermissions("getPatientAppointment"))
  async getPatientAppointment(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("patientId") patientId: number
  ) {
    return await appointmentService.getAllAppoientmentPatient(patientId, res);
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("getAppointment"))
  async getAppointment(@Req() req: Request, @Res() res: Response) {
    return await appointmentService.getAppointments(req.query, res);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showAppointmnetDetail"))
  async showAppointmnetDetail(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    return await appointmentService.showAppointmnetDetail(id, res);
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
    return await appointmentService.updateStatus(id, body, res);
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
    return await appointmentService.updateAppointment(id, body, res);
  }
}

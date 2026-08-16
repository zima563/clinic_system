import {
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParam,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addscheduleSchema,
  updateScheduleSchema,
} from "./schedule.validations";
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";

import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as scheduleServices from "./schedule.service";

@JsonController("/api/schedule")
export class scheduleControllers {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addSchedule"),
    createValidationMiddleware(addscheduleSchema)
  )
  async addSchedule(@Req() req: Request, @Res() res: Response) {
    const { doctorId, servicesId, price, dates } = req.body;
    return await scheduleServices.addSchedule(
      res,
      req.user?.id,
      doctorId,
      servicesId,
      price,
      dates
    );
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("listSchedules"))
  async listSchedules(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("doctorId") doctorId?: string,
    @QueryParam("servicesId") servicesId?: string
  ) {
    const parsedDoctorId = doctorId ? parseInt(doctorId, 10) : undefined;
    const parsedServicesId = servicesId ? parseInt(servicesId, 10) : undefined;

    const query: any = {
      ...req.query,
      doctorId: parsedDoctorId,
      servicesId: parsedServicesId,
    };
    return await scheduleServices.listSchedules(res, query);
  }

  @Get("/dates/:id")
  @UseBefore(...secureRouteWithPermissions("listDates"))
  async listDates(@Param("id") id: number, @Res() res: Response) {
    return await scheduleServices.listOfDates(res, id);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showScheduleDetails"))
  async showScheduleDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    return await scheduleServices.showDetailsOfSchedule(res, id);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateSchedule"),
    createValidationMiddleware(updateScheduleSchema)
  )
  async updateSchedule(
    @Param("id") id: number,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { doctorId, servicesId, price, dates } = req.body;

    return await scheduleServices.updateSchedule(
      res,
      id,
      doctorId,
      servicesId,
      price,
      dates
    );
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("deleteSchedule"))
  async deleteSchedule(@Param("id") id: number, @Res() res: Response) {
    return await scheduleServices.deleteSchedule(res, id);
  }
}

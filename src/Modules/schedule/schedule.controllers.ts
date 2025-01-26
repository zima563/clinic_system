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
    const schedule = await scheduleServices.addSchedule(
      req.user?.id,
      doctorId,
      servicesId,
      price,
      dates
    );
    return res.status(200).json(schedule);
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
    const data = await scheduleServices.listSchedules(query);
    return res.status(200).json({
      data: data.result,
      pagination: data.pagination,
      count: data.result.length,
    });
  }

  @Get("/dates/:id")
  @UseBefore(...secureRouteWithPermissions("listDates"))
  async listDates(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let dates = await scheduleServices.listOfDates(id);
    return res.status(200).json(dates);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showScheduleDetails"))
  async showScheduleDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let schedule = await scheduleServices.showDetailsOfSchedule(id);
    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }
    return res.status(200).json(schedule);
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
    const schedule = await scheduleServices.findScheduleById(id);
    if (dates) {
      await scheduleServices.deleteDates(id);
    }
    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }

    await scheduleServices.updateSchedule(
      id,
      doctorId,
      servicesId,
      price,
      dates
    );
    let updatedSchedule = await scheduleServices.findScheduleById(id);

    // Return the updated schedules
    return res.status(200).json(updatedSchedule);
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("deleteSchedule"))
  async deleteSchedule(@Param("id") id: number, @Res() res: Response) {
    // Check if the schedule exists
    const schedule = await scheduleServices.findScheduleById(id);

    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }
    await scheduleServices.deleteDates(id);
    await scheduleServices.deleteSchedule(id);

    return res.status(200).json({ message: "Schedule deleted successfully" });
  }
}

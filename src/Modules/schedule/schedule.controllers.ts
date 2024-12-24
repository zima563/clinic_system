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
import { PrismaClient } from "@prisma/client";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
const prisma = new PrismaClient();

@JsonController("/api/schedule")
export class scheduleControllers {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("addSchedule"),
    createValidationMiddleware(addscheduleSchema)
  )
  async addSchedule(@Req() req: Request, @Res() res: Response) {
    const { doctorId, servicesId, price, dates } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        doctorId,
        servicesId,
        price,
        dates: {
          create: dates.map(
            (date: { day: string; fromTime: string; toTime: string }) => ({
              day: date.day,
              fromTime: date.fromTime,
              toTime: date.toTime,
            })
          ),
        },
      },
    });
    return res.status(200).json(schedule);
  }

  @Get("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("listSchedules")
  )
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
    const apiFeatures = new ApiFeatures(prisma.schedule, query);
    await apiFeatures.filter().limitedFields().sort().search("schedule");
    await apiFeatures.paginateWithCount();

    const { result, pagination } = await apiFeatures.exec("schedule");
    return res.status(200).json({
      data: result,
      pagination,
      count: result.length,
    });
  }

  @Get("/dates")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("listDates"))
  async listDates(@Req() req: Request, @Res() res: Response) {
    let { scheduleId } = req.body;
    let dates = await prisma.date.findMany({
      where: {
        scheduleId,
      },
    });
    return res.status(200).json(dates);
  }

  @Get("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("showScheduleDetails")
  )
  async showScheduleDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let schedule = await prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }
    return res.status(200).json(schedule);
  }

  @Put("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateSchedule"),
    createValidationMiddleware(updateScheduleSchema)
  )
  async updateSchedule(
    @Param("id") id: number,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { doctorId, servicesId, price, dates } = req.body;
    const schedule = await prisma.schedule.findUnique({
      where: {
        id,
      },
    });
    if (dates) {
      await prisma.date.deleteMany({
        where: {
          scheduleId: id,
        },
      });
    }
    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }

    await prisma.schedule.update({
      where: {
        id,
      },
      data: {
        doctorId,
        servicesId,
        price,
        dates: {
          create: dates?.map(
            (date: { day: string; fromTime: string; toTime: string }) => ({
              day: date.day,
              fromTime: date.fromTime,
              toTime: date.toTime,
            })
          ),
        },
      },
    });
    let updatedSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    // Return the updated schedules
    return res.status(200).json(updatedSchedule);
  }

  @Delete("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("deleteSchedule")
  )
  async deleteSchedule(@Param("id") id: number, @Res() res: Response) {
    // Check if the schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }
    await prisma.date.deleteMany({
      where: {
        scheduleId: id,
      },
    });
    await prisma.schedule.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Schedule deleted successfully" });
  }
}

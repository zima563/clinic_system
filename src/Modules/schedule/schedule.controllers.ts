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
const prisma = new PrismaClient();

@JsonController("/api/schedule")
export class scheduleControllers {
  @Post("/")
  @UseBefore(createValidationMiddleware(addscheduleSchema))
  async addSchema(@Req() req: Request, @Res() res: Response) {
    const { doctorId, servicesId, price, date, fromTime, toTime } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        doctorId,
        servicesId,
        price,
        date: `${date}T00:00:00.000Z`,
        fromTime: fromTime,
        toTime: toTime,
      },
    });
    return res.status(200).json(schedule);
  }

  @Get("/")
  async listSchedules(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("doctorId") doctorId?: string,
    @QueryParam("servicesId") servicesId?: string,
    @QueryParam("date") date?: string
  ) {
    const parsedDoctorId = doctorId ? parseInt(doctorId, 10) : undefined;
    const parsedServicesId = servicesId ? parseInt(servicesId, 10) : undefined;

    const query: any = {
      ...req.query,
      doctorId: parsedDoctorId,
      servicesId: parsedServicesId,
    };

    // Add date filtering if the date is provided
    if (date) {
      query.date = new Date(date);
    }

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

  @Get("/:id")
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
  @UseBefore(createValidationMiddleware(updateScheduleSchema)) // Optional validation middleware
  async updateSchedule(
    @Param("id") id: number,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { doctorId, servicesId, price, date, fromTime, toTime } = req.body;
    const parsedDate = date ? new Date(date) : undefined;
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id, // Get the schedule by ID
      },
    });

    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }

    await prisma.schedule.update({
      where: {
        id: id, // Find the schedule by the provided id
      },
      data: {
        doctorId,
        servicesId,
        price,
        date: parsedDate,
        fromTime,
        toTime,
      },
    });
    let updatedSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    // Return the updated schedule
    return res.status(200).json(updatedSchedule);
  }

  @Delete("/:id")
  async deleteSchedule(@Param("id") id: number, @Res() res: Response) {
    // Check if the schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new ApiError("schedule not found", 404);
    }

    await prisma.schedule.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Schedule deleted successfully" });
  }
}

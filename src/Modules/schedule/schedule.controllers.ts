import {
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
    const { doctorId, servicesId, price, dates } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        doctorId,
        servicesId,
        price,
        dates: {
          create: dates.map((date: any) => ({
            date: {
              create: {
                date: `${date.date}T00:00:00.000Z`,
                fromTime: date.fromTime,
                toTime: date.toTime,
              },
            },
          })),
        },
      },
      include: {
        dates: {
          include: {
            date: true,
          },
        },
      },
    });
    return res.status(200).json(schedule);
  }

  @Get("/")
  async listSchedules(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("doctorId") doctorId?: string,
    @QueryParam("servicesId") servicesId?: string
  ) {
    const parsedDoctorId = doctorId ? parseInt(doctorId, 10) : undefined;
    const parsedServicesId = servicesId ? parseInt(servicesId, 10) : undefined;

    const query = {
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

  @Get("/:id")
  async showScheduleDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        dates: {
          include: {
            date: true,
          },
        },
      },
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
    const { doctorId, servicesId, price, dates } = req.body;
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id, // Get the schedule by ID
      },
      include: {
        dates: true, // Include the related dates
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
        dates: {
          // Update the dates related to the schedule
          deleteMany: {}, // Optional: If you want to clear old dates before adding new ones
          create: dates.map((date: any) => ({
            date: {
              create: {
                date: `${date.date}T00:00:00.000Z`,
                fromTime: date.fromTime,
                toTime: date.toTime,
              },
            },
          })),
        },
      },
      include: {
        dates: {
          include: {
            date: true, // Include the related dates
          },
        },
      },
    });
    let updatedSchedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        dates: {
          include: {
            date: true,
          },
        },
      },
    });

    // Return the updated schedule
    return res.status(200).json(updatedSchedule);
  }
}

import { JsonController, Post, Req, Res, UseBefore } from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addscheduleSchema } from "./schedule.validations";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
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
}

import { Response } from "express";
import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";

export const findScheduleById = async (id: number) => {
  return await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
};

export const addSchedule = async (
  res: Response,
  createdBy: any,
  doctorId: number,
  servicesId: number,
  price: any,
  dates: any
) => {
  const schedule = await prisma.schedule.create({
    data: {
      createdBy,
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
};

export const listSchedules = async (res: Response, query: any) => {
  const apiFeatures = new ApiFeatures(prisma.schedule, query);
  await apiFeatures.filter().limitedFields().sort().search("schedule");
  await apiFeatures.paginateWithCount();

  const { result, pagination } = await apiFeatures.exec("schedule");
  result.map((result: any) => {
    result.doctor.image = process.env.base_url + result.doctor.image;
  });

  return res.status(200).json({
    data: result,
    pagination: pagination,
    count: result.length,
  });
};

export const listOfDates = async (res: Response, id: number) => {
  const dates = await prisma.date.findMany({
    where: {
      scheduleId: id,
    },
  });
  return res.status(200).json(dates);
};

export const showDetailsOfSchedule = async (res: Response, id: number) => {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    select: {
      id: true,
      price: true,
      doctorId: false,
      servicesId: false,
      createdAt: true,
      updatedAt: true,
      dates: {
        select: {
          id: true,
          fromTime: true,
          toTime: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
      service: {
        select: {
          id: true,
          title: true,
        },
      },
      creator: {
        select: {
          userName: true,
        },
      },
    },
  });
  if (!schedule) {
    throw new ApiError("schedule not found", 404);
  }
  return res.status(200).json(schedule);
};

export const deleteDates = async (id: number) => {
  return await prisma.date.deleteMany({
    where: {
      scheduleId: id,
    },
  });
};

export const updateSchedule = async (
  res: Response,
  id: number,
  doctorId: number,
  servicesId: number,
  price: any,
  dates: any
) => {
  const schedule = await findScheduleById(id);
  if (dates) {
    await deleteDates(id);
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
  let updatedSchedule = await findScheduleById(id);

  // Return the updated schedules
  return res.status(200).json(updatedSchedule);
};

export const deleteSchedule = async (res: Response, id: number) => {
  // Check if the schedule exists
  const schedule = await findScheduleById(id);

  if (!schedule) {
    throw new ApiError("schedule not found", 404);
  }
  await deleteDates(id);
  await prisma.schedule.delete({
    where: { id },
  });

  return res.status(200).json({ message: "Schedule deleted successfully" });
};

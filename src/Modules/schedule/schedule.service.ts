import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";

export const addSchedule = async (
  doctorId: number,
  servicesId: number,
  price: any,
  dates: any
) => {
  return await prisma.schedule.create({
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
};

export const listSchedules = async (query: any) => {
  const apiFeatures = new ApiFeatures(prisma.schedule, query);
  await apiFeatures.filter().limitedFields().sort().search("schedule");
  await apiFeatures.paginateWithCount();

  const { result, pagination } = await apiFeatures.exec("schedule");
  result.map((result: any) => {
    result.doctor.image = process.env.base_url + result.doctor.image;
  });

  return {
    result,
    pagination,
  };
};

export const listOfDates = async (id: number) => {
  return prisma.date.findMany({
    where: {
      scheduleId: id,
    },
  });
};

export const showDetailsOfSchedule = async (id: number) => {
  return await prisma.schedule.findUnique({
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
    },
  });
};

export const findScheduleById = async (id: number) => {
  return await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
};

export const deleteDates = async (id: number) => {
  return await prisma.date.deleteMany({
    where: {
      scheduleId: id,
    },
  });
};

export const updateSchedule = async (
  id: number,
  doctorId: number,
  servicesId: number,
  price: any,
  dates: any
) => {
  return await prisma.schedule.update({
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
};

export const deleteSchedule = async (id: number) => {
  return await prisma.schedule.delete({
    where: { id },
  });
};

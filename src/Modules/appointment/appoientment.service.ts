import { Response } from "express";
import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import {
  validateAppoientment,
  validatePatient,
  validateSchedule,
} from "./validators";
import ApiError from "../../utils/ApiError";

export const createAppointment = async (data: any, res: Response) => {
  await validatePatient(data.patientId);
  await validateSchedule(data.scheduleId);
  const appointment = prisma.appointment.create({ data });

  return res.status(200).json(appointment);
};

export const getAllAppoientmentPatient = async (
  patientId: number,
  res: Response
) => {
  if (!patientId) throw new ApiError("patientId must exist", 401);
  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    select: {
      id: true,
      dateTime: true,
      status: true,
      schedule: {
        select: {
          id: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
      date: {
        select: {
          id: true,
          fromTime: true,
          toTime: true,
        },
      },
    },
  });
  return res.status(200).json({
    data: appointments,
    count: appointments.length,
  });
};

export const getAppointments = async (query: any, res: Response) => {
  const apiFeatures = new ApiFeatures(prisma.appointment, query);

  // Apply filtering, sorting, and pagination
  await apiFeatures.filter().sort().paginateWithCount();

  const { result, pagination } = await apiFeatures.exec("appointment");

  result.map((app: any) => {
    app.schedule.doctor.image =
      process.env.base_url + app.schedule.doctor.image;
  });
  return res.status(200).json({
    data: result,
    pagination,
    count: result.length,
  });
};

export const showAppointmnetDetail = async (id: number, res: Response) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      dateTime: true,
      status: true,
      creator: {
        select: {
          userName: true,
        },
      },
      schedule: {
        select: {
          price: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      date: {
        select: {
          fromTime: true,
          toTime: true,
        },
      },
      patient: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!appointment) {
    throw new ApiError("appointment not found", 404);
  }
  return res.status(200).json(appointment);
};

export const updateStatus = async (id: number, body: any, res: Response) => {
  await validateAppoientment(id);
  await prisma.appointment.update({
    where: { id },
    data: {
      status: body.status,
    },
  });
  return res
    .status(200)
    .json({ message: `appointment updated successfully to ${body.status}` });
};

export const updateAppointment = async (
  id: number,
  body: any,
  res: Response
) => {
  await validatePatient(body.patientId);
  await validateSchedule(body.scheduleId);
  await validateAppoientment(id);
  if (body.date) {
    body.date = new Date(body.date);
  }
  await prisma.appointment.update({
    where: { id },
    data: body,
  });

  return res.status(200).json({ message: `appointment updated successfully` });
};

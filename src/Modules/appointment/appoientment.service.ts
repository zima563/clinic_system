import { prisma } from "../../prismaClient";

export const createAppointment = async (data: any) => {
  return prisma.appointment.create({ data });
};

export const getAllAppoientmentPatient = async (patientId: number) => {
  return prisma.appointment.findMany({
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
};

export const getAppointments = async () => {
  return prisma.appointment.findMany({
    select: {
      id: true,
      dateTime: true,
      status: true,
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
};

export const showAppointmnetDetail = async (id: number) => {
  return prisma.appointment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      dateTime: true,
      status: true,
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
};

export const updateStatus = async (id: number, body: any) => {
  return prisma.appointment.update({
    where: { id },
    data: {
      status: body.status,
    },
  });
};

export const updateAppointment = async (id: number, body: any) => {
  return prisma.appointment.update({
    where: { id },
    data: body,
  });
};

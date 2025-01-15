import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";

export const validatePatient = async (patientId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new ApiError("patient not found with this patientId");
  }
};

export const validateSchedule = async (scheduleId: number) => {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new ApiError("schedule not found with this scheduleId");
  }
};

export const validateAppoientment = async (id: number) => {
  if (!(await prisma.appointment.findUnique({ where: { id } }))) {
    throw new ApiError("appointment not found", 404);
  }
};

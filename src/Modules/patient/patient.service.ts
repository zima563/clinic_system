import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";

export const createPatient = async (body: any) => {
  return prisma.patient.create({
    data: body,
  });
};

export const updatePatient = async (id: number, body: any) => {
  let patient = await prisma.patient.findUnique({
    where: { id },
  });
  if (!patient) {
    throw new ApiError("patient not found", 404);
  }
  await prisma.patient.update({
    where: { id },
    data: body,
  });
};

export const listPatient = async (query: any) => {
  // Initialize ApiFeatures with the Prisma model and the search query
  const apiFeatures = new ApiFeatures(prisma.patient, query);

  // Apply filters, sorting, field selection, search, and pagination
  await apiFeatures.filter().sort().limitedFields().search("patient"); // Specify the model name, 'user' in this case

  await apiFeatures.paginateWithCount();

  // Execute the query and get the result and pagination
  const { result, pagination } = await apiFeatures.exec("patient");

  return {
    result,
    pagination,
  };
};

export const getPatient = async (id: number) => {
  return prisma.patient.findUnique({
    where: { id },
  });
};

export const deletePatient = async (id: number) => {
  await prisma.appointment.deleteMany({
    where: {
      patientId: id,
    },
  });
  await prisma.patient.delete({
    where: {
      id,
    },
  });
};

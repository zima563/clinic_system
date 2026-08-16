import { Response } from "express";
import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";
import { patientExist } from "./validators";

const getPatientById = async (id: number) => {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          userName: true,
        },
      },
    },
  });
};

const validatePatientFound = async (id: number) => {
  const patient = await getPatientById(id);
  if (!patient) {
    throw new ApiError("patient not found", 404);
  }
  return patient;
};

export const createPatient = async (res: Response, body: any) => {
  await patientExist(body.phone, 0);
  const birthdate = new Date(body.birthdate);
  body.birthdate = birthdate.toISOString();

  const patient = await prisma.patient.create({
    data: body,
  });
  return res.status(200).json(patient);
};

export const updatePatient = async (res: Response, id: number, body: any) => {
  let patient = await prisma.patient.findUnique({
    where: { id },
  });
  if (!patient) {
    throw new ApiError("patient not found", 404);
  }
  await patientExist(body.phone, id);
  if (body.birthdate) {
    const birthdate = new Date(body.birthdate);
    body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
  }
  await prisma.patient.update({
    where: { id },
    data: body,
  });
  return res.status(200).json({ message: "patient updated successfully" });
};

export const listPatient = async (res: Response, query: any) => {
  const baseFilter = {
    isDeleted: false,
  };
  // Initialize ApiFeatures with the Prisma model and the search query
  const apiFeatures = new ApiFeatures(prisma.patient, query);

  // Apply filters, sorting, field selection, search, and pagination
  await apiFeatures.filter(baseFilter).sort().limitedFields().search("patient"); // Specify the model name, 'user' in this case

  await apiFeatures.paginateWithCount();

  // Execute the query and get the result and pagination
  const { result, pagination } = await apiFeatures.exec("patient");

  return res.status(200).json({
    data: result,
    pagination: pagination, // Use the pagination here
    count: result.length,
  });
};

export const getPatient = async (res: Response, id: number) => {
  const patient = await validatePatientFound(id);
  return res.status(200).json(patient);
};

export const deletePatient = async (res: Response, id: number) => {
  const patient = await validatePatientFound(id);
  await prisma.patient.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
  return res.status(200).json({ message: "patient deleted successfully!" });
};

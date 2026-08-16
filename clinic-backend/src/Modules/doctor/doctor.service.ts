import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import { uploadFile } from "../service/services.service";
import { validateDoctor, validatePhone, validateSpecialty } from "./validators";
import ApiError from "../../utils/ApiError";
import sharp from "sharp";

const uploadDoctorFile = async (req: Request, doctor: any) => {
  let fileName = doctor?.image;

  if (req.file) {
    const cleanedFilename = req.file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.]/g, "");
    const newFilename = `img-${uuidv4()}-${encodeURIComponent(
      cleanedFilename
    )}`;
    const imgPath = path.join("uploads", newFilename);

    // Resize and save the image
    await sharp(req.file.buffer)
      .resize(100, 100)
      .png({ quality: 80 })
      .toFile(imgPath);

    // Delete old image if it exists
    if (doctor?.image) {
      const oldImagePath = path.join("uploads", doctor.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    fileName = newFilename;
  }
  return fileName;
};

const getDoctorById = async (id: number) => {
  return prisma.doctor.findUnique({
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

export const addDoctor = async (req: Request, res: Response, body: any) => {
  await validateDoctor(body.phone);
  await validateSpecialty(body.specialtyId);

  body.specialtyId = parseInt(body.specialtyId, 10);
  body.image = await uploadFile(req, res, "doctor");
  const doctor = await prisma.doctor.create({
    data: {
      ...body,
    },
  });
  return res.status(200).json(doctor);
};

export const updateDoctor = async (
  id: number,
  req: Request,
  res: Response,
  body: any
) => {
  const doctor = await getDoctorById(id);
  if (!doctor) throw new ApiError("doctor not found", 404);

  await validatePhone(body.phone, id);
  let fileName = await uploadDoctorFile(req, doctor);
  body.specialtyId = parseInt(body.specialtyId, 8);
  const updatedDoctor = await prisma.doctor.update({
    where: { id },
    data: {
      image: fileName,
      ...body,
    },
  });
  return res.status(200).json({
    message: "Doctor updated successfully",
    data: updatedDoctor,
  });
};

export const getDoctors = async (res: Response, query: any) => {
  const baseFilter = {
    isDeleted: false,
  };
  // Initialize ApiFeatures with the Prisma model and the search query
  const apiFeatures = new ApiFeatures(prisma.doctor, query);

  // Apply filters, sorting, field selection, search, and pagination
  await apiFeatures.filter(baseFilter).sort().limitedFields().search("doctor"); // Specify the model name, 'user' in this case

  await apiFeatures.paginateWithCount();

  // Execute the query and get the result and pagination
  const { result, pagination } = await apiFeatures.exec("doctor");
  result.map((doc: any) => {
    doc.image = process.env.base_url + doc.image;
  });

  return res.status(200).json({
    data: result,
    pagination: pagination, // Use the pagination here
    count: result.length,
  });
};

export const getDoctor = async (res: Response, id: number) => {
  const doctor = await getDoctorById(id);
  if (!doctor) {
    throw new ApiError("doctor not found", 404);
  }
  doctor.image = process.env.base_url + doctor.image;
  return res.status(200).json(doctor);
};

export const deactiveOrActive = async (res: Response, id: number) => {
  const doctor = await getDoctorById(id);
  if (!doctor) {
    throw new ApiError("doctor not found", 404);
  }
  await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
  const updatedDoctor = await getDoctorById(id);
  return res
    .status(200)
    .json({ message: "doctor deactiveded successfully", updatedDoctor });
};

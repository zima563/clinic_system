import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";
import { Request, Response } from "express";

export const validateService = async (id: number) => {
  let service = await getServiceById(id);
  if (!service) {
    throw new ApiError("service not found", 404);
  }
  return service;
};

export const uploadFile = async (req: any, res: any, modelName: string) => {
  if (!req.file && modelName === "doctor") {
    return "avatar.png";
  }

  if (!req.file && modelName === "service") {
    return "avatar.png";
  }
  const cleanedFilename = req.file.originalname
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.]/g, "");

  // Generate a unique filename
  const iconFilename = `icon-${uuidv4()}-${encodeURIComponent(
    cleanedFilename
  )}`;
  const iconPath = path.join("uploads", iconFilename);
  // Resize and save the icon using sharp
  await sharp(req.file.buffer)
    .resize({ width: 100, height: 100, fit: "cover" })
    .png({ quality: 70, compressionLevel: 9 })
    .toFile(iconPath);

  return iconFilename;
};

export const createService = async (req: Request, res: Response, body: any) => {
  if (await prisma.service.findFirst({ where: { title: body.title } })) {
    throw new ApiError("service title already exists", 409);
  }

  body.icon = (await uploadFile(req, res, "service")) ?? "";

  const service = await prisma.service.create({
    data: {
      title: body.title,
      desc: body.desc,
      img: body.icon,
      createdBy: body.createdBy,
    },
  });
  return res.status(200).json(service);
};

export const listServices = async (res: Response, query: any) => {
  const baseFilter = {
    isDeleted: false,
  };
  const apiFeatures = new ApiFeatures(prisma.service, query);

  await apiFeatures.filter(baseFilter).sort().limitedFields().search("service");

  await apiFeatures.paginateWithCount();
  const { result, pagination } = await apiFeatures.exec("service");

  result.map((doc: any) => {
    doc.img = process.env.base_url + doc.img;
  });

  return res.status(200).json({
    data: result,
    pagination: pagination,
  });
};

export const getServiceById = async (id: number) => {
  return await prisma.service.findUnique({
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

export const getService = async (res: Response, id: number) => {
  let service = await getServiceById(id);
  if (!service) {
    throw new ApiError("service not found", 404);
  }
  service.img = process.env.base_url + service.img;
  return res.status(200).json(service);
};

export const CheckTitleExist = async (id: number, title: string) => {
  if (
    await prisma.service.findFirst({
      where: { title, NOT: { id } },
    })
  ) {
    throw new ApiError("service title already exists", 409);
  }
};

export const uploadFileForUpdate = async (req: any, service: any) => {
  let fileName;
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
      .resize({ width: 100, height: 100, fit: "cover" })
      .png({ quality: 70, compressionLevel: 9 })
      .toFile(imgPath);

    // Delete old image if it exists
    if (service?.img) {
      const oldImagePath = path.join("uploads", service?.img);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    fileName = newFilename;
  }
  return fileName;
};

export const updateService = async (
  req: Request,
  res: Response,
  id: number,
  body: any
) => {
  let service = await validateService(id);
  await CheckTitleExist(id, body.title);
  let fileName = await uploadFileForUpdate(req, service);
  await prisma.service.update({
    where: { id },
    data: {
      title: body.title || service?.title,
      desc: body.desc || service?.desc,
      img: fileName || service?.img,
    },
  });
  return res.status(200).json({ message: "service updated successfully" });
};

export const deactiveService = async (res: Response, id: number) => {
  let service = await validateService(id);
  if (service.status) {
    await prisma.service.update({
      where: { id },
      data: { status: false },
    });
  } else {
    await prisma.service.update({
      where: { id },
      data: { status: true },
    });
  }
  let updatedService = await getServiceById(id);
  return res.status(200).json(updatedService);
};

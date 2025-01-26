import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prismaClient";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";

export const uploadFile = async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: "image file is required." });
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

  return iconPath;
};

export const createService = async (body: any) => {
  console.log(body);

  return await prisma.service.create({
    data: {
      title: body.title,
      desc: body.desc,
      img: body.icon,
      createdBy: body.createdBy,
    },
  });
};

export const listServices = async (baseFilter: any, query: any) => {
  const apiFeatures = new ApiFeatures(prisma.service, query);

  await apiFeatures.filter(baseFilter).sort().limitedFields().search("service");

  await apiFeatures.paginateWithCount();
  const { result, pagination } = await apiFeatures.exec("service");

  result.map((doc: any) => {
    doc.img = process.env.base_url + doc.img;
  });

  return {
    result,
    pagination,
  };
};

export const getServiceById = async (id: number) => {
  return await prisma.service.findUnique({ where: { id } });
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
  id: number,
  body: any,
  service: any,
  fileName: any
) => {
  prisma.service.update({
    where: { id },
    data: {
      title: body.title || service?.title,
      desc: body.desc || service?.desc,
      img: fileName || service?.img,
    },
  });
};

export const deactiveService = async (id: number, service: any) => {
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
};

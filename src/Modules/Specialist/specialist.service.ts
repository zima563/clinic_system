import sharp from "sharp";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../prismaClient";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";

export const uploadFileForSpecialty = async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: "Icon file is required." });
  }

  // Clean up the file name to prevent issues with special characters
  const cleanedFilename = req.file.originalname
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.]/g, "");

  // Generate a unique filename
  const iconFilename = `icon-${uuidv4()}-${encodeURIComponent(
    cleanedFilename
  )}`;
  const iconPath = path.join("uploads", iconFilename);

  // Resize and save the icon using sharp
  sharp(req.file.buffer).resize(160, 160).png({ quality: 80 }).toFile(iconPath);

  return iconFilename;
};

export const createSpecialty = async (icon: any, body: any) => {
  return await prisma.specialty.create({
    data: {
      title: body.title,
      icon: icon ?? "",
    },
  });
};

export const checkSpecialtyExist = async (body: any) => {
  if (await prisma.specialty.findUnique({ where: { title: body.title } })) {
    throw new ApiError("specialty title already exist", 409);
  }
};

export const findSpecialtyById = async (id: number) => {
  return await prisma.specialty.findUnique({ where: { id } });
};

export const uploadFileForSpecialtyUpdate = async (
  req: any,
  specialty: any
) => {
  let fileName = specialty.icon;
  // Process image if provided
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
      .resize(160, 160)
      .png({ quality: 80 })
      .toFile(imgPath);

    // Delete old image if it exists
    if (specialty.icon) {
      const oldImagePath = path.join("uploads", specialty.icon);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    fileName = newFilename;
  }
  return fileName;
};

export const updateSpecialty = async (id: number, fileName: any, body: any) => {
  return await prisma.specialty.update({
    where: { id },
    data: {
      icon: fileName ?? "",
      ...body,
    },
  });
};

export const getListSpecial = async (query: any) => {
  const apiFeatures = new ApiFeatures(prisma.specialty, query);

  await apiFeatures.filter().sort().limitedFields().search("specialty");

  // Get the count of documents and apply pagination
  await apiFeatures.paginateWithCount();

  // Execute the query and get the results along with pagination info
  const { result, pagination } = await apiFeatures.exec("specialty");

  result.map((doc: any) => {
    doc.icon = process.env.base_url + doc.icon;
  });

  return {
    result,
    pagination,
  };
};

export const deleteSpecialty = async (id: number, specialty: any) => {
  await prisma.doctor.deleteMany({ where: { specialtyId: id } });
  if (specialty.icon) {
    const oldImagePath = path.join("uploads", specialty.icon);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
  await prisma.specialty.delete({
    where: { id },
  });
};

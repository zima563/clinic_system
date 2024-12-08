import fs from "fs";
import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
  Req,
  Res,
  UploadedFile,
  UseBefore,
} from "routing-controllers";
import createUploadMiddleware from "../../middlewares/uploadFile"; // Correct import
import { createValidationMiddleware } from "../../middlewares/validation"; // Correct import
import { Response } from "express";
import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import {
  specialtySchema,
  updateSpecialtySchema,
} from "./specialist.validation";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";

const prisma = new PrismaClient();

@JsonController("/api/specialist")
export class specialtyControllers {
  @Post("/")
  @UseBefore(
    createUploadMiddleware("icon"),
    createValidationMiddleware(specialtySchema)
  )
  async createSpecialty(
    @Req() req: any,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (!req.file) {
      return res.status(400).json({ error: "Icon file is required." });
    }
    if (await prisma.specialty.findUnique({ where: { title: body.title } })) {
      throw new ApiError("specialty title already exist", 409);
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
    await sharp(req.file.buffer)
      .resize(100, 100)
      .png({ quality: 80 })
      .toFile(iconPath);

    // Save the specialty to the database
    const specialty = await prisma.specialty.create({
      data: {
        title: body.title,
        icon: iconFilename ?? "",
      },
    });

    return res.status(200).json(specialty);
  }

  @Put("/:id")
  @UseBefore(
    createUploadMiddleware("icon"),
    createValidationMiddleware(updateSpecialtySchema)
  )
  async updateSpecialty(
    @Req() req: any,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: any
  ) {
    let specialty = await prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      throw new ApiError("specialty not found", 404);
    }
    if (await prisma.specialty.findUnique({ where: { title: body?.title } })) {
      throw new ApiError("specialty title already exist", 409);
    }
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
        .resize(100, 100)
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

    await prisma.specialty.update({
      where: { id },
      data: {
        icon: fileName ?? "",
        ...body,
      },
    });
    return res.status(200).json({ message: "specialty updated successfully" });
  }

  @Get("/all")
  async allSpecialtys(@QueryParams() query: any, @Res() res: Response) {
    const apiFeatures = new ApiFeatures(prisma.specialty, query);

    await apiFeatures.filter().sort().limitedFields().search("specialty");

    // Get the count of documents and apply pagination
    await apiFeatures.paginateWithCount();

    // Execute the query and get the results along with pagination info
    const { result, pagination } = await apiFeatures.exec("specialty");

    return res.status(200).json({
      data: result,
      pagination: pagination,
      count: result.length,
    });
  }

  @Get("/:id")
  async getOneSpecialty(@Param("id") id: number, @Res() res: Response) {
    let specialty = await prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      throw new ApiError("specialty not found");
    }
    return res.status(200).json(specialty);
  }
}

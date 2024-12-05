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
import { uploadSingleFile } from "../../middlewares/uploadFile"; // Correct import
import Joi from "joi";
import { createValidationMiddleware } from "../../middlewares/validation"; // Correct import
import { Response } from "express";
import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
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
  @UseBefore(uploadSingleFile, createValidationMiddleware(specialtySchema))
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
    uploadSingleFile,
    createValidationMiddleware(updateSpecialtySchema)
  )
  async updateSpecialty(
    @Req() req: any,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: any
  ) {
    if (!(await prisma.specialty.findUnique({ where: { id } }))) {
      throw new ApiError("specialty not found", 404);
    }
    if (await prisma.specialty.findUnique({ where: { title: body?.title } })) {
      throw new ApiError("specialty title already exist", 409);
    }
    await prisma.specialty.update({
      where: { id },
      data: body,
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
}

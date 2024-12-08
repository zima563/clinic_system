import {
  Body,
  JsonController,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addDoctorValidationSchema } from "./doctor.validation";
import createUploadMiddleware from "../../middlewares/uploadFile";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";

const prisma = new PrismaClient();

@JsonController("/api/doctors")
export class doctorControllers {
  @Post("/")
  @UseBefore(
    createUploadMiddleware("icon"),
    createValidationMiddleware(addDoctorValidationSchema)
  )
  async addDoctor(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (!req.file) {
      return res.status(400).json({ error: "image file is required." });
    }
    body.specialtyId = parseInt(body.specialtyId, 10);
    const cleanedFilename = req.file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.]/g, "");

    const Filename = `img-${uuidv4()}-${encodeURIComponent(cleanedFilename)}`;
    const imgPath = path.join("uploads", Filename);

    await sharp(req.file.buffer)
      .resize(100, 100)
      .png({ quality: 80 })
      .toFile(imgPath);

    const doctor = await prisma.doctor.create({
      data: {
        image: Filename ?? "",
        ...body,
      },
    });

    return res.status(200).json(doctor);
  }
}

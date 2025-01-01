import fs from "fs";
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Patch,
  Post,
  Put,
  QueryParams,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addDoctorValidationSchema,
  UpdateDoctorValidationSchema,
} from "./doctor.validation";
import createUploadMiddleware from "../../middlewares/uploadFile";
import { query, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";
import ApiFeatures from "../../utils/ApiFeatures";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";

const prisma = new PrismaClient();

@JsonController("/api/doctors")
export class doctorControllers {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("addDoctor"),
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

  @Put("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateDoctor"),
    createUploadMiddleware("icon"), // Ensure this middleware works as expected
    createValidationMiddleware(UpdateDoctorValidationSchema)
  )
  async updateDoctor(
    @Req() req: Request,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    // Check if the doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }

    // Initialize fileName to preserve existing image if no new image is uploaded
    let fileName = doctor.image;

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
      if (doctor.image) {
        const oldImagePath = path.join("uploads", doctor.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      fileName = newFilename;
    }

    // Update the doctor record
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        image: fileName,
        ...body,
      },
    });

    // Return success response
    return res.status(200).json({
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  }

  @Get("/")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("listDoctors"))
  async listDoctors(
    @Req() req: any,
    @QueryParams() query: any,
    @Body() body: any,
    @Res() res: any
  ) {
    // Initialize ApiFeatures with the Prisma model and the search query
    const apiFeatures = new ApiFeatures(prisma.doctor, query);

    // Apply filters, sorting, field selection, search, and pagination
    await apiFeatures.filter().sort().limitedFields().search("doctor"); // Specify the model name, 'user' in this case

    await apiFeatures.paginateWithCount();

    // Execute the query and get the result and pagination
    const { result, pagination } = await apiFeatures.exec("doctor");
    result.map((doc: any) => {
      doc.image = process.env.base_url + doc.image;
    });
    // Return the result along with pagination information
    return res.status(200).json({
      data: result,
      pagination: pagination, // Use the pagination here
      count: result.length,
    });
  }

  @Get("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("showDoctorDetails")
  )
  async showDoctorDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let doctor = await prisma.doctor.findUnique({
      where: { id },
    });
    if (!doctor) {
      throw new ApiError("doctor not found", 404);
    }
    doctor.image = process.env.base_url + doctor.image;
    return res.status(200).json(doctor);
  }

  @Patch("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("DeactiveDoctor")
  )
  async DeactiveDoctor(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new ApiError("doctor not found", 404);
    }
    if (doctor.isActive) {
      await prisma.doctor.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      await prisma.doctor.update({
        where: { id },
        data: { isActive: true },
      });
    }

    let updatedDoctor = await prisma.doctor.findUnique({ where: { id } });

    return res
      .status(200)
      .json({ message: "doctor deactiveded successfully", updatedDoctor });
  }
}

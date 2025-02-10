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
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import {
  validateDoctor,
  validateDoctorById,
  validatePhone,
  validateSpecialty,
} from "./validators";
import * as doctorServices from "./doctor.service";
import { uploadFile } from "../service/services.service";

const minioClient = new S3Client({
  region: "us-east-1",
  endpoint: "http://127.0.0.1:9000",
  credentials: {
    accessKeyId: "admin",
    secretAccessKey: "admin123",
  },
});
@JsonController("/api/doctors")
export class doctorControllers {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addDoctor"),
    createUploadMiddleware("image"),
    createValidationMiddleware(addDoctorValidationSchema)
  )
  async addDoctor(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    await validateDoctor(body.phone);
    await validateSpecialty(body.specialtyId);

    body.specialtyId = parseInt(body.specialtyId, 10);
    body.image = await uploadFile(req, res, "doctor");

    const doctor = await doctorServices.addDoctor({
      ...body,
      createdBy: req.user?.id,
    });

    return res.status(200).json(doctor);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateDoctor"),
    createUploadMiddleware("icon"), // Ensure this middleware works as expected
    createValidationMiddleware(UpdateDoctorValidationSchema)
  )
  async updateDoctor(
    @Req() req: Request,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    const doctor = await doctorServices.getDoctor(id);
    // Check if the doctor exists
    await validateDoctorById(id);
    await validatePhone(body.phone, id);

    // Initialize fileName to preserve existing image if no new image is uploaded
    let fileName = doctor?.image;

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
      if (doctor?.image) {
        const oldImagePath = path.join("uploads", doctor.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      fileName = newFilename;
    }

    // Update the doctor record
    const updatedDoctor = await doctorServices.updateDoctor(id, fileName, body);

    // Return success response
    return res.status(200).json({
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("listDoctors"))
  async listDoctors(
    @Req() req: any,
    @QueryParams() query: any,
    @Body() body: any,
    @Res() res: any
  ) {
    const doctors = await doctorServices.getDoctors(query);
    // Return the result along with pagination information
    return res.status(200).json({
      data: doctors.result,
      pagination: doctors.pagination, // Use the pagination here
      count: doctors.result.length,
    });
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showDoctorDetails"))
  async showDoctorDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let doctor = await doctorServices.getDoctor(id);
    if (!doctor) {
      throw new ApiError("doctor not found", 404);
    }
    doctor.image = process.env.base_url + doctor.image;
    return res.status(200).json(doctor);
  }

  @Patch("/:id")
  @UseBefore(...secureRouteWithPermissions("DeactiveDoctor"))
  async DeactiveDoctor(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let doctor = await doctorServices.getDoctor(id);
    if (!doctor) throw new ApiError("doctor not found", 404);

    await doctorServices.deactiveOrActive(id);

    let updatedDoctor = await doctorServices.getDoctor(id);

    return res
      .status(200)
      .json({ message: "doctor deactiveded successfully", updatedDoctor });
  }
}

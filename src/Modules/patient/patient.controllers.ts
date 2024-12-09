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
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addPatientSchema, UpdatePatientSchema } from "./patient.validation";
import { CheckPhoneMiddleware } from "../../middlewares/phoneExist";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";

const prisma = new PrismaClient();

@JsonController("/api/patients")
export class patientController {
  @Post("/")
  @UseBefore(createValidationMiddleware(addPatientSchema), CheckPhoneMiddleware)
  async addPatient(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    // Convert birthdate to ISO 8601 format if it's not already
    if (body.birthdate) {
      const birthdate = new Date(body.birthdate);
      body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
    }
    let patient = await prisma.patient.create({
      data: body,
    });
    return res.status(200).json(patient);
  }

  @Put("/:id")
  @UseBefore(createValidationMiddleware(UpdatePatientSchema))
  async updatePatient(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (body.birthdate) {
      const birthdate = new Date(body.birthdate);
      body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
    }
    let patient = await prisma.patient.findUnique({
      where: { id },
    });
    if (!patient) {
      throw new ApiError("patient not found", 404);
    }
    await prisma.patient.update({
      where: { id },
      data: body,
    });
    return res.status(200).json({ message: "patient updated successfully" });
  }

  @Get("/")
  async listPatient(
    @Req() req: any,
    @QueryParams() query: any,
    @Body() body: any,
    @Res() res: any
  ) {
    // Initialize ApiFeatures with the Prisma model and the search query
    const apiFeatures = new ApiFeatures(prisma.patient, query);

    // Apply filters, sorting, field selection, search, and pagination
    await apiFeatures.filter().sort().limitedFields().search("patient"); // Specify the model name, 'user' in this case

    await apiFeatures.paginateWithCount();

    // Execute the query and get the result and pagination
    const { result, pagination } = await apiFeatures.exec("patient");

    // Return the result along with pagination information
    return res.status(200).json({
      data: result,
      pagination: pagination, // Use the pagination here
      count: result.length,
    });
  }
}

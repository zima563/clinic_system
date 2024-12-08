import {
  Body,
  JsonController,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addPatientSchema } from "./patient.validation";
import { CheckPhoneMiddleware } from "../../middlewares/phoneExist";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

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
}

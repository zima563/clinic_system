import {
  Body,
  Delete,
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
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";
import { patientExist } from "./validators";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as patientService from "./patient.service";

@JsonController("/api/patients")
export class patientController {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addPatient"),
    createValidationMiddleware(addPatientSchema)
  )
  async addPatient(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    await patientExist(body.phone);
    const birthdate = new Date(body.birthdate);
    body.birthdate = birthdate.toISOString();

    let patient = await patientService.createPatient(body);
    return res.status(200).json(patient);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updatePatient"),
    createValidationMiddleware(UpdatePatientSchema)
  )
  async updatePatient(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    await patientExist(body.phone);
    if (body.birthdate) {
      const birthdate = new Date(body.birthdate);
      body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
    }
    await patientService.updatePatient(id, body);
    return res.status(200).json({ message: "patient updated successfully" });
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("listPatient"))
  async listPatient(
    @Req() req: any,
    @QueryParams() query: any,
    @Body() body: any,
    @Res() res: any
  ) {
    const data = await patientService.listPatient(query);
    // Return the result along with pagination information
    return res.status(200).json({
      data: data.result,
      pagination: data.pagination, // Use the pagination here
      count: data.result.length,
    });
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("getPatient"))
  async getPatient(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let patient = await patientService.getPatient(id);
    if (!patient) {
      throw new ApiError("patient not found", 404);
    }
    return res.status(200).json(patient);
  }

  @Delete("/:id")
  async deletePatient(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let patient = await patientService.getPatient(id);

    if (!patient) throw new ApiError("patient not found", 404);
    await patientService.deletePatient(id);
    return res.status(200).json({ message: "patient deleted successfully!" });
  }
}

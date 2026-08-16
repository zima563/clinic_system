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
    return await patientService.createPatient(res, {
      createdBy: req.user?.id,
      ...body,
    });
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updatePatient"),
    createValidationMiddleware(UpdatePatientSchema)
  )
  async updatePatient(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    await patientService.updatePatient(res, id, body);
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("listPatient"))
  async listPatient(
    @QueryParams() query: any,
    @Body() body: any,
    @Res() res: any
  ) {
    return await patientService.listPatient(res, query);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("getPatient"))
  async getPatient(@Param("id") id: number, @Res() res: Response) {
    return await patientService.getPatient(res, id);
  }

  @Delete("/:id")
  async deletePatient(@Param("id") id: number, @Res() res: Response) {
    return await patientService.deletePatient(res, id);
  }
}

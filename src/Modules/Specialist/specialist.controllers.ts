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
import createUploadMiddleware from "../../middlewares/uploadFile"; // Correct import
import { createValidationMiddleware } from "../../middlewares/validation"; // Correct import
import { Response } from "express";

import {
  specialtySchema,
  updateSpecialtySchema,
} from "./specialist.validation";
import ApiError from "../../utils/ApiError";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";

import * as specialtyServices from "./specialist.service";

@JsonController("/api/specialist")
export class specialtyControllers {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("createSpecialty"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(specialtySchema)
  )
  async createSpecialty(
    @Req() req: any,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await specialtyServices.createSpecialty(req, res, body, req.user.id);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateSpecialty"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(updateSpecialtySchema)
  )
  async updateSpecialty(
    @Req() req: any,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: any
  ) {
    return await specialtyServices.updateSpecialty(req, res, id, body);
  }

  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allSpecialtys"))
  async allSpecialtys(@QueryParams() query: any, @Res() res: Response) {
    return await specialtyServices.getListSpecial(res, query);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("getOneSpecialty"))
  async getOneSpecialty(@Param("id") id: number, @Res() res: Response) {
    return await specialtyServices.getSpecialty(res, id);
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("getOneSpecialty"))
  async DeleteSpecialty(@Param("id") id: number, @Res() res: Response) {
    await specialtyServices.deleteSpecialty(res, id);
  }
}

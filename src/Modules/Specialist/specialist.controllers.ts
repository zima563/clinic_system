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
    await specialtyServices.checkSpecialtyExist(body);
    let iconFilename = await specialtyServices.uploadFileForSpecialty(req, res);
    // Save the specialty to the database
    const specialty = await specialtyServices.createSpecialty(
      iconFilename,
      body,
      req.user.id
    );

    return res.status(200).json(specialty);
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
    let specialty = await specialtyServices.findSpecialtyById(id);
    if (!specialty) {
      throw new ApiError("specialty not found", 404);
    }
    await specialtyServices.checkSpecialtyExist(body);
    let fileName = await specialtyServices.uploadFileForSpecialtyUpdate(
      req,
      specialty
    );

    await specialtyServices.updateSpecialty(id, fileName, body);
    return res.status(200).json({ message: "specialty updated successfully" });
  }

  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allSpecialtys"))
  async allSpecialtys(@QueryParams() query: any, @Res() res: Response) {
    let data = await specialtyServices.getListSpecial(query);

    return res.status(200).json({
      data: data.result,
      pagination: data.pagination,
      count: data.result.length,
    });
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("getOneSpecialty"))
  async getOneSpecialty(@Param("id") id: number, @Res() res: Response) {
    let specialty = await specialtyServices.findSpecialtyById(id);
    if (!specialty) {
      throw new ApiError("specialty not found");
    }
    specialty.icon = process.env.base_url + specialty.icon;
    return res.status(200).json(specialty);
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("getOneSpecialty"))
  async DeleteSpecialty(@Param("id") id: number, @Res() res: Response) {
    let specialty = await specialtyServices.findSpecialtyById(id);
    if (!specialty) {
      throw new ApiError("specialty not found");
    }
    await specialtyServices.deleteSpecialty(id, specialty);
    return res.status(200).json({ message: "specialty deleted succesfully" });
  }
}

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
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as doctorServices from "./doctor.service";

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
    return await doctorServices.addDoctor(req, res, {
      ...body,
      createdBy: req.user?.id,
    });
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateDoctor"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(UpdateDoctorValidationSchema)
  )
  async updateDoctor(
    @Req() req: Request,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    return await doctorServices.updateDoctor(id, req, res, body);
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("listDoctors"))
  async listDoctors(@QueryParams() query: any, @Res() res: any) {
    return await doctorServices.getDoctors(res, query);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showDoctorDetails"))
  async showDoctorDetails(@Param("id") id: number, @Res() res: Response) {
    return await doctorServices.getDoctor(res, id);
  }

  @Patch("/:id")
  @UseBefore(...secureRouteWithPermissions("DeactiveDoctor"))
  async DeactiveDoctor(@Param("id") id: number, @Res() res: Response) {
    await doctorServices.deactiveOrActive(res, id);
  }
}

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
import { Request, Response } from "express";
import { createValidationMiddleware } from "../../middlewares/validation";
import ApiError from "../../utils/ApiError";
import createUploadMiddleware from "../../middlewares/uploadFile";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as services from "./services.service";
import { addServiceValidation, updateServiceValidation } from "./services.validation";

@JsonController("/api/services")
export class ServiceController {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addService"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(addServiceValidation)
  )
  async addService(@Req() req: any, @Body() body: any, @Res() res: Response) {
    return await services.createService(req, res, {
      ...body,
      createdBy: req.user?.id || 1,
    });
  }

  @Get("/")
  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allServices"))
  async allServices(@QueryParams() query: any, @Res() res: Response) {
    return await services.listServices(res, query);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateService"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(updateServiceValidation)
  )
  async updateService(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await services.updateService(req, res, id, body);
  }

  @Get("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("getService"),
    createValidationMiddleware(updateServiceValidation)
  )
  async getService(@Param("id") id: number, @Res() res: Response) {
    return await services.getService(res, id);
  }

  @Patch("/:id")
  @UseBefore(...secureRouteWithPermissions("deactiveService"))
  async deactiveService(@Param("id") id: number, @Res() res: Response) {
    return await services.deactiveService(res, id);
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("deactiveService"))
  async deleteService(@Param("id") id: number, @Res() res: Response) {
    return await services.deleteService(res, id);
  }
}

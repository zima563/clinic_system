import fs from "fs";
import path from "path";
import { ProtectRoutesMiddleware } from "./../../middlewares/protectedRoute";
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
import { Response } from "express";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addServiceValidation,
  updateServiceValidation,
} from "./services.validation";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
import createUploadMiddleware from "../../middlewares/uploadFile";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as services from "./services.service";
const prisma = new PrismaClient();

@JsonController("/api/services")
export class serviceController {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addService"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(addServiceValidation)
  )
  async addService(@Req() req: any, @Body() body: any, @Res() res: Response) {
    if (await prisma.service.findFirst({ where: { title: body.title } })) {
      throw new ApiError("service title already exists", 409);
    }

    body.icon = (await services.uploadFile(req, res)) ?? "";

    let service = await services.createService(body);
    return res.status(200).json(service);
  }

  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allServices"))
  async allServices(@QueryParams() query: any, @Res() res: Response) {
    const baseFilter = {
      isDeleted: false,
    };
    let data = await services.listServices(baseFilter, query);

    return res.status(200).json({
      data: data.result,
      pagination: data.pagination,
    });
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
    let service = await services.getServiceById(id);

    await services.CheckTitleExist(id, body.title);
    let fileName = await services.uploadFileForUpdate(req, service);
    await services.updateService(id, body, service, fileName);
    return res.status(200).json({ message: "service updated successfully" });
  }

  @Get("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("getService"),
    createValidationMiddleware(updateServiceValidation)
  )
  async getService(@Param("id") id: number, @Res() res: Response) {
    let service = await services.getServiceById(id);
    if (!service) {
      throw new ApiError("service not found", 404);
    }
    service.img = process.env.base_url + service.img;
    return res.status(200).json(service);
  }

  @Patch("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("deactiveService")
  )
  async deactiveService(@Param("id") id: number, @Res() res: Response) {
    let service = await services.getServiceById(id);
    if (!service) {
      throw new ApiError("service not found", 404);
    }
    await services.deactiveService(id, service);
    let updatedService = await services.getServiceById(id);
    return res.status(200).json(updatedService);
  }
}

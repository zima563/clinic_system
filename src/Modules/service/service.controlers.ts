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

const prisma = new PrismaClient();

@JsonController("/api/services")
export class serviceController {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("addService"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(addServiceValidation)
  )
  async addService(@Req() req: any, @Body() body: any, @Res() res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: "image file is required." });
    }
    if (await prisma.service.findFirst({ where: { title: body.title } })) {
      throw new ApiError("service title already exists", 409);
    }
    const cleanedFilename = req.file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.]/g, "");

    // Generate a unique filename
    const iconFilename = `icon-${uuidv4()}-${encodeURIComponent(
      cleanedFilename
    )}`;
    const iconPath = path.join("uploads", iconFilename);

    // Resize and save the icon using sharp
    await sharp(req.file.buffer)
      .resize(100, 100)
      .png({ quality: 80 })
      .toFile(iconPath);
    body.icon = iconFilename ?? "";

    let service = await prisma.service.create({
      data: {
        title: body.title,
        desc: body.desc,
        img: body.icon,
      },
    });
    return res.status(200).json(service);
  }

  @Get("/all")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("allServices"))
  async allServices(@QueryParams() query: any, @Res() res: Response) {
    try {
      const baseFilter = {
        isDeleted: false,
      };
      const apiFeatures = new ApiFeatures(prisma.service, query);

      await apiFeatures
        .filter(baseFilter)
        .sort()
        .limitedFields()
        .search("service");

      await apiFeatures.paginateWithCount();
      const { result, pagination } = await apiFeatures.exec("service");

      result.map((doc: any) => {
        doc.img = process.env.base_url + doc.img;
      });

      return res.status(200).json({
        data: result,
        pagination: pagination,
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  @Put("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateService"),
    createUploadMiddleware("icon"),
    createValidationMiddleware(updateServiceValidation)
  )
  async updateService(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    let service = await prisma.service.findUnique({ where: { id } });

    if (
      await prisma.service.findFirst({
        where: { title: body.title, NOT: { id } },
      })
    ) {
      throw new ApiError("service title already exists", 409);
    }
    let fileName;
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
      if (service?.img) {
        const oldImagePath = path.join("uploads", service?.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      fileName = newFilename;
    }

    await prisma.service.update({
      where: { id },
      data: {
        title: body.title || service?.title,
        desc: body.desc || service?.desc,
        img: fileName || service?.img,
      },
    });
    return res.status(200).json({ message: "service updated successfully" });
  }

  @Get("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("getService"),
    createValidationMiddleware(updateServiceValidation)
  )
  async getService(@Param("id") id: number, @Res() res: Response) {
    let service = await prisma.service.findUnique({
      where: { id },
    });
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
    let service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      throw new ApiError("service not found", 404);
    }
    if (service.status) {
      await prisma.service.update({
        where: { id },
        data: { status: false },
      });
    } else {
      await prisma.service.update({
        where: { id },
        data: { status: true },
      });
    }
    let updatedService = await prisma.service.findUnique({
      where: { id },
    });
    return res.status(200).json(updatedService);
  }
}

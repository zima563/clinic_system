import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import {
  Get,
  JsonController,
  QueryParams,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";

const prisma = new PrismaClient();

@JsonController("/api/search")
export class searchControllers {
  @Get("/")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("search"))
  async search(
    @Req() req: Request,
    @QueryParams() query: any,
    @Res() res: Response
  ) {
    const { keyword } = query;
    const doctors = await prisma.doctor.findMany({
      where: {
        OR: [{ name: { contains: keyword } }, { phone: { contains: keyword } }],
      },
    });
    const patient = await prisma.patient.findMany({
      where: {
        OR: [{ name: { contains: keyword } }, { phone: { contains: keyword } }],
      },
    });
    const sevices = await prisma.service.findMany({
      where: {
        OR: [{ title: { contains: keyword } }, { desc: { contains: keyword } }],
      },
    });
    const specialty = await prisma.specialty.findMany({
      where: {
        OR: [{ title: { contains: keyword } }],
      },
    });
    return res.status(200).json({
      doctors,
      patient,
      sevices,
      specialty,
    });
  }
}

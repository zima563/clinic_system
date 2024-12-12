import { Visit } from "./../../../node_modules/.prisma/client/index.d";
import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  QueryParam,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { createVisitSchema } from "./visit.validation";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
const prisma = new PrismaClient();

@JsonController("/api/visit")
export class visitController {
  @Post("/")
  @UseBefore(createValidationMiddleware(createVisitSchema))
  async createVisit(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    const { visitDetails } = body;
    const total = visitDetails.reduce(
      (sum: number, detail: any) => sum + detail.price,
      0
    );

    const visit = await prisma.visit.create({
      data: {
        total,
      },
    });
    const createdVisitDetails = await prisma.visitDetail.createMany({
      data: visitDetails.map((detail: any) => ({
        visitId: visit.id,
        patientId: detail.patientId,
        status: detail.status,
        price: detail.price,
        scheduleId: detail.scheduleId,
      })),
    });
    const invoice = await prisma.invoice.create({
      data: {
        total,
      },
    });
    for (const invoiceData of visitDetails) {
      const invoiceDetail = await prisma.invoiceDetail.create({
        data: {
          description: visit.rf,
          amount: invoiceData.price,
          invoiceId: invoice.id, // Link the invoice detail to the invoice
        },
      });
    }
    return res.status(201).json({
      message: "Visit created successfully with associated invoice details.",
      visit,
      visitDetails: createdVisitDetails,
      invoice,
    });
  }

  @Get("/:id")
  async showVisitDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let visit = await prisma.visit.findUnique({ where: { id } });
    if (!visit) {
      throw new ApiError("visit not found");
    }
    let VisitDetails = await prisma.visitDetail.findMany({
      where: { visitId: id },
      include: {},
    });
    return res.status(200).json({
      data: VisitDetails,
      total: visit.total,
    });
  }

  @Get("/")
  async getAllVisits(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam("patientId") patientId?: number
  ) {
    let filter: any = {};
    if (patientId) {
      filter.patientId = patientId;
    }
    let visits = await prisma.visit.findMany({
      where: {
        details: {
          some: {
            patientId,
          },
        },
      },
      include: {
        details: true,
      },
    });
    return res.status(200).json({
      data: visits,
      count: visits.length,
    });
  }
}

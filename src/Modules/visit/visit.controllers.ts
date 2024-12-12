import {
  Body,
  JsonController,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { createVisitSchema } from "./visit.validation";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
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
}

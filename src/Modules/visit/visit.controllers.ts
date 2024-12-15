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
import { appendVisitSchema, createVisitSchema } from "./visit.validation";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { Decimal } from "@prisma/client/runtime/library";
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

    // Calculate total from visitDetails
    const total = visitDetails.reduce(
      (sum: number, detail: any) => sum + detail.price,
      0
    );

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create visit
      const visit = await prisma.visit.create({
        data: {
          total,
        },
      });

      // Create visit details
      const createdVisitDetails = await Promise.all(
        visitDetails.map(async (detail: any) =>
          prisma.visitDetail.create({
            data: {
              visitId: visit.id,
              patientId: detail.patientId,
              status: detail.status,
              price: detail.price,
              scheduleId: detail.scheduleId,
            },
          })
        )
      );

      // Create invoice with a unique RF (reference)
      const invoice = await prisma.invoice.create({
        data: {
          total,
        },
      });

      // Link visit and invoice
      await prisma.visitInvoice.create({
        data: {
          visitId: visit.id,
          invoiceId: invoice.id,
        },
      });

      // Create invoice details linked to visit details
      const createdInvoiceDetails = await Promise.all(
        createdVisitDetails.map((visitDetail) =>
          prisma.invoiceDetail.create({
            data: {
              description: `Detail for schedule ${visitDetail.scheduleId}`, // Customize description as needed
              amount: visitDetail.price,
              invoiceId: invoice.id,
              visitDetailsId: visitDetail.id, // Link InvoiceDetail to VisitDetail
            },
          })
        )
      );

      return { visit, createdVisitDetails, invoice, createdInvoiceDetails };
    });
    return res.status(201).json({
      message: "Visit created successfully with associated invoice details.",
      ...result,
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

  //   @Post("/:visitId/details")
  //   @UseBefore(createValidationMiddleware(appendVisitSchema))
  //   async appendVisitDetails(
  //     @Req() req: Request,
  //     @Body() body: any,
  //     @Param("visitId") visitId: number,
  //     @Res() res: Response
  //   ) {
  //     const { visitDetails } = body;

  //     const visit = await prisma.visit.findUnique({ where: { id: visitId } });
  //     if (!visit) {
  //       throw new ApiError("visit not found");
  //     }

  //     let visitInvoice = await prisma.visitInvoice.findFirst({
  //       where: { visitId },
  //       include: {
  //         invoice: true,
  //       },
  //     });
  //     if (!visitInvoice) {
  //       throw new ApiError("visit invoice not found");
  //     }
  //     const createdVisitDetails = await prisma.visitDetail.createMany({
  //       data: visitDetails.map((detail: any) => ({
  //         visitId,
  //         patientId: detail.patientId,
  //         status: detail.status,
  //         price: detail.price,
  //         scheduleId: detail.scheduleId,
  //       })),
  //     });

  //     for (const detail of visitDetails) {
  //       await prisma.invoiceDetail.create({
  //         data: {
  //           description: `Charge for patient ${visit.rf}`,
  //           amount: detail.price,
  //           invoiceId: visitInvoice?.invoiceId,
  //         },
  //       });
  //     }
  //     const totalVisitPrice = visitDetails.reduce(
  //       (sum: number, detail: any) => sum + parseFloat(detail.price),
  //       0
  //     );

  //     const roundedTotalVisitPrice = new Decimal(totalVisitPrice).toFixed(2);

  //     await prisma.visit.update({
  //       where: { id: visitId },
  //       data: { total: visit.total.add(new Decimal(roundedTotalVisitPrice)) },
  //     });

  //     await prisma.invoice.update({
  //       where: { id: visitInvoice.invoiceId },
  //       data: {
  //         total: visitInvoice.invoice.total.add(
  //           new Decimal(roundedTotalVisitPrice)
  //         ),
  //       },
  //     });

  //     return res
  //       .status(200)
  //       .json({ message: "visit details updated successfully" });
  //   }
}

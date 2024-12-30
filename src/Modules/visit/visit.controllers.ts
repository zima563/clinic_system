import { ProtectRoutesMiddleware } from "./../../middlewares/protectedRoute";
import { Visit } from "./../../../node_modules/.prisma/client/index.d";
import {
  Body,
  Delete,
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
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
const prisma = new PrismaClient();

@JsonController("/api/visit")
export class visitController {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("createVisit"),
    createValidationMiddleware(createVisitSchema)
  )
  async createVisit(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    const { patientId, visitDetails, paymentMethod } = body;

    const fetchPriceForSchedule = async (scheduleId: number) => {
      let schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
      });
      return schedule?.price;
    };

    const visitDetailsWithPrices = await Promise.all(
      visitDetails.map(async (detail: any) => ({
        ...detail,
        price: await fetchPriceForSchedule(detail.scheduleId),
        patientId, // Ensure patientId is included for each detail
      }))
    );

    const total = visitDetailsWithPrices.reduce(
      (sum: number, detail: any) => sum + detail.price,
      0
    );

    const result = await prisma.$transaction(async (prisma) => {
      // Create a Visit record
      const visit = await prisma.visit.create({
        data: {
          total,
          paymentMethod, // Or dynamically set based on request
        },
      });

      // Create visit details
      const createdVisitDetails = await Promise.all(
        visitDetailsWithPrices.map(async (detail: any) =>
          prisma.visitDetail.create({
            data: {
              visitId: visit.id,
              patientId: detail.patientId,
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
          ex: true,
          paymentMethod,
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
    if (body.appointmentId) {
      let appointment = await prisma.appointment.update({
        where: {
          id: body.appointmentId,
        },
        data: {
          status: "confirmed",
        },
      });
    }
    return res.status(201).json({
      message: "Visit created successfully with associated invoice details.",
      ...result,
    });
  }

  @Get("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("showVisitDetails")
  )
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
      include: {
        patient: true,
        schedule: true,
        visit: true,
      },
    });
    return res.status(200).json({
      data: VisitDetails,
      total: visit.total,
    });
  }

  @Get("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("getAllVisits")
  )
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

  @Post("/:visitId/details")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("appendVisitDetails"),
    createValidationMiddleware(appendVisitSchema)
  )
  async appendVisitDetails(
    @Req() req: Request,
    @Body() body: any,
    @Param("visitId") visitId: number,
    @Res() res: Response
  ) {
    const { visitDetails } = body;

    // Ensure the visit exists
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) {
      throw new ApiError("Visit not found");
    }

    // Check if the visit has an associated invoice
    let visitInvoice = await prisma.visitInvoice.findFirst({
      where: { visitId },
      include: { invoice: true },
    });
    if (!visitInvoice) {
      throw new ApiError("Visit invoice not found");
    }

    // Start a Prisma transaction to ensure atomic operations
    const result = await prisma.$transaction(async (prisma) => {
      // Add the new visit details
      const createdVisitDetails = await prisma.visitDetail.createMany({
        data: visitDetails.map((detail: any) => ({
          visitId,
          patientId: detail.patientId,
          status: detail.status,
          price: detail.price,
          scheduleId: detail.scheduleId,
        })),
      });

      // Link each InvoiceDetail to the corresponding VisitDetail
      for (let i = 0; i < visitDetails.length; i++) {
        const visitDetail = await prisma.visitDetail.findFirst({
          where: { visitId, scheduleId: visitDetails[i].scheduleId },
        });

        // Create invoice detail and link to the visit detail
        if (visitDetail) {
          await prisma.invoiceDetail.create({
            data: {
              description: `Charge for patient ${visit.rf}`, // Customize description
              amount: visitDetails[i].price,
              invoiceId: visitInvoice?.invoiceId,
              visitDetailsId: visitDetail.id, // Link to the VisitDetail
            },
          });
        }
      }

      // Calculate the total amount to be added
      const totalVisitPrice = visitDetails.reduce(
        (sum: number, detail: any) => sum + parseFloat(detail.price),
        0
      );

      // Use Decimal to ensure precision in financial calculations
      const roundedTotalVisitPrice = new Decimal(totalVisitPrice).toFixed(2);

      // Update the visit's total cost
      await prisma.visit.update({
        where: { id: visitId },
        data: { total: visit.total.add(new Decimal(roundedTotalVisitPrice)) },
      });

      // Update the invoice's total cost
      await prisma.invoice.update({
        where: { id: visitInvoice.invoiceId },
        data: {
          total: visitInvoice.invoice.total.add(
            new Decimal(roundedTotalVisitPrice)
          ),
        },
      });

      return { createdVisitDetails, visitInvoice };
    });

    return res.status(200).json({
      message: "Visit details updated successfully",
    });
  }

  @Delete("/:visitId/details/:visitDetailId")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("removeVisitDetails")
  )
  async removeVisitDetails(
    @Req() req: Request,
    @Param("visitDetailId") visitDetailId: number,
    @Param("visitId") visitId: number,
    @Res() res: Response
  ) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) {
      throw new ApiError("Visit not found");
    }

    let visitInvoice = await prisma.visitInvoice.findFirst({
      where: { visitId },
      include: { invoice: true },
    });
    if (!visitInvoice) {
      throw new ApiError("Visit invoice not found");
    }

    // Fetch visit details related to this visit
    const visitDetail = await prisma.visitDetail.findUnique({
      where: { id: visitDetailId },
      include: { invoiceDetail: true }, // Include related invoice details
    });
    if (!visitDetail) {
      throw new ApiError("visit detail not found");
    }

    const result = await prisma.$transaction(async (prisma) => {
      await prisma.invoiceDetail.deleteMany({
        where: { visitDetailsId: visitDetail.id },
      });

      await prisma.visitDetail.delete({
        where: { id: visitDetailId },
      });

      const totalVisitPrice =
        visit.total.toNumber() - parseFloat(visitDetail.price.toString());
      const updatedVisitTotal = new Decimal(totalVisitPrice);

      await prisma.visit.update({
        where: { id: visitId },
        data: { total: updatedVisitTotal },
      });

      const totalInvoicePrice = visitInvoice?.invoice.total.toNumber() || 0;
      const updatedInvoiceTotal = new Decimal(totalInvoicePrice).sub(
        new Decimal(visitDetail.price.toString())
      );

      await prisma.invoice.update({
        where: { id: visitInvoice.invoiceId },
        data: { total: updatedInvoiceTotal },
      });
    });

    return res.status(200).json({
      message: "Visit details removed successfully",
    });
  }

  @Delete("/:id")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("deleteVisit"))
  async deleteVisit(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let visit = await prisma.visit.findUnique({
      where: { id },
      include: {
        details: true,
        VisitInvoice: {
          include: {
            invoice: {
              include: { details: true },
            },
          },
        },
      },
    });
    if (!visit) {
      throw new ApiError("visit not found", 404);
    }

    await prisma.$transaction(async (prisma) => {
      for (const VisitInvoice of visit.VisitInvoice) {
        const invoiceId = VisitInvoice.invoiceId;
        await prisma.invoiceDetail.deleteMany({
          where: { invoiceId },
        });

        await prisma.visitDetail.deleteMany({
          where: { visitId: id },
        });

        await prisma.visitInvoice.deleteMany({
          where: { visitId: id },
        });

        await prisma.invoice.delete({
          where: { id: invoiceId },
        });

        await prisma.visit.delete({
          where: { id },
        });
      }
    });

    return res
      .status(200)
      .json({ message: "Visit and all related data deleted successfully." });
  }
}

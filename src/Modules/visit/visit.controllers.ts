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
  QueryParams,
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
import ApiFeatures from "../../utils/ApiFeatures";
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
          createdBy: req.user?.id || 0,
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
              dateId: detail.dateId,
              createdBy: req.user?.id || 0,
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
          createdBy: req.user?.id || 0,
        },
      });

      // Link visit and invoice
      await prisma.visitInvoice.create({
        data: {
          visitId: visit.id,
          invoiceId: invoice.id,
          createdBy: req.user?.id || 0,
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
              createdBy: req.user?.id || 0,
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

  @Get("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("getAllVisits")
  )
  async getAllVisits(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParams() query: any
  ) {
    if (query.patientId) {
      query.patientId = parseInt(query.patientId, 10);
    }

    const apiFeatures = new ApiFeatures(prisma.visit, query);

    // Apply the filter for visits
    await apiFeatures
      .filter()
      .sort()
      .limitedFields()
      .search("visit")
      .paginateWithCount();

    // Use the correct query to get the result and pagination data
    const { result, pagination } = await apiFeatures.exec("visit");

    // Return the response
    return res.status(200).json({
      visits: result,
      pagination,
      count: result.length,
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
      select: {
        id: true,
        price: true,
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        schedule: {
          select: {
            id: true,
            price: true,
            service: {
              select: {
                id: true,
                title: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        date: {
          select: {
            id: true,
            fromTime: true,
            toTime: true,
          },
        },
      },
    });
    return res.status(200).json({
      VisitDetails,
      visit,
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
    const { visitDetails, patientId } = body;

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
        patientId,
      }))
    );

    const totalVisitPrice = visitDetailsWithPrices.reduce(
      (sum: number, detail: any) => sum + detail.price,
      0
    );

    const result = await prisma.$transaction(async (prisma) => {
      const createdVisitDetails = await Promise.all(
        visitDetailsWithPrices.map((detail) =>
          prisma.visitDetail.create({
            data: {
              visitId: visit.id,
              patientId: detail.patientId,
              price: detail.price,
              scheduleId: detail.scheduleId,
              dateId: detail.dateId,
              createdBy: req.user?.id || 0,
            },
          })
        )
      );

      // Create InvoiceDetails for each VisitDetail
      await Promise.all(
        createdVisitDetails.map((visitDetail, index) =>
          prisma.invoiceDetail.create({
            data: {
              description: `Charge for patient ${visit.rf}`, // Customize description if necessary
              amount: visitDetailsWithPrices[index].price,
              invoiceId: visitInvoice.invoiceId,
              visitDetailsId: visitDetail.id,
              createdBy: req.user?.id || 0,
            },
          })
        )
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

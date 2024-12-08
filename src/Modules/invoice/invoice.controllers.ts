import { PrismaClient } from "@prisma/client";

import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import ApiFeatures from "../../utils/ApiFeatures";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addInvoiceDetailValidation,
  updateInvoiceDetailValidation,
} from "./invoive.validation";
import ApiError from "../../utils/ApiError";
import { Decimal } from "@prisma/client/runtime/library";
import { Response } from "express";
const prisma = new PrismaClient();

@JsonController("/api/invoice")
export class invoiceControllers {
  @Post("/")
  @UseBefore(createValidationMiddleware(addInvoiceDetailValidation))
  async createInvoice(
    @Req() req: any,
    @Body() body: any,
    @Res() res: Response
  ) {
    let invoice = await prisma.invoice.create({
      data: {
        total: body.amount,
      },
    });

    let invoiceDetails = await prisma.invoiceDetail.create({
      data: {
        invoiceId: invoice.id,
        ...body,
      },
      include: {
        invoice: true,
      },
    });

    return res
      .status(200)
      .json({ message: "invoice created successfully", invoiceDetails });
  }

  @Get("/")
  async listInvoice(@Req() req: any, @Res() res: Response) {
    const apiFeatures = new ApiFeatures(prisma.invoice, req.query);

    // Apply filtering, sorting, and pagination
    await apiFeatures.filter().sort().paginateWithCount();

    const { result, pagination } = await apiFeatures.exec("invoice");

    // Calculate the total sum of all `total` values for the filtered results
    const totalSum = await prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
      where: apiFeatures.query.where, // Use the same filtering logic
    });

    return res.status(200).json({
      data: result,
      pagination,
      total: totalSum._sum.total || 0,
    });
  }

  @Put("/:id")
  @UseBefore(createValidationMiddleware(updateInvoiceDetailValidation))
  async updateInvoiceDetail(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    const invoiceDetail = await prisma.invoiceDetail.findUnique({
      where: { id },
    });

    if (!invoiceDetail) {
      throw new ApiError("invoiceDetail not found");
    }

    if (body.amount) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceDetail.invoiceId },
      });

      if (
        !(invoice?.total instanceof Decimal) ||
        !(invoiceDetail.amount instanceof Decimal)
      ) {
        throw new ApiError("Invalid data for amount calculation");
      }

      // Convert values to Decimal if necessary
      const invoiceTotal = new Decimal(invoice?.total || 0);
      const invoiceDetailAmount = new Decimal(invoiceDetail.amount || 0);
      const bodyAmount = new Decimal(body.amount || 0);
      const finalTotal = invoiceTotal
        .minus(invoiceDetailAmount)
        .plus(bodyAmount);

      await prisma.invoice.update({
        where: { id: invoiceDetail.invoiceId },
        data: { total: finalTotal },
      });
    }

    await prisma.invoiceDetail.update({
      where: { id },
      data: body,
    });

    return res.json({ message: "invoiceDetail updated Successfully" });
  }

  @Get("/:id")
  async Show_Invoice_Details(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let Invoice = await prisma.invoice.findUnique({
      where: {
        id,
      },
      include: {
        details: true,
      },
    });
    if (!Invoice) {
      throw new ApiError("invoice not found", 404);
    }
    return res.status(200).json(Invoice);
  }
}

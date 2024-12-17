import { ProtectRoutesMiddleware } from "./../../middlewares/protectedRoute";
import { PrismaClient } from "@prisma/client";

import {
  Body,
  Delete,
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
  appendInvoiceDetailValidation,
  updateInvoiceDetailValidation,
} from "./invoive.validation";
import ApiError from "../../utils/ApiError";
import { Decimal } from "@prisma/client/runtime/library";
import { Response } from "express";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
const prisma = new PrismaClient();

@JsonController("/api/invoice")
export class invoiceControllers {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("createInvoice"),
    createValidationMiddleware(addInvoiceDetailValidation)
  )
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
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("listInvoice"))
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
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateInvoiceDetail"),
    createValidationMiddleware(updateInvoiceDetailValidation)
  )
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
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("Show_Invoice_Details")
  )
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

  @Get("/list/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("List_Invoice_Details")
  )
  async List_Invoice_Details(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let Invoice = await prisma.invoiceDetail.findMany({
      where: { invoiceId: id },
    });
    // Calculate the total amount using reduce
    const total = Invoice.reduce((acc: Decimal, Invoice) => {
      return acc.plus(Invoice.amount);
    }, new Decimal(0));
    return res.status(200).json({
      Invoice,
      total,
    });
  }

  @Post("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("Append_Invoice_Details"),
    createValidationMiddleware(appendInvoiceDetailValidation)
  )
  async Append_Invoice_Details(
    @Req() req: any,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        details: true,
      },
    });

    const invoiceTotal = new Decimal(invoice?.total || 0);
    const bodyAmount = new Decimal(body.amount || 0);
    const finalTotal = invoiceTotal.plus(bodyAmount);
    await prisma.invoice.update({
      where: { id },
      data: { total: finalTotal },
    });

    await prisma.invoiceDetail.create({
      data: {
        invoiceId: id,
        ...body,
      },
      include: {
        invoice: true,
      },
    });
    const invoiceAfter = await prisma.invoice.findUnique({
      where: { id },
      include: {
        details: true,
      },
    });
    return res
      .status(200)
      .json({ message: "invoice appended successfully", invoiceAfter });
  }

  @Delete("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("Remove_Invoice_Details")
  )
  async Remove_Invoice_Details(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let invoiceDetail = await prisma.invoiceDetail.findUnique({
      where: {
        id,
      },
    });
    if (!invoiceDetail) {
      throw new ApiError("invoice Details not found", 404);
    }
    let invoice = await prisma.invoice.findUnique({
      where: { id: invoiceDetail.invoiceId },
    });

    const invoiceTotal = new Decimal(invoice?.total || 0);
    const invoiceDetailAmount = new Decimal(invoiceDetail.amount || 0);
    const finalTotal = invoiceTotal.minus(invoiceDetailAmount);
    await prisma.invoice.update({
      where: { id: invoiceDetail.invoiceId },
      data: { total: finalTotal },
    });
    await prisma.invoiceDetail.delete({
      where: { id },
    });
    const invoiceAfter = await prisma.invoice.findUnique({
      where: { id: invoiceDetail.invoiceId },
      include: {
        details: true,
      },
    });

    return res
      .status(200)
      .json({ message: "invoice details removed successfully", invoiceAfter });
  }
}

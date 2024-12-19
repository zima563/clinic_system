import fs from "fs";

import { ProtectRoutesMiddleware } from "./../../middlewares/protectedRoute";
import { PrismaClient } from "@prisma/client";
import pdfCreator from "pdf-creator-node";
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
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
import { Request, Response } from "express";
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
        ex: false,
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

  @Get("/summarized-report")
  async summarized_report(
    @QueryParams() query: { date?: string; month?: string },
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { date, month } = query;
    if (!date && !month) {
      throw new ApiError(
        "You must provide either a specific date or a month in the format YYYY-MM."
      );
    }

    let startDate: Date = new Date();
    let endDate: Date = new Date();

    if (date) {
      // For specific day
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1); // End of the day
    } else if (month) {
      // For specific month
      startDate = new Date(`${month}-01`);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // End of the month
    }

    const [exTrueTotal, exFalseTotal, invoices] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          ex: true,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          ex: false,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          details: true, // Include related invoice details
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const totalExTrue = exTrueTotal._sum.total
      ? exTrueTotal._sum.total.toNumber()
      : 0;
    const totalExFalse = exFalseTotal._sum.total
      ? exFalseTotal._sum.total.toNumber()
      : 0;
    const profit = totalExTrue - totalExFalse;

    return res.status(200).json({
      incomes: totalExTrue,
      expen: totalExFalse,
      invoiceCount: invoices.length,
      reportDate: date || month,
      profit,
      invoices,
    });
  }

  @Get("/summarized-report/pdf")
  async downloadPdf(
    @QueryParams() query: { date?: string; month?: string },
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { date, month } = query;

    if (!date && !month) {
      throw new ApiError(
        "You must provide either a specific date or a month in the format YYYY-MM."
      );
    }

    let startDate: Date = new Date();
    let endDate: Date = new Date();

    if (date) {
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
    } else if (month) {
      startDate = new Date(`${month}-01`);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const [exTrueTotal, exFalseTotal, invoices] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          ex: true,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          ex: false,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          details: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const totalExTrue = exTrueTotal._sum.total
      ? exTrueTotal._sum.total.toNumber()
      : 0;
    const totalExFalse = exFalseTotal._sum.total
      ? exFalseTotal._sum.total.toNumber()
      : 0;
    const profit = totalExTrue - totalExFalse;

    // Prepare the HTML content for the PDF
    const html = `
  <html>
    <head>
      <style>
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 8px; text-align: left; }
        h2 { text-align: center; }
        .success { color: green; font-weight: bold; }
        .danger { color: red; font-weight: bold; }
        .total-row { font-weight: bold; text-align: right; background-color: #f0f0f0; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">Invoice Summarized Report</h1>
      <p>Report Date: ${date || month || "N/A"}</p>
     <p>Total Income (Ex True): <span class="success">${
       totalExTrue || 0
     }</span></p>
      <p>Total Expense (Ex False): <span class="danger">${
        totalExFalse || 0
      }</span></p>
      <p>Profit: ${
        profit >= 0
          ? `<span class="success">${profit}</span>`
          : `<span class="danger">(${Math.abs(profit)})</span>`
      }</p>
      <p>Total Invoices: ${invoices.length || 0}</p>
      
      <h2>Invoice Details:</h2>
      ${invoices
        .map(
          (invoice) => `
          <h3>Invoice ID: ${invoice.id}</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.details
                .map(
                  (detail) => `
                  <tr>
                    <td>${
                      new Date(invoice.createdAt).toISOString().split("T")[0]
                    }</td>
                    <td>${detail.description}</td>
                    <td>${detail.amount}</td>
                  </tr>
                `
                )
                .join("")}
                <tr class="total-row">
                <td colspan="2">Total</td>
        ${
          invoice.ex
            ? `<td class="success" >${invoice.total}</td>`
            : `<td  class="danger">${invoice.total}</td>`
        }
              </tr>
            </tbody>
          </table>
        `
        )
        .join("")}
    </body>
  </html>
`;

    // Define PDF options
    const options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
    };

    // Define the PDF document
    const document = {
      html,
      data: {},
      type: "buffer", // Add any additional data if needed
    };

    try {
      // Create the PDF and stream it directly to the response
      const result = await pdfCreator.create(document, options);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=invoice_report.pdf"
      );
      return res.end(result);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
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

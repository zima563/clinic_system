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
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addInvoiceDetailValidation,
  appendInvoiceDetailValidation,
  updateInvoiceDetailValidation,
} from "./invoive.validation";
import ApiError from "../../utils/ApiError";
import { Decimal } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as invoiceService from "./invoice.service";
@JsonController("/api/invoice")
export class invoiceControllers {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("createInvoice"),
    createValidationMiddleware(addInvoiceDetailValidation)
  )
  async createInvoice(
    @Req() req: any,
    @Body() body: any,
    @Res() res: Response
  ) {
    let invoice = await invoiceService.createInvoice(body.amount);

    let invoiceDetails = await invoiceService.createInvoiceDetails(
      invoice.id,
      body
    );

    return res
      .status(200)
      .json({ message: "invoice created successfully", invoiceDetails });
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("listInvoice"))
  async listInvoice(@Req() req: any, @Res() res: Response) {
    const data = await invoiceService.listInvoice(req.query);

    return res.status(200).json({
      data: data.result,
      pagination: data.pagination,
      total: data.totalSum._sum.total || 0,
    });
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateInvoiceDetail"),
    createValidationMiddleware(updateInvoiceDetailValidation)
  )
  async updateInvoiceDetail(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    const invoiceDetail = await invoiceService.getInvoiceDetails(id);

    if (!invoiceDetail) {
      throw new ApiError("invoiceDetail not found");
    }

    await invoiceService.updateInvoice(id, body, invoiceDetail);

    return res.json({ message: "invoiceDetail updated Successfully" });
  }

  @Get("/summarized-report")
  @UseBefore(...secureRouteWithPermissions("summarized_report"))
  async summarized_report(
    @QueryParams() query: { date: string; month: string },
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { date, month } = query;
    const data = await invoiceService.summeryInvoice(date, month);

    return res.status(200).json({
      incomes: data.totalExTrue,
      expen: data.totalExFalse,
      invoiceCount: data.invoices.length,
      reportDate: date || month,
      profit: data.profit,
      invoices: data.invoices,
    });
  }

  @Get("/summarized-report/pdf")
  @UseBefore(...secureRouteWithPermissions("downloadPdf"))
  async downloadPdf(
    @QueryParams() query: { date: string; month: string },
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { date, month } = query;

    const result = await invoiceService.pdf_summary(date, month, res);

    return res.end(result);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("Show_Invoice_Details"))
  async Show_Invoice_Details(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let Invoice = await invoiceService.showInvoiceDetails(id);
    if (!Invoice) {
      throw new ApiError("invoice not found", 404);
    }
    return res.status(200).json(Invoice);
  }

  @Get("/list/:id")
  @UseBefore(...secureRouteWithPermissions("List_Invoice_Details"))
  async List_Invoice_Details(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let Invoice = await invoiceService.listInvoiceDetails(id);
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
    ...secureRouteWithPermissions("Append_Invoice_Details"),
    createValidationMiddleware(appendInvoiceDetailValidation)
  )
  async Append_Invoice_Details(
    @Req() req: any,
    @Body() body: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    const invoice = await invoiceService.getInvoiceWithDetails(id);

    await invoiceService.appendInvoiceDetail(id, invoice, body);

    const invoiceAfter = await invoiceService.getInvoiceWithDetails(id);
    return res
      .status(200)
      .json({ message: "invoice appended successfully", invoiceAfter });
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("Remove_Invoice_Details"))
  async Remove_Invoice_Details(
    @Req() req: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let invoiceDetail = await invoiceService.getInvoiceDetails(id);
    if (!invoiceDetail) {
      throw new ApiError("invoice Details not found", 404);
    }
    let invoice = await invoiceService.getInvoiceWithDetails(
      invoiceDetail.invoiceId
    );

    await invoiceService.removeInvoiceDetail(id, invoice, invoiceDetail);
    const invoiceAfter = await invoiceService.getInvoiceWithDetails(
      invoiceDetail.invoiceId
    );

    return res
      .status(200)
      .json({ message: "invoice details removed successfully", invoiceAfter });
  }
}

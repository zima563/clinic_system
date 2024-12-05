import { PrismaClient } from "@prisma/client";
import {
  Body,
  Get,
  JsonController,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import ApiFeatures from "../../utils/ApiFeatures";
import { createValidationMiddleware } from "../../middlewares/validation";
import addInvoiceDetailValidation from "./invoive.validation";
const prisma = new PrismaClient();

@JsonController("/api/invoice")
export class invoiceControllers {
  @Post("/")
  @UseBefore(createValidationMiddleware(addInvoiceDetailValidation))
  async createInvoice(@Req() req: any, @Body() body: any, @Res() res: any) {
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
  async listInvoice(@Req() req: any, @Res() res: any) {
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
      success: true,
      data: result,
      pagination,
      total: totalSum._sum.total || 0,
    });
  }
}

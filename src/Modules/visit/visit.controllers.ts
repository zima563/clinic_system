import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";

import { createValidationMiddleware } from "../../middlewares/validation";
import { appendVisitSchema, createVisitSchema } from "./visit.validation";
import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";

import * as visitServices from "./visit.service";

@JsonController("/api/visit")
export class visitController {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("createVisit"),
    createValidationMiddleware(createVisitSchema)
  )
  async createVisit(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    const { patientId, visitDetails, paymentMethod } = body;

    const visitDetailsWithPrices = await Promise.all(
      visitDetails.map(async (detail: any) => ({
        ...detail,
        price: await visitServices.fetchPriceForSchedule(detail.scheduleId),
        patientId, // Ensure patientId is included for each detail
      }))
    );

    const total = visitDetailsWithPrices.reduce(
      (sum: number, detail: any) => sum + detail.price,
      0
    );

    const result = await visitServices.createVisit(
      total,
      paymentMethod,
      req,
      visitDetailsWithPrices
    );
    if (body.appointmentId) {
      await visitServices.updateAppointmentToComfirmed(body.appointmentId);
    }
    return res.status(201).json({
      message: "Visit created successfully with associated invoice details.",
      ...result,
    });
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("getAllVisits"))
  async getAllVisits(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParams() query: any
  ) {
    let data = await visitServices.getAllVisits(query);
    // Return the response
    return res.status(200).json({
      visits: data.result,
      pagination: data.pagination,
      count: data.result.length,
    });
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("showVisitDetails"))
  async showVisitDetails(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let visit = await visitServices.getVisitById(id);
    if (!visit) {
      throw new ApiError("visit not found");
    }
    let VisitDetails = await visitServices.getVisitDetails(id);
    return res.status(200).json({
      VisitDetails,
      visit,
    });
  }

  @Post("/:visitId/details")
  @UseBefore(
    ...secureRouteWithPermissions("appendVisitDetails"),
    createValidationMiddleware(appendVisitSchema)
  )
  async appendVisitDetails(
    @Req() req: Request,
    @Body() body: any,
    @Param("visitId") visitId: number,
    @Res() res: Response
  ) {
    const { visitDetails, patientId } = body;

    const visit = await visitServices.getVisitById(visitId);
    if (!visit) {
      throw new ApiError("Visit not found");
    }

    let visitInvoice = await visitServices.getVisitInvoice(visitId);
    if (!visitInvoice) {
      throw new ApiError("Visit invoice not found");
    }

    const visitDetailsWithPrices = await Promise.all(
      visitDetails.map(async (detail: any) => ({
        ...detail,
        price: await visitServices.fetchPriceForSchedule(detail.scheduleId),
        patientId,
      }))
    );

    const totalVisitPrice = visitDetailsWithPrices.reduce(
      (sum: number, detail: any) => sum + detail.price,
      0
    );

    await visitServices.appendVisitDetails(
      visitDetailsWithPrices,
      visit,
      req,
      visitInvoice,
      totalVisitPrice,
      visitId
    );

    return res.status(200).json({
      message: "Visit details updated successfully",
    });
  }

  @Delete("/:visitId/details/:visitDetailId")
  @UseBefore(...secureRouteWithPermissions("removeVisitDetails"))
  async removeVisitDetails(
    @Req() req: Request,
    @Param("visitDetailId") visitDetailId: number,
    @Param("visitId") visitId: number,
    @Res() res: Response
  ) {
    const visit = await visitServices.getVisitById(visitId);
    if (!visit) {
      throw new ApiError("Visit not found");
    }

    let visitInvoice = await visitServices.getVisitInvoice(visitId);
    if (!visitInvoice) {
      throw new ApiError("Visit invoice not found");
    }

    // Fetch visit details related to this visit
    const visitDetail = await visitServices.getVisitDetailsWithInclude(
      visitDetailId
    );
    if (!visitDetail) {
      throw new ApiError("visit detail not found");
    }

    await visitServices.removeVisitDetails(
      visitDetail,
      visitDetailId,
      visit,
      visitId,
      visitInvoice
    );
    return res.status(200).json({
      message: "Visit details removed successfully",
    });
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("deleteVisit"))
  async deleteVisit(
    @Req() req: Request,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let visit = await visitServices.getVisitIncludeInvoiceDetails(id);
    if (!visit) {
      throw new ApiError("visit not found", 404);
    }

    await visitServices.deleteVisitAndDeleteAllRelatedData(id, visit);

    return res
      .status(200)
      .json({ message: "Visit and all related data deleted successfully." });
  }
}

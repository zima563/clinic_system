import { Response } from "express";
import { Get, JsonController, Res, UseBefore } from "routing-controllers";
import * as dashboardService from "./dashboard.service";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";

@JsonController("/api/dashboard")
export class dashboardControllers {
  @Get("/stats")
  @UseBefore(...secureRouteWithPermissions("profile"))
  async getStats(@Res() res: Response) {
    return await dashboardService.getDashboardStats(res);
  }
}

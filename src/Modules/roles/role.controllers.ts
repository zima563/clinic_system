import { Request, Response } from "express";
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
import ApiError from "../../utils/ApiError";
import {
  assignRoleToUserValidation,
  createRoleValidation,
  updateRoleValidation,
} from "./role.validation";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as RoleService from "./role.service";

@JsonController("/api/roles")
export class roleControllers {
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("createRole"),
    createValidationMiddleware(createRoleValidation)
  )
  async createRole(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await RoleService.createRole(res, {
      createdBy: req.user?.id,
      ...body,
    });
  }

  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allRoles"))
  async allRoles(@QueryParams() query: any, @Res() res: Response) {
    return await RoleService.listRole(res, query);
  }

  @Post("/userRole/:userId")
  @UseBefore(
    ...secureRouteWithPermissions("assignRoleToUser"),
    createValidationMiddleware(assignRoleToUserValidation)
  )
  async assignRoleToUser(
    @Req() req: any,
    @Param("userId") userId: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await RoleService.assignRoleToUser(
      res,
      userId,
      body.roleId,
      req.user.id
    );
  }

  @Get("/userRole/:id")
  @UseBefore(...secureRouteWithPermissions("getAllRoleUsers"))
  async getAllRoleUsers(@Param("id") id: number, @Res() res: Response) {
    return await RoleService.listRoleUser(res, id);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateRole"),
    createValidationMiddleware(updateRoleValidation)
  )
  async updateRole(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await RoleService.updateRole(res, id, body);
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("deleteRole"))
  async deleteRole(@Param("id") id: number, @Res() res: Response) {
    return await RoleService.DeleteRole(res, id);
  }
}

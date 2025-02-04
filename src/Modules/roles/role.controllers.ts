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
    if (await RoleService.roleExist(body.name))
      throw new ApiError("this role name already exist", 409);

    let role = await RoleService.createRole({
      createdBy: req.user?.id,
      ...body,
    });
    res.status(200).json(role);
  }

  // GET /all does not use CheckEmailMiddleware
  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allRoles"))
  async allRoles(@QueryParams() query: any, @Res() res: Response) {
    const data = await RoleService.listRole(query);

    return res.status(200).json({
      data: data.result,
      pagination: data.pagination,
    });
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
    if (!(await RoleService.getUser(userId))) {
      throw new ApiError("user not found", 404);
    } else if (!(await RoleService.getRole(body.roleId))) {
      throw new ApiError("role not found", 404);
    }
    await RoleService.assignRoleToUser(userId, body.roleId, req.user.id);
    res.json({ message: "assigning role to user successfully" });
  }

  @Get("/userRole/:id")
  @UseBefore(...secureRouteWithPermissions("getAllRoleUsers"))
  async getAllRoleUsers(
    @QueryParams() query: any,
    @Param("id") id: number,
    @Res() res: Response
  ) {
    let all = await RoleService.listRoleUser(id);
    res.status(200).json(all);
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
    if (!(await RoleService.getRoleById(id)))
      throw new ApiError("role not found");

    if (await RoleService.roleExist(body.name)) {
      throw new ApiError("this role name already exist", 409);
    }
    await RoleService.updateRole(id, body);
    return res.status(200).json({ message: "role updated successfully" });
  }

  @Delete("/:id")
  @UseBefore(...secureRouteWithPermissions("deleteRole"))
  async deleteRole(@Param("id") id: number, @Res() res: Response) {
    if (!(await RoleService.getRoleById(id))) {
      throw new ApiError("role not found");
    }
    await RoleService.DeleteRole(id);
    return res.status(200).json({ message: "role deleted successfully" });
  }
}

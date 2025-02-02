import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { Response } from "express";

import Joi from "joi";
import { createValidationMiddleware } from "../../middlewares/validation";
import ApiError from "../../utils/ApiError";
import * as permissionService from "./permission.service";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";

@JsonController("/api/permissions")
export class PermissionController {
  private static permissionSchema = Joi.object({
    id: Joi.string().required().messages({
      "string.base": "id should be a string",
      "string.empty": "id cannot be empty",
      "any.required": "id is required",
    }),
    permissionNames: Joi.array()
      .items(
        Joi.string().required().messages({
          "string.base": "Each permissionName should be a string",
          "string.empty": "permissionName cannot be empty",
          "any.required": "permissionName is required",
        })
      )
      .min(1)
      .required()
      .messages({
        "array.base": "permissionNames should be an array",
        "array.min": "permissionNames should contain at least one element",
      }),
  });

  @Post("/seed")
  @UseBefore(...secureRouteWithPermissions("seedPermissions"))
  async seedPermissions(@Res() res: Response) {
    await permissionService.seeder();
    return res.status(201).json({
      status: "success",
      message: "Permissions seeded successfully",
    });
  }

  @Post("/assignToUser/:id")
  @UseBefore(
    // ...secureRouteWithPermissions("assignPermissionsToUser"),
    createValidationMiddleware(PermissionController.permissionSchema)
  )
  async assignPermissionsToUser(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: { permissionNames: string[] },
    @Res() res: Response
  ) {
    await permissionService.assignPermissionToUser(id, body);
    return res.status(200).json({
      message: "Permissions assigned to user successfully",
    });
  }

  @Post("/assignToRole/:id")
  @UseBefore(
    ...secureRouteWithPermissions("assignPermissionsToRole"),
    createValidationMiddleware(PermissionController.permissionSchema)
  )
  async assignPermissionsToRole(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: { permissionNames: string[] },
    @Res() res: Response
  ) {
    await permissionService.assignPermissionToRole(id, body);
    return res.status(200).json({
      message: "Permissions assigned to role successfully",
    });
  }

  @Get("/")
  // @UseBefore(...secureRouteWithPermissions("ListPermissions"))
  async ListPermissions(@Req() req: Request, @Res() res: Response) {
    let permissions = await permissionService.listPermissions();
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }

  @Get("/user/:id")
  @UseBefore(...secureRouteWithPermissions("ListUserPermissions"))
  async ListUserPermissions(
    @Req() req: Request,
    @Param("id") userId: number,
    @Res() res: Response
  ) {
    if (!(await permissionService.getUser(userId))) {
      throw new ApiError("user not found", 404);
    }
    let permissions = await permissionService.listPermissionOfUser(userId);
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }

  @Get("/role/:id")
  @UseBefore(...secureRouteWithPermissions("ListRolePermissions"))
  async ListRolePermissions(
    @Req() req: Request,
    @Param("id") roleId: number,
    @Res() res: Response
  ) {
    if (!(await permissionService.getRole(roleId))) {
      throw new ApiError("role not found", 404);
    }
    let permissions = await permissionService.listPermissionOfRole(roleId);
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }
}

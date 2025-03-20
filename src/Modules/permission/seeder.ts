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
    return await permissionService.seeder(res);
  }

  @Post("/assignToUser/:id")
  @UseBefore(
    ...secureRouteWithPermissions("assignPermissionsToUser"),
    createValidationMiddleware(PermissionController.permissionSchema)
  )
  async assignPermissionsToUser(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: { permissionNames: string[] },
    @Res() res: Response
  ) {
    return await permissionService.assignPermissionToUser(
      res,
      id,
      body,
      req.user.id
    );
  }

  @Post("/assignToRole/:id")
  @UseBefore(
    ...secureRouteWithPermissions("assignPermissionsToRole"),
    createValidationMiddleware(PermissionController.permissionSchema)
  )
  async assignPermissionsToRole(
    @Param("id") id: number,
    @Body() body: { permissionNames: string[] },
    @Res() res: Response
  ) {
    return await permissionService.assignPermissionToRole(res, id, body);
  }

  @Get("/")
  @UseBefore(...secureRouteWithPermissions("ListPermissions"))
  async ListPermissions(@Req() req: Request, @Res() res: Response) {
    return await permissionService.listPermissions(res);
  }

  @Get("/user/:id")
  @UseBefore(...secureRouteWithPermissions("ListUserPermissions"))
  async ListUserPermissions(@Param("id") userId: number, @Res() res: Response) {
    return await permissionService.listPermissionOfUser(res, userId);
  }

  @Get("/role/:id")
  @UseBefore(...secureRouteWithPermissions("ListRolePermissions"))
  async ListRolePermissions(@Param("id") roleId: number, @Res() res: Response) {
    return await permissionService.listPermissionOfRole(res, roleId);
  }
}

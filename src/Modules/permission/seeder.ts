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
import { PrismaClient } from "@prisma/client";
import { permissions } from "./permissions";
import Joi from "joi";
import { createValidationMiddleware } from "../../middlewares/validation";
import ApiError from "../../utils/ApiError";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";
const prisma = new PrismaClient();

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
  @UseBefore()
  // ProtectRoutesMiddleware,
  // roleOrPermissionMiddleware("seedPermissions")
  async seedPermissions(@Res() res: Response) {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany();
      await tx.userPermission.deleteMany();
      await tx.permission.deleteMany();

      for (const permission of permissions) {
        await tx.permission.upsert({
          where: { name: permission.name },
          update: {},
          create: permission,
        });
      }
    });

    return res.status(201).json({
      status: "success",
      message: "Permissions seeded successfully",
    });
  }

  @Post("/assignToUser/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("assignPermissionsToUser"),
    createValidationMiddleware(PermissionController.permissionSchema)
  )
  async assignPermissionsToUser(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: { permissionNames: string[] },
    @Res() res: Response
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userPermissions: true,
      },
    });
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Fetch permissions by name
    const permissions = await prisma.permission.findMany({
      where: {
        name: { in: body.permissionNames },
      },
    });

    if (permissions.length !== body.permissionNames.length) {
      throw new ApiError("One or more permissions not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      const userPermissions = permissions.map((permission) => ({
        userId: id,
        permissionId: permission.id,
      }));
      await tx.userPermission.createMany({
        data: userPermissions,
      });
    });
    return res.status(200).json({
      message: "Permissions assigned to user successfully",
    });
  }

  @Post("/assignToRole/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("assignPermissionsToRole"),
    createValidationMiddleware(PermissionController.permissionSchema)
  )
  async assignPermissionsToRole(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: { permissionNames: string[] },
    @Res() res: Response
  ) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: true,
      },
    });
    if (!role) {
      throw new ApiError("Role not found", 404);
    }

    // Fetch permissions by name
    const permissions = await prisma.permission.findMany({
      where: {
        name: { in: body.permissionNames },
      },
    });

    if (permissions.length !== body.permissionNames.length) {
      throw new ApiError("One or more permissions not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      const rolePermissions = permissions.map((permission) => ({
        roleId: id,
        permissionId: permission.id,
      }));
      await tx.rolePermission.createMany({
        data: rolePermissions,
      });
    });
    return res.status(200).json({
      message: "Permissions assigned to role successfully",
    });
  }

  @Get("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("ListPermissions")
  )
  async ListPermissions(@Req() req: Request, @Res() res: Response) {
    let permissions = await prisma.permission.findMany();
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }

  @Get("/user/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("ListUserPermissions")
  )
  async ListUserPermissions(
    @Req() req: Request,
    @Param("id") userId: number,
    @Res() res: Response
  ) {
    if (!(await prisma.user.findUnique({ where: { id: userId } }))) {
      throw new ApiError("user not found", 404);
    }
    let permissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }
  @Get("/role/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("ListRolePermissions")
  )
  async ListRolePermissions(
    @Req() req: Request,
    @Param("id") roleId: number,
    @Res() res: Response
  ) {
    if (!(await prisma.role.findUnique({ where: { id: roleId } }))) {
      throw new ApiError("user not found", 404);
    }
    let permissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }
}

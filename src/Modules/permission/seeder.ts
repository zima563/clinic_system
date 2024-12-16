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
const prisma = new PrismaClient();

@JsonController("/api/permissions")
export class PermissionController {
  private static permissionIdsSchema = Joi.object({
    id: Joi.string().required(),
    permissionIds: Joi.array()
      .items(Joi.number().integer().positive().required())
      .min(1)
      .required()
      .messages({
        "array.base": "permissionIds should be an array",
        "array.min": "permissionIds should contain at least one element",
        "number.base": "Each permissionId should be an integer",
        "number.integer": "Each permissionId should be an integer",
        "number.positive": "Each permissionId should be a positive integer",
      }),
  });
  @Post("/seed")
  async seedPermissions(@Res() res: Response) {
    await prisma.$transaction(async (tx) => {
      await tx.permission.deleteMany({});

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
    createValidationMiddleware(PermissionController.permissionIdsSchema)
  )
  async assignPermissionsToUser(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: { permissionIds: number[] },
    @Res() res: Response
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userPermissions: true,
      },
    });
    if (!user) {
      throw new ApiError("user not found", 404);
    }

    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: body.permissionIds },
      },
    });

    if (permissions.length !== body.permissionIds.length) {
      throw new ApiError("One or more permissions not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      const userPermissions = body.permissionIds.map((permissionId) => ({
        userId: id,
        permissionId,
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
    createValidationMiddleware(PermissionController.permissionIdsSchema)
  )
  async assignPermissionsToRole(
    @Req() req: Request,
    @Param("id") id: number,
    @Body() body: { permissionIds: number[] },
    @Res() res: Response
  ) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: true,
      },
    });
    if (!role) {
      throw new ApiError("user not found", 404);
    }

    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: body.permissionIds },
      },
    });

    if (permissions.length !== body.permissionIds.length) {
      throw new ApiError("One or more permissions not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      const rolePermissions = body.permissionIds.map((permissionId) => ({
        roleId: id,
        permissionId,
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
  async ListPermissions(@Req() req: Request, @Res() res: Response) {
    let permissions = await prisma.permission.findMany();
    return res.status(200).json({
      data: permissions,
      count: permissions.length,
    });
  }

  @Get("/user/:id")
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

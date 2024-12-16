import { JsonController, Post, Res } from "routing-controllers";
import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { permissions } from "./permissions";
const prisma = new PrismaClient();

@JsonController("/api/permissions")
export class PermissionController {
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
}

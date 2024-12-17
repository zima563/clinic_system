import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import ApiError from "../utils/ApiError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function roleOrPermissionMiddleware(
  permissionName: string // List of permission names
) {
  @Middleware({ type: "before" })
  class CheckRoleOrPermissionMiddleware implements ExpressMiddlewareInterface {
    async use(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { user } = req;

      if (!user) {
        return next(new ApiError("User not authenticated", 401));
      }

      try {
        const permission = await prisma.permission.findFirst({
          where: { name: permissionName },
        });

        const userHasPermission = await prisma.userPermission.findFirst({
          where: {
            userId: user.id,
            permissionId: permission?.id,
          },
        });
        const userRole = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
          },
        });
        const roleHasPermission = await prisma.rolePermission.findFirst({
          where: {
            roleId: userRole?.roleId,
            permissionId: permission?.id,
          },
        });

        // Allow access if the user has any role or any permission
        if (roleHasPermission || userHasPermission) {
          return next();
        }

        return next(
          new ApiError("Access denied: insufficient roles or permissions", 403)
        );
      } catch (error) {
        return next(new ApiError("Error checking roles or permissions", 500));
      }
    }
  }
  return CheckRoleOrPermissionMiddleware;
}

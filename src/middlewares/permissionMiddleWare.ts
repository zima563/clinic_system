import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import ApiError from "../utils/ApiError";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export function permissionMiddleware(text: string) {
  @Middleware({ type: "before" })
  class CheckUserPermissionMiddleware implements ExpressMiddlewareInterface {
    async use(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { user } = req;
      const permissionName = text;

      if (!permissionName) {
        return next(new ApiError("Permission not provided", 400));
      }

      if (!user) {
        return next(new ApiError("User not authenticated", 401));
      }

      try {
        // Fetch the permission based on the name
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission) {
          return next(new ApiError("Permission not found", 404));
        }

        // Check if the user has the required permission
        const userPermission = await prisma.userPermission.findFirst({
          where: {
            userId: user.id,
            permissionId: permission.id,
          },
        });

        if (!userPermission) {
          return next(
            new ApiError("User does not have the required permission", 403)
          );
        }

        // If permission is granted, continue to next handler
        next();
      } catch (error) {
        return next(new ApiError("Error checking permissions", 500));
      }
    }
  }
  return CheckUserPermissionMiddleware;
}

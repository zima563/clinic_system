import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import ApiError from "../utils/ApiError";
import JWT from "jsonwebtoken";
import { getLangFromRequest, getTranslation } from "../utils/i18n";

const prisma = new PrismaClient();

interface DecodedToken {
  userId: number;
  iat: number; // Issued at timestamp
}

@Middleware({ type: "before" })
export class ProtectRoutesMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    const lang = getLangFromRequest(req.headers["accept-language"] as string);
    const { authorization } = req.headers;

    if (!authorization) {
      throw new ApiError(getTranslation("noToken", lang), 401);
    }

    const token = authorization.split(" ")[1];
    const jwtKey = process.env.JWT_KEY;

    if (!jwtKey) {
      throw new ApiError(getTranslation("serverError", lang), 500);
    }

    try {
      const decoded = JWT.verify(token, jwtKey) as DecodedToken;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        throw new ApiError(getTranslation("userNotFound", lang), 404);
      }
      if (!user.isActive) {
        throw new ApiError(getTranslation("userNotActive", lang), 403);
      }
      if (user.isDeleted) {
        throw new ApiError(getTranslation("userDeleted", lang), 403);
      }

      req.user = user;
      next();
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(getTranslation("unauthorized", lang), 401);
    }
  }
}

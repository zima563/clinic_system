import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import ApiError from "../utils/ApiError";
import JWT from "jsonwebtoken";

const prisma = new PrismaClient();

interface DecodedToken {
  userId: number;
  iat: number; // Issued at timestamp
}
@Middleware({ type: "before" })
export class ProtectRoutesMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new ApiError("not token provider", 401);
    }
    const token = authorization.split(" ")[1];
    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      throw new ApiError("JWT secret key is missing", 500);
    }
    let decoded: DecodedToken;
    decoded = JWT.verify(token, jwtKey) as DecodedToken;

    let user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new ApiError("user not found", 404);
    }
    if (!user.isActive) {
      throw new ApiError("user not active", 403);
    }
    if (user.isDeleted) {
      throw new ApiError("user is deleted", 403);
    }
    req.user = user;

    next();
  }
}

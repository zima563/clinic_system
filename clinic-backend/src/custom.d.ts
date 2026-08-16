import { User } from "@prisma/client";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the user property to the request object
    }
  }
}

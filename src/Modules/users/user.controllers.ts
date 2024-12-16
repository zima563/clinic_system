import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, query, Response } from "express";
import {
  Body,
  Get,
  JsonController,
  Param,
  Params,
  Patch,
  Post,
  Put,
  QueryParam,
  QueryParams,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addUser, loginValidation, UpdateUser } from "./user.validations";
import { CheckEmailMiddleware } from "../../middlewares/emailExists";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";

const prisma = new PrismaClient();

@JsonController("/api/users")
export class userControllers {
  // Apply CheckEmailMiddleware only for the POST route (user creation)
  @Post("/")
  @UseBefore(createValidationMiddleware(addUser))
  @UseBefore(CheckEmailMiddleware)
  async addUser(@Body() body: any, @Res() res: Response) {
    body.password = bcrypt.hashSync(body.password, 10);
    let user = await prisma.user.create({ data: body });
    return res.status(201).json(user);
  }

  // GET /all does not use CheckEmailMiddleware
  @Get("/all")
  async allUsers(@QueryParams() query: any, @Res() res: Response) {
    try {
      // Add isDeleted = false condition to the query
      const baseFilter = {
        isDeleted: false, // Ensure we only fetch users where isDeleted is false
      };
      // Initialize ApiFeatures with the Prisma model and the search query
      const apiFeatures = new ApiFeatures(prisma.user, query);

      // Apply filters, sorting, field selection, search, and pagination
      await apiFeatures
        .filter(baseFilter)
        .sort()
        .limitedFields()
        .search("user"); // Specify the model name, 'user' in this case

      await apiFeatures.paginateWithCount();

      // Execute the query and get the result and pagination
      const { result, pagination } = await apiFeatures.exec("user");

      // Return the result along with pagination information
      return res.status(200).json({
        data: result,
        pagination: pagination, // Use the pagination here
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      // Ensure no further responses are sent
      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  @Get("/:id")
  async getOneUser(
    @Param("id") id: number,
    @Res() res: Response,
    next: NextFunction
  ) {
    let user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new ApiError("user not found", 404);
    return res.status(201).json(user);
  }

  @Put("/:id")
  @UseBefore(createValidationMiddleware(UpdateUser))
  async updateUser(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response,
    next: NextFunction
  ) {
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError("user not found", 404);
    await prisma.user.update({
      where: { id },
      data: body,
    });

    return res.status(201).json({ message: "user updated successfully", user });
  }

  @Patch("/:id")
  async deactiveUser(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response,
    next: NextFunction
  ) {
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError("user not found", 404);
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return res.status(201).json({ message: "user Deactivated successfully" });
  }

  @Patch("/soft/:id")
  async DeleteUser(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response,
    next: NextFunction
  ) {
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError("user not found", 404);
    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return res.status(201).json({ message: "user Deleted successfully" });
  }

  @Post("/login")
  @UseBefore(createValidationMiddleware(loginValidation))
  async login(@Body() body: any, @Res() res: Response) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: body.emailOrPhone }, { email: body.emailOrPhone }],
      },
    });
    if (!(user && bcrypt.compareSync(body.password, user.password))) {
      throw new ApiError("email or password incorrect");
    } else {
      let token = jwt.sign({ userId: user.id }, process.env.JWT_KEY!);
      return res.status(200).json(token);
    }
  }
}

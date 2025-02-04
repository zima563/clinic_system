import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import {
  Body,
  Get,
  JsonController,
  Param,
  Patch,
  Post,
  Put,
  QueryParam,
  QueryParams,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addUser, loginValidation, UpdateUser } from "./user.validations";
import { CheckEmailMiddleware } from "../../middlewares/emailExists";
import ApiError from "../../utils/ApiError";
import { CheckPhoneMiddleware } from "../../middlewares/phoneExist";
import { secureRouteWithPermissions } from "../../middlewares/secureRoutesMiddleware";
import * as userServices from "./user.service";

@JsonController("/api/users")
export class userControllers {
  // Apply CheckEmailMiddleware only for the POST route (user creation)
  @Post("/")
  @UseBefore(
    ...secureRouteWithPermissions("addUser"),
    createValidationMiddleware(addUser),
    CheckEmailMiddleware,
    CheckPhoneMiddleware
  )
  async addUser(@Body() body: any, @Res() res: Response) {
    body.password = bcrypt.hashSync(body.password, 10);
    let user = await userServices.addUser(body);
    return res.status(201).json(user);
  }

  @Get("/all")
  // @UseBefore(...secureRouteWithPermissions("allUsers"))
  async allUsers(@QueryParams() query: any, @Res() res: Response) {
    let data = await userServices.getAllUser(query);
    return res.status(200).json({
      data: data.result,
      pagination: data.pagination,
    });
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("getOneUser"))
  async getOneUser(@Param("id") id: number, @Res() res: Response) {
    let user = await userServices.getUserById(id);
    if (!user) throw new ApiError("user not found", 404);
    return res.status(201).json(user);
  }

  @Get("/profile")
  @UseBefore(...secureRouteWithPermissions("profile"))
  async getUserProfile(@Req() req: any, @Res() res: Response) {
    let user = await userServices.getUserById(req.user.id);
    if (!user) throw new ApiError("user not found", 404);
    return res.status(201).json(user);
  }

  @Put("/:id")
  @UseBefore(
    ...secureRouteWithPermissions("updateUser"),
    createValidationMiddleware(UpdateUser)
  )
  async updateUser(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    let user = await userServices.getUserById(id);
    if (!user) throw new ApiError("user not found", 404);
    await userServices.updateUser(id, body);

    return res.status(201).json({ message: "user updated successfully", user });
  }

  @Patch("/:id")
  @UseBefore(...secureRouteWithPermissions("deactiveUser"))
  async deactiveUser(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    let user = await userServices.getUserById(id);
    if (!user) throw new ApiError("user not found", 404);
    await userServices.deactiveUser(id, user, req?.user.id);
    let updatedUser = await userServices.getUserById(id);

    return res
      .status(201)
      .json({ message: "user Deactivated successfully", updatedUser });
  }

  @Patch("/soft/:id")
  @UseBefore(...secureRouteWithPermissions("DeleteUser"))
  async DeleteUser(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    let user = await userServices.getUserById(id);
    if (!user) throw new ApiError("user not found", 404);
    await userServices.deleteUser(id, user, req.user.id);
    let updatedUser = await userServices.getUserById(id);

    return res
      .status(201)
      .json({ message: "user Deleted successfully", updatedUser });
  }

  @Post("/login")
  @UseBefore(createValidationMiddleware(loginValidation))
  async login(@Body() body: any, @Res() res: Response) {
    let user = await userServices.findUser(body);

    if (!(user && bcrypt.compareSync(body.password, user.password))) {
      throw new ApiError("email or password incorrect");
    } else {
      // Generate JWT token
      let token = jwt.sign({ userId: user.id }, process.env.JWT_KEY!);

      // Fetch user's direct permissions
      const userPermissions = await userServices.getUserPermissions(user);

      // Fetch user's role
      const userRole = await userServices.getUserRole(user);

      // Fetch permissions related to the user's role
      const rolePermissions = userRole
        ? await userServices.getPermissionRelatedWithRole(userRole)
        : [];

      // Extract unique permissions for the response
      const allPermissions = new Set([
        ...userPermissions.map((up) => up.permission.name),
        ...rolePermissions.map((rp) => rp.permission.name),
      ]);

      // Return response with token and combined unique permissions
      return res.status(200).json({
        token,
        permissions: Array.from(allPermissions),
      });
    }
  }
}

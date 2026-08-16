import { NextFunction, Response } from "express";
import {
  Body,
  Get,
  JsonController,
  Param,
  Patch,
  Post,
  Put,
  QueryParams,
  Req,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import {
  addUser,
  changePassword,
  loginValidation,
  UpdateUser,
  UpdateUserProfile,
} from "./user.validations";
import { CheckEmailMiddleware } from "../../middlewares/emailExists";
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
    return await userServices.addUser(res, body);
  }

  @Get("/all")
  @UseBefore(...secureRouteWithPermissions("allUsers"))
  async allUsers(@QueryParams() query: any, @Res() res: Response) {
    return await userServices.getAllUser(res, query);
  }

  @Get("/profile")
  @UseBefore(...secureRouteWithPermissions("profile"))
  async getUserProfile(@Req() req: any, @Res() res: Response) {
    return await userServices.profile(req, res);
  }

  @Get("/:id")
  @UseBefore(...secureRouteWithPermissions("getOneUser"))
  async getOneUser(@Param("id") id: number, @Res() res: Response) {
    return await userServices.getUser(res, id);
  }

  @Put("/updateProfile")
  @UseBefore(
    ...secureRouteWithPermissions("updateUserProfile"),
    createValidationMiddleware(UpdateUserProfile)
  )
  async updateUserProfile(
    @Req() req: any,
    @Body() body: any,
    @Res() res: Response
  ) {
    await userServices.updateUser(res, req.user.id, body);
  }

  @Patch("/ChangePassword")
  @UseBefore(
    ...secureRouteWithPermissions("ChangePassword"),
    createValidationMiddleware(changePassword)
  )
  async ChangePassword(
    @Req() req: any,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await userServices.changePassword(res, req.user.id, body);
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
    return await userServices.updateUser(res, id, body);
  }

  @Patch("/:id")
  @UseBefore(...secureRouteWithPermissions("deactiveUser"))
  async deactiveUser(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await userServices.deactiveUser(res, id, req?.user.id);
  }

  @Patch("/soft/:id")
  @UseBefore(...secureRouteWithPermissions("DeleteUser"))
  async DeleteUser(
    @Req() req: any,
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    return await userServices.deleteUser(res, id, req.user.id);
  }

  @Post("/login")
  @UseBefore(createValidationMiddleware(loginValidation))
  async login(@Body() body: any, @Res() res: Response) {
    return await userServices.login(res, body);
  }
}

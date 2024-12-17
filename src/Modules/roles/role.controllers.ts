import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
  Res,
  UseBefore,
} from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";
import {
  assignRoleToUserValidation,
  createRoleValidation,
  updateRoleValidation,
} from "./role.validation";
import { ProtectRoutesMiddleware } from "../../middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "../../middlewares/roleOrPermission";

const prisma = new PrismaClient();

@JsonController("/api/roles")
export class roleControllers {
  @Post("/")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("createRole"),
    createValidationMiddleware(createRoleValidation)
  )
  async createRole(@Body() body: any, @Res() res: Response) {
    if (await prisma.role.findFirst({ where: { name: body.name } })) {
      throw new ApiError("this role name already exist", 409);
    }
    let role = await prisma.role.create({ data: body });
    res.status(200).json(role);
  }

  // GET /all does not use CheckEmailMiddleware
  @Get("/all")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("allRoles"))
  async allRoles(@QueryParams() query: any, @Res() res: Response) {
    try {
      const apiFeatures = new ApiFeatures(prisma.role, query);

      await apiFeatures.filter().search("role"); // Specify the model name, 'user' in this case

      await apiFeatures.paginateWithCount(); // Get the total count for pagination

      // Execute the query and get the result and pagination
      const { result, pagination } = await apiFeatures.exec("role");

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

  @Post("/userRole/:userId")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("assignRoleToUser"),
    createValidationMiddleware(assignRoleToUserValidation)
  )
  async assignRoleToUser(
    @Param("userId") userId: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (!(await prisma.user.findUnique({ where: { id: userId } }))) {
      throw new ApiError("user not found", 404);
    } else if (
      !(await prisma.role.findUnique({
        where: { id: parseInt(body.roleId, 10) },
      }))
    ) {
      throw new ApiError("role not found", 404);
    }
    await prisma.userRole.create({
      data: {
        userId,
        roleId: parseInt(body.roleId, 10),
      },
    });
    res.json({ message: "assigning role to user successfully" });
  }

  @Get("/userRole/all")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("getAllRoleUsers")
  )
  async getAllRoleUsers(@QueryParams() query: any, @Res() res: Response) {
    let all = await prisma.userRole.findMany({
      include: {
        user: true,
        role: true,
      },
    });
    res.status(200).json(all);
  }

  @Put("/:id")
  @UseBefore(
    ProtectRoutesMiddleware,
    roleOrPermissionMiddleware("updateRole"),
    createValidationMiddleware(updateRoleValidation)
  )
  async updateRole(
    @Param("id") id: number,
    @Body() body: any,
    @Res() res: Response
  ) {
    if (!(await prisma.role.findUnique({ where: { id } }))) {
      throw new ApiError("role not found");
    }
    if (await prisma.role.findFirst({ where: { name: body.name } })) {
      throw new ApiError("this role name already exist", 409);
    }
    await prisma.role.update({
      where: { id },
      data: body,
    });
    return res.status(200).json({ message: "role updated successfully" });
  }

  @Delete("/:id")
  @UseBefore(ProtectRoutesMiddleware, roleOrPermissionMiddleware("deleteRole"))
  async deleteRole(@Param("id") id: number, @Res() res: Response) {
    if (!(await prisma.role.findUnique({ where: { id } }))) {
      throw new ApiError("role not found");
    }
    await prisma.role.delete({
      where: { id },
    });
    return res.status(200).json({ message: "role deleted successfully" });
  }
}

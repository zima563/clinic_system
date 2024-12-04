import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { Body, Get, JsonController, Param, Post, QueryParams, Res, UseBefore } from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import ApiFeatures from "../../utils/ApiFeatures";
import ApiError from "../../utils/ApiError";
import { assignRoleToUserValidation, createRoleValidation } from "./role.validation";

const prisma = new PrismaClient();

@JsonController("/api/users")
export class userControllers {
@Post("/role")
    @UseBefore(createValidationMiddleware(createRoleValidation))
    async createRole(@Body() body:any, @Res() res: Response){
        let role = await prisma.role.create({data:body});
        res.status(200).json(role);
    }

    @Post("/userRole/:userId")
    @UseBefore(createValidationMiddleware(assignRoleToUserValidation))
    async assignRoleToUser(@Param("userId") userId: number, @Body() body: any, @Res() res:Response){
        if(!await prisma.user.findUnique({where:{id:userId}})){
            throw new ApiError("user not found",404)
        } else if(!await prisma.role.findUnique({where: {id:parseInt(body.roleId,10) }})){
            throw new ApiError("role not found",404)
        }
         await prisma.userRole.create({data:{
            userId,
            roleId: parseInt(body.roleId,10)
         }})
        res.json({message: "assigning role to user successfully"})
    }

    @Get("/userRole/all")
    async getAllRoleUsers(@QueryParams() query: any ,@Res() res:Response){
        let all = await prisma.userRole.findMany({
            include:{
                user: true,
                role: true
            }
        })
        res.status(200).json(all)
    }
}
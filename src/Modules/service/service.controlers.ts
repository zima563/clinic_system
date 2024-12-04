import { Body, JsonController, Param, Post, Put, Res, UseBefore } from "routing-controllers";
import {Response} from "express"
import { createValidationMiddleware } from "../../middlewares/validation";
import { addServiceValidation, updateServiceValidation } from "./services.validation";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
const prisma = new PrismaClient();

@JsonController("/api/services")
export class serviceController {
     
    @Post("/")
    @UseBefore(createValidationMiddleware(addServiceValidation))
    async addService(@Body() body:any,@Res() res:Response){
        if(await prisma.service.findFirst({where:{title: body.title}})){
            throw new ApiError("service title already exists",409);
        }
        let service = await prisma.service.create({
            data: body
        })
        return res.status(200).json(service);
    }

    @Put("/:id")
    @UseBefore(createValidationMiddleware(updateServiceValidation))
    async updateService(@Param("id") id:number,@Body() body:any,@Res() res:Response){
        if(await prisma.service.findFirst({where:{title: body.title}})){
            throw new ApiError("service title already exists",409);
        }
        let service = await prisma.service.update({
            where: {id},
            data: body
        })
        return res.status(200).json(service);
    }
}
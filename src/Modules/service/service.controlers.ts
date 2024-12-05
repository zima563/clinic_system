import { Body, Delete, Get, JsonController, Param, Patch, Post, Put, QueryParams, Res, UseBefore } from "routing-controllers";
import {Response} from "express"
import { createValidationMiddleware } from "../../middlewares/validation";
import { addServiceValidation, updateServiceValidation } from "./services.validation";
import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import ApiFeatures from "../../utils/ApiFeatures";
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
    
    @Get("/all")
    async allServices(@QueryParams() query: any, @Res() res: Response) {
        try {
        const baseFilter = {
            isDeleted: false, 
        };
            const apiFeatures = new ApiFeatures(prisma.service, query);

            await apiFeatures
                .filter(baseFilter)
                .sort()
                .limitedFields()
                .search("service")  
                .paginateWithCount(await prisma.user.count({where: baseFilter}))  

            const { result, pagination } = await apiFeatures.exec("service");

            return res.status(200).json({
                data: result,
                pagination: pagination,  
            });
        } catch (error) {
            console.error("Error fetching services:", error);
            if (!res.headersSent) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        }
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

    @Get("/:id")
    @UseBefore(createValidationMiddleware(updateServiceValidation))
    async getService(@Param("id") id:number,@Res() res:Response){
        let service = await prisma.service.findUnique({
            where: {id}
        })
        if(!service) {
            throw new ApiError("service not found",404)
        }
        return res.status(200).json(service);
    }

    @Patch("/:id")
    async deactiveService(@Param("id") id:number,@Res() res:Response){
        if(!await prisma.service.findUnique({where:{id}})){
            throw new ApiError("service not found",404);
        }
        let service = await prisma.service.update({
            where: {id},
            data: {status:false}
        })
        return res.status(200).json(service);
    }
}
import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { Body, JsonController, Post, Res, UseBefore } from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addUser } from "./user.validations";
import { CheckEmailMiddleware } from "../../middlewares/emailExists";

const prisma = new PrismaClient();


@JsonController("/api/users")
export class userControllers{
 
    @Post("/")
    @UseBefore(createValidationMiddleware(addUser))
    @UseBefore(CheckEmailMiddleware)
    async addUser(@Body() body: any ,@Res() res: Response){
         let user = await prisma.user.create({data:body});
         return res.status(201).json(user);
    }
}
import { PrismaClient } from "@prisma/client";
import { query, Response } from "express";
import { Body, Get, JsonController, Post, QueryParam, QueryParams, Res, UseBefore } from "routing-controllers";
import { createValidationMiddleware } from "../../middlewares/validation";
import { addUser } from "./user.validations";
import { CheckEmailMiddleware } from "../../middlewares/emailExists";
import ApiFeatures from "../../utils/ApiFeatures";

const prisma = new PrismaClient();


@JsonController("/api/users")
export class userControllers {

    // Apply CheckEmailMiddleware only for the POST route (user creation)
    @Post("/")
    @UseBefore(createValidationMiddleware(addUser))
    @UseBefore(CheckEmailMiddleware)
    async addUser(@Body() body: any, @Res() res: Response) {
        let user = await prisma.user.create({ data: body });
        return res.status(201).json(user);
    }

    // GET /all does not use CheckEmailMiddleware
    @Get("/all")
    async allUsers(@QueryParams() query: any, @Res() res: Response) {
        try {
            // Initialize ApiFeatures with the Prisma model and the search query
            const apiFeatures = new ApiFeatures(prisma.user, query);

            // Apply filters, sorting, field selection, search, and pagination
            await apiFeatures
                .filter()
                .sort()
                .limitedFields()
                .search("user")  // Specify the model name, 'user' in this case
                .paginateWithCount(await prisma.user.count())  // Get the total count for pagination

            // Execute the query and get the result and pagination
            const { result, pagination } = await apiFeatures.exec("user");

            // Return the result along with pagination information
            return res.status(200).json({
                data: result,
                pagination: pagination,  // Use the pagination here
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            // Ensure no further responses are sent
            if (!res.headersSent) {
                return res.status(500).json({ message: "Internal Server Error" });
            }
        }
    }
}


// import { PrismaClient } from "@prisma/client";
// import {
//   JsonController,
//   Get,
//   Post,
//   Param,
//   Body,
//   Res,
//   UseBefore,
//   QueryParams,
//   HttpError,
//   Put,
//   Delete,
// } from "routing-controllers";
// import { Response } from "express";
// import Joi from "joi";
// import { createValidationMiddleware } from "../middlewares/validation";

// const prisma = new PrismaClient();

// const AddCategorySchema = Joi.object({
//   name: Joi.string().required(),
//   description: Joi.string().max(1000).required(),
//   image: Joi.string().required(),
//   parentId: Joi.number().optional(),
// });

// const UpdateCategorySchema = Joi.object({
//   name: Joi.string().optional(),
//   description: Joi.string().max(1000).optional(),
//   image: Joi.string().optional(),
//   parentId: Joi.number().optional(),
// });

// @JsonController("/api/categories")
// export class CategoryController {
//   @Post("/")
//   @UseBefore(createValidationMiddleware(AddCategorySchema))
//   async addCategory(@Body() body: any, @Res() res: Response) {
//     const category = await prisma.category.create({ data: body });
//     return res.status(201).json(category);
//   }

//   @Put("/:id")
//   @UseBefore(createValidationMiddleware(UpdateCategorySchema))
//   async updateCategory(@Param("id") id: number, @Body() categoryData: any, @Res() res: Response) {
//     const category = await prisma.category.update({
//       where: { id },
//       data: categoryData,
//     });
//     return res.json(category);
//   }

//   @Get("/")
//   async getCategories(@QueryParams() query: any, @Res() res: Response) {
//     const categories = await prisma.category.findMany();
//     return res.json(categories);
//   }

//   @Get("/:id")
//   async getCategory(@Param("id") id: number, @Res() res: Response) {
//     const category = await prisma.category.findUnique({ where: { id } });
//     if (!category) throw new HttpError(404, "Category not found");
//     return res.json(category);
//   }

//   @Delete("/:id")
//   async deleteCategory(@Param("id") id: number, @Res() res: Response) {
//     const category = await prisma.category.delete({ where: { id } });
//     return res.json(category);
//   }
// }

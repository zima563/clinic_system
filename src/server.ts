import "reflect-metadata";
import { createExpressServer, useExpressServer } from "routing-controllers";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { ErrorHandler } from "./middlewares/ErrorHandler";
dotenv.config();
import express from "express"
import { createValidationMiddleware } from "./middlewares/validation";
import { userControllers } from "./Modules/users/user.controllers";
import { CheckEmailMiddleware } from "./middlewares/emailExists";


const app = express();

// Add body parser middleware
app.use(express.json()); // Parses application/json request bodies
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies

// Set up routing-controllers
useExpressServer(app, {
  controllers: [userControllers], // Adjust path to your controllers
  middlewares: [createValidationMiddleware,ErrorHandler,CheckEmailMiddleware],
});


app.use(compression()); // Add GZIP compression
app.use(cors());        // Add CORS
// app.use("/uploads", express.static("uploads")); // Serve static files

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

export default app;

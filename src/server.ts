import "reflect-metadata";
import { createExpressServer, useExpressServer } from "routing-controllers";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { ErrorHandler } from "./middlewares/ErrorHandler";
dotenv.config();
import express from "express";
import { createValidationMiddleware } from "./middlewares/validation";
import { userControllers } from "./Modules/users/user.controllers";
import { CheckEmailMiddleware } from "./middlewares/emailExists";
import { roleControllers } from "./Modules/roles/role.controllers";
import { serviceController } from "./Modules/service/service.controlers";
import { specialtyControllers } from "./Modules/Specialist/specialist.controllers";
import { invoiceControllers } from "./Modules/invoice/invoice.controllers";
import { doctorControllers } from "./Modules/doctor/doctor.controllers";
import { patientController } from "./Modules/patient/patient.controllers";
import { scheduleControllers } from "./Modules/schedule/schedule.controllers";
import { appointmentController } from "./Modules/appointment/appoientment.controllers";
import { visitController } from "./Modules/visit/visit.controllers";
import { PermissionController } from "./Modules/permission/seeder";
import { ProtectRoutesMiddleware } from "./middlewares/protectedRoute";
import { roleOrPermissionMiddleware } from "./middlewares/roleOrPermission";
import { searchControllers } from "./Modules/searchEngine/searchEngine";
import ApiError from "./utils/ApiError";

const app = express();

// Add body parser middleware
app.use(express.json({ limit: "50mb" })); // Parses application/json request bodies
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies
app.use(compression()); // Add GZIP compression
app.use(
  cors({
    origin: "*", // adjust this to fit your use case
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // Add CORS

// Set up routing-controllers
useExpressServer(app, {
  controllers: [
    userControllers,
    roleControllers,
    serviceController,
    specialtyControllers,
    invoiceControllers,
    doctorControllers,
    patientController,
    scheduleControllers,
    appointmentController,
    visitController,
    PermissionController,
    searchControllers,
  ], // Adjust path to your controllers
  middlewares: [
    // ProtectRoutesMiddleware,
    // roleOrPermissionMiddleware,
    createValidationMiddleware,
    ErrorHandler,
  ],
  defaultErrorHandler: false,
});

app.use("*", (req, res, next) => {
  next(new ApiError(`Not found: ${req.originalUrl}`, 404));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

export default app;

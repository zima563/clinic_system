/// <reference path="./custom.d.ts" />
import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { ErrorHandler } from "./middlewares/ErrorHandler";
dotenv.config();
import express from "express";
import { userControllers } from "./Modules/users/user.controllers";
import { roleControllers } from "./Modules/roles/role.controllers";
import { ServiceController } from "./Modules/service/service.controllers";
import { invoiceControllers } from "./Modules/invoice/invoice.controllers";
import { doctorControllers } from "./Modules/doctor/doctor.controllers";
import { patientController } from "./Modules/patient/patient.controllers";
import { scheduleControllers } from "./Modules/schedule/schedule.controllers";
import { appointmentController } from "./Modules/appointment/appoientment.controllers";
import { visitController } from "./Modules/visit/visit.controllers";
import { PermissionController } from "./Modules/permission/seeder";
import { searchControllers } from "./Modules/searchEngine/searchEngine";
import expressListRoutes from "express-list-routes";
import { createValidationMiddleware } from "./middlewares/validation";
import { specialtyControllers } from "./Modules/Specialist/specialist.controllers";

const app = express();

// Add body parser middleware
app.use(express.json({ limit: "50mb" })); // Parses application/json request bodies
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies
app.use(compression()); // Add GZIP compression
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language", "ngrok-skip-browser-warning", "X-Requested-With", "*"],
  })
);
app.options("*", cors()); // Handle pre-flight OPTIONS requests

// Set up routing-controllers
useExpressServer(app, {
  controllers: [
    userControllers,
    roleControllers,
    ServiceController,
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
  middlewares: [createValidationMiddleware, ErrorHandler],
  defaultErrorHandler: false,
});

console.log("✅ Controllers loaded successfully");
try {
  expressListRoutes(app, { prefix: "" });
} catch (e) {
  // Ignore route listing errors if any
}

app.use("/", express.static("uploads"));
const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`App listening on port ${port}!`));

export default app;

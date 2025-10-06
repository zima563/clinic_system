
import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { ErrorHandler } from "./src/middlewares/ErrorHandler";
dotenv.config();
import express from "express";
import { createValidationMiddleware } from "./src/middlewares/validation";
import { userControllers } from "./src/Modules/users/user.controllers";
import { roleControllers } from "./src/Modules/roles/role.controllers";
import { serviceController } from "./src/Modules/service/service.controlers";
import { specialtyControllers } from "./src/Modules/Specialist/specialist.controllers";
import { invoiceControllers } from "./src/Modules/invoice/invoice.controllers";
import { doctorControllers } from "./src/Modules/doctor/doctor.controllers";
import { patientController } from "./src/Modules/patient/patient.controllers";
import { scheduleControllers } from "./src/Modules/schedule/schedule.controllers";
import { appointmentController } from "./src/Modules/appointment/appoientment.controllers";
import { visitController } from "./src/Modules/visit/visit.controllers";
import { PermissionController } from "./src/Modules/permission/seeder";
import { searchControllers } from "./src/Modules/searchEngine/searchEngine";

const app = express();

// Add body parser middleware
app.use(express.json({ limit: "50mb" })); // Parses application/json request bodies
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies
app.use(compression()); // Add GZIP compression
app.use(
  cors({
    origin: "*", // adjust this to fit your use case
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
  middlewares: [createValidationMiddleware, ErrorHandler],
  defaultErrorHandler: false,
});

app.use("/", express.static("uploads"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

export default app;

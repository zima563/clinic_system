
import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { ErrorHandler } from "./src/middlewares/ErrorHandler";
dotenv.config();
import express from "express";
import { createValidationMiddleware } from "./src/middlewares/validation";
import { userControllers } from "./src/modules/users/user.controllers";
import { roleControllers } from "./src/modules/roles/role.controllers";
import { serviceController } from "./src/modules/service/service.controlers";
import { specialtyControllers } from "./src/modules/Specialist/specialist.controllers";
import { invoiceControllers } from "./src/modules/invoice/invoice.controllers";
import { doctorControllers } from "./src/modules/doctor/doctor.controllers";
import { patientController } from "./src/modules/patient/patient.controllers";
import { scheduleControllers } from "./src/modules/schedule/schedule.controllers";
import { appointmentController } from "./src/modules/appointment/appoientment.controllers";
import { visitController } from "./src/modules/visit/visit.controllers";
import { PermissionController } from "./src/modules/permission/seeder";
import { searchControllers } from "./src/modules/searchEngine/searchEngine";

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

console.log("✅ Controllers loaded successfully");
console.log(app._router.stack.map((r:any) => r.route && r.route.path).filter(Boolean));


app.use("/", express.static("uploads"));
const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`App listening on port ${port}!`));

export default app;

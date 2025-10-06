"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ErrorHandler_1 = require("./src/middlewares/ErrorHandler");
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const validation_1 = require("./src/middlewares/validation");
const user_controllers_1 = require("./src/Modules/users/user.controllers");
const role_controllers_1 = require("./src/Modules/roles/role.controllers");
const service_controlers_1 = require("./src/Modules/service/service.controlers");
const specialist_controllers_1 = require("./src/Modules/Specialist/specialist.controllers");
const invoice_controllers_1 = require("./src/Modules/invoice/invoice.controllers");
const doctor_controllers_1 = require("./src/Modules/doctor/doctor.controllers");
const patient_controllers_1 = require("./src/Modules/patient/patient.controllers");
const schedule_controllers_1 = require("./src/Modules/schedule/schedule.controllers");
const appoientment_controllers_1 = require("./src/Modules/appointment/appoientment.controllers");
const visit_controllers_1 = require("./src/Modules/visit/visit.controllers");
const seeder_1 = require("./src/Modules/permission/seeder");
const searchEngine_1 = require("./src/Modules/searchEngine/searchEngine");
const app = (0, express_1.default)();
// Add body parser middleware
app.use(express_1.default.json({ limit: "50mb" })); // Parses application/json request bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies
app.use((0, compression_1.default)()); // Add GZIP compression
app.use((0, cors_1.default)({
    origin: "*", // adjust this to fit your use case
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
})); // Add CORS
// Set up routing-controllers
(0, routing_controllers_1.useExpressServer)(app, {
    controllers: [
        user_controllers_1.userControllers,
        role_controllers_1.roleControllers,
        service_controlers_1.serviceController,
        specialist_controllers_1.specialtyControllers,
        invoice_controllers_1.invoiceControllers,
        doctor_controllers_1.doctorControllers,
        patient_controllers_1.patientController,
        schedule_controllers_1.scheduleControllers,
        appoientment_controllers_1.appointmentController,
        visit_controllers_1.visitController,
        seeder_1.PermissionController,
        searchEngine_1.searchControllers,
    ], // Adjust path to your controllers
    middlewares: [validation_1.createValidationMiddleware, ErrorHandler_1.ErrorHandler],
    defaultErrorHandler: false,
});
app.use("/", express_1.default.static("uploads"));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
exports.default = app;
//# sourceMappingURL=server.js.map
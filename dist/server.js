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
const user_controllers_1 = require("./src/modules/users/user.controllers");
const role_controllers_1 = require("./src/modules/roles/role.controllers");
const service_controllers_1 = require("./src/modules/service/service.controllers");
const specialist_controllers_1 = require("./src/modules/Specialist/specialist.controllers");
const invoice_controllers_1 = require("./src/modules/invoice/invoice.controllers");
const doctor_controllers_1 = require("./src/modules/doctor/doctor.controllers");
const patient_controllers_1 = require("./src/modules/patient/patient.controllers");
const schedule_controllers_1 = require("./src/modules/schedule/schedule.controllers");
const appoientment_controllers_1 = require("./src/modules/appointment/appoientment.controllers");
const visit_controllers_1 = require("./src/modules/visit/visit.controllers");
const seeder_1 = require("./src/modules/permission/seeder");
const searchEngine_1 = require("./src/modules/searchEngine/searchEngine");
const express_list_routes_1 = __importDefault(require("express-list-routes"));
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
        service_controllers_1.ServiceController,
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
console.log("✅ Controllers loaded successfully");
(0, express_list_routes_1.default)(app, { prefix: "" });
app.use("/", express_1.default.static("uploads"));
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
exports.default = app;
//# sourceMappingURL=server.js.map
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
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const validation_1 = require("./middlewares/validation");
const user_controllers_1 = require("./Modules/users/user.controllers");
const role_controllers_1 = require("./Modules/roles/role.controllers");
const app = (0, express_1.default)();
// Add body parser middleware
app.use(express_1.default.json()); // Parses application/json request bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies
// Set up routing-controllers
(0, routing_controllers_1.useExpressServer)(app, {
    controllers: [user_controllers_1.userControllers, role_controllers_1.roleControllers], // Adjust path to your controllers
    middlewares: [validation_1.createValidationMiddleware, ErrorHandler_1.ErrorHandler],
    defaultErrorHandler: false
});
app.use((0, compression_1.default)()); // Add GZIP compression
app.use((0, cors_1.default)({
    origin: '*', // adjust this to fit your use case
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Add CORS
// app.use("/uploads", express.static("uploads")); // Serve static files
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
exports.default = app;

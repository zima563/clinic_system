"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const routing_controllers_1 = require("routing-controllers");
let ErrorHandler = class ErrorHandler {
    error(error, request, response, next) {
        const statusCode = error.httpCode || 500;
        // Send JSON response
        return response.status(statusCode).json({
            status: "error",
            message: error.message || "Internal Server Error",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined, // Include stack only in development mode
        });
    }
};
exports.ErrorHandler = ErrorHandler;
exports.ErrorHandler = ErrorHandler = __decorate([
    (0, routing_controllers_1.Middleware)({ type: "after" }) // This runs after all other middlewares and controllers
], ErrorHandler);

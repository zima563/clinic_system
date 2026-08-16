"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationMiddleware = createValidationMiddleware;
const routing_controllers_1 = require("routing-controllers");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
function createValidationMiddleware(schema) {
    let ValidationMiddleware = class ValidationMiddleware {
        use(request, response, next) {
            // Combine request data (body, params, query)
            let filter = {};
            if (request.file) {
                filter = Object.assign(Object.assign(Object.assign({ icon: request.file }, request.params), request.body), request.query);
            }
            else if (request.files) {
                filter = Object.assign(Object.assign(Object.assign(Object.assign({}, request.files), request.params), request.body), request.query);
            }
            else {
                filter = Object.assign(Object.assign(Object.assign({}, request.params), request.body), request.query);
            }
            const { error } = schema.validate(filter, { abortEarly: false });
            if (error) {
                const errMsg = error.details.map((detail) => detail.message).join(", ");
                return next(new ApiError_1.default(errMsg, 400));
            }
            next();
        }
    };
    ValidationMiddleware = __decorate([
        (0, routing_controllers_1.Middleware)({ type: "before" })
    ], ValidationMiddleware);
    return ValidationMiddleware;
}

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
exports.checkScheduleMiddleware = void 0;
const routing_controllers_1 = require("routing-controllers");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma = new client_1.PrismaClient();
let checkScheduleMiddleware = class checkScheduleMiddleware {
    async use(req, res, next) {
        try {
            const { scheduleId } = req.body;
            const schedule = await prisma.schedule.findUnique({
                where: { id: scheduleId },
            });
            if (!schedule) {
                throw new ApiError_1.default("schedule not found with this scheduleId");
            }
            next();
        }
        catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    }
};
exports.checkScheduleMiddleware = checkScheduleMiddleware;
exports.checkScheduleMiddleware = checkScheduleMiddleware = __decorate([
    (0, routing_controllers_1.Middleware)({ type: "before" }) // Runs before the controllers
], checkScheduleMiddleware);
//# sourceMappingURL=scheduleExist.js.map
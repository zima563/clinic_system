"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPhoneMiddleware = void 0;
const routing_controllers_1 = require("routing-controllers");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let CheckPhoneMiddleware = class CheckPhoneMiddleware {
    async use(req, res, next) {
        try {
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({
                    status: "error",
                    message: "Email is required",
                });
            }
            // Check if the email already exists in the database
            const user = await prisma.user.findUnique({
                where: { phone },
            });
            if (user) {
                return res.status(409).json({
                    status: "error",
                    message: "user's phone already exists",
                });
            }
            // If email does not exist, proceed to the next middleware or controller
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
exports.CheckPhoneMiddleware = CheckPhoneMiddleware;
exports.CheckPhoneMiddleware = CheckPhoneMiddleware = __decorate([
    (0, routing_controllers_1.Middleware)({ type: "before" }) // Runs before the controllers
], CheckPhoneMiddleware);
//# sourceMappingURL=phoneExist.js.map
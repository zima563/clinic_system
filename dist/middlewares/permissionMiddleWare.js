"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionMiddleware = permissionMiddleware;
const routing_controllers_1 = require("routing-controllers");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function permissionMiddleware(text) {
    let CheckUserPermissionMiddleware = class CheckUserPermissionMiddleware {
        use(req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = req;
                const permissionName = text;
                if (!permissionName) {
                    return next(new ApiError_1.default("Permission not provided", 400));
                }
                if (!user) {
                    return next(new ApiError_1.default("User not authenticated", 401));
                }
                try {
                    // Fetch the permission based on the name
                    const permission = yield prisma.permission.findUnique({
                        where: { name: permissionName },
                    });
                    if (!permission) {
                        return next(new ApiError_1.default("Permission not found", 404));
                    }
                    // Check if the user has the required permission
                    const userPermission = yield prisma.userPermission.findFirst({
                        where: {
                            userId: user.id,
                            permissionId: permission.id,
                        },
                    });
                    if (!userPermission) {
                        return next(new ApiError_1.default("User does not have the required permission", 403));
                    }
                    // If permission is granted, continue to next handler
                    next();
                }
                catch (error) {
                    return next(new ApiError_1.default("Error checking permissions", 500));
                }
            });
        }
    };
    CheckUserPermissionMiddleware = __decorate([
        (0, routing_controllers_1.Middleware)({ type: "before" })
    ], CheckUserPermissionMiddleware);
    return CheckUserPermissionMiddleware;
}

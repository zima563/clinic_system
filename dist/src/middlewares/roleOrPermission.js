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
exports.roleOrPermissionMiddleware = roleOrPermissionMiddleware;
const routing_controllers_1 = require("routing-controllers");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function roleOrPermissionMiddleware(permissionName // List of permission names
) {
    let CheckRoleOrPermissionMiddleware = class CheckRoleOrPermissionMiddleware {
        async use(req, res, next) {
            const { user } = req;
            if (!user) {
                return next(new ApiError_1.default("User not authenticated", 401));
            }
            try {
                const permission = await prisma.permission.findFirst({
                    where: { name: permissionName },
                });
                const userHasPermission = await prisma.userPermission.findFirst({
                    where: {
                        userId: user.id,
                        permissionId: permission?.id,
                    },
                });
                const userRole = await prisma.userRole.findFirst({
                    where: {
                        userId: user.id,
                    },
                });
                const roleHasPermission = await prisma.rolePermission.findFirst({
                    where: {
                        roleId: userRole?.roleId,
                        permissionId: permission?.id,
                    },
                });
                // Allow access if the user has any role or any permission
                if (roleHasPermission || userHasPermission) {
                    return next();
                }
                return next(new ApiError_1.default("Access denied: insufficient roles or permissions", 403));
            }
            catch (error) {
                return next(new ApiError_1.default("Error checking roles or permissions", 500));
            }
        }
    };
    CheckRoleOrPermissionMiddleware = __decorate([
        (0, routing_controllers_1.Middleware)({ type: "before" })
    ], CheckRoleOrPermissionMiddleware);
    return CheckRoleOrPermissionMiddleware;
}
//# sourceMappingURL=roleOrPermission.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.PermissionController = void 0;
const routing_controllers_1 = require("routing-controllers");
const client_1 = require("@prisma/client");
const permissions_1 = require("./permissions");
const joi_1 = __importDefault(require("joi"));
const validation_1 = require("../../middlewares/validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const protectedRoute_1 = require("../../middlewares/protectedRoute");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const prisma = new client_1.PrismaClient();
let PermissionController = class PermissionController {
    seedPermissions(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.rolePermission.deleteMany();
                yield tx.userPermission.deleteMany();
                yield tx.permission.deleteMany();
                for (const permission of permissions_1.permissions) {
                    yield tx.permission.upsert({
                        where: { name: permission.name },
                        update: {},
                        create: permission,
                    });
                }
            }));
            return res.status(201).json({
                status: "success",
                message: "Permissions seeded successfully",
            });
        });
    }
    assignPermissionsToUser(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { id },
                include: {
                    userPermissions: true,
                },
            });
            if (!user) {
                throw new ApiError_1.default("User not found", 404);
            }
            // Fetch permissions by name
            const permissions = yield prisma.permission.findMany({
                where: {
                    name: { in: body.permissionNames },
                },
            });
            if (permissions.length !== body.permissionNames.length) {
                throw new ApiError_1.default("One or more permissions not found", 404);
            }
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.userPermission.deleteMany({ where: { userId: id } });
                const userPermissions = permissions.map((permission) => ({
                    userId: id,
                    permissionId: permission.id,
                }));
                yield tx.userPermission.createMany({
                    data: userPermissions,
                });
            }));
            return res.status(200).json({
                message: "Permissions assigned to user successfully",
            });
        });
    }
    assignPermissionsToRole(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield prisma.role.findUnique({
                where: { id },
                include: {
                    rolePermissions: true,
                },
            });
            if (!role) {
                throw new ApiError_1.default("Role not found", 404);
            }
            // Fetch permissions by name
            const permissions = yield prisma.permission.findMany({
                where: {
                    name: { in: body.permissionNames },
                },
            });
            if (permissions.length !== body.permissionNames.length) {
                throw new ApiError_1.default("One or more permissions not found", 404);
            }
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.rolePermission.deleteMany({ where: { roleId: id } });
                const rolePermissions = permissions.map((permission) => ({
                    roleId: id,
                    permissionId: permission.id,
                }));
                yield tx.rolePermission.createMany({
                    data: rolePermissions,
                });
            }));
            return res.status(200).json({
                message: "Permissions assigned to role successfully",
            });
        });
    }
    ListPermissions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let permissions = yield prisma.permission.findMany();
            return res.status(200).json({
                data: permissions,
                count: permissions.length,
            });
        });
    }
    ListUserPermissions(req, userId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.user.findUnique({ where: { id: userId } }))) {
                throw new ApiError_1.default("user not found", 404);
            }
            let permissions = yield prisma.userPermission.findMany({
                where: { userId },
                include: {
                    permission: true,
                },
            });
            return res.status(200).json({
                data: permissions,
                count: permissions.length,
            });
        });
    }
    ListRolePermissions(req, roleId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.role.findUnique({ where: { id: roleId } }))) {
                throw new ApiError_1.default("user not found", 404);
            }
            let permissions = yield prisma.rolePermission.findMany({
                where: { roleId },
                include: {
                    permission: true,
                },
            });
            return res.status(200).json({
                data: permissions,
                count: permissions.length,
            });
        });
    }
};
exports.PermissionController = PermissionController;
PermissionController.permissionSchema = joi_1.default.object({
    id: joi_1.default.string().required().messages({
        "string.base": "id should be a string",
        "string.empty": "id cannot be empty",
        "any.required": "id is required",
    }),
    permissionNames: joi_1.default.array()
        .items(joi_1.default.string().required().messages({
        "string.base": "Each permissionName should be a string",
        "string.empty": "permissionName cannot be empty",
        "any.required": "permissionName is required",
    }))
        .min(1)
        .required()
        .messages({
        "array.base": "permissionNames should be an array",
        "array.min": "permissionNames should contain at least one element",
    }),
});
__decorate([
    (0, routing_controllers_1.Post)("/seed"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("seedPermissions")),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "seedPermissions", null);
__decorate([
    (0, routing_controllers_1.Post)("/assignToUser/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("assignPermissionsToUser"), (0, validation_1.createValidationMiddleware)(PermissionController.permissionSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "assignPermissionsToUser", null);
__decorate([
    (0, routing_controllers_1.Post)("/assignToRole/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("assignPermissionsToRole"), (0, validation_1.createValidationMiddleware)(PermissionController.permissionSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "assignPermissionsToRole", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("ListPermissions")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListPermissions", null);
__decorate([
    (0, routing_controllers_1.Get)("/user/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("ListUserPermissions")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListUserPermissions", null);
__decorate([
    (0, routing_controllers_1.Get)("/role/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("ListRolePermissions")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListRolePermissions", null);
exports.PermissionController = PermissionController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/permissions")
], PermissionController);

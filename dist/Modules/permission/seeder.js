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
const prisma = new client_1.PrismaClient();
let PermissionController = class PermissionController {
    seedPermissions(res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.permission.deleteMany({});
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
                throw new ApiError_1.default("user not found", 404);
            }
            const permissions = yield prisma.permission.findMany({
                where: {
                    id: { in: body.permissionIds },
                },
            });
            if (permissions.length !== body.permissionIds.length) {
                throw new ApiError_1.default("One or more permissions not found", 404);
            }
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const userPermissions = body.permissionIds.map((permissionId) => ({
                    userId: id,
                    permissionId,
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
};
exports.PermissionController = PermissionController;
PermissionController.permissionIdsSchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    permissionIds: joi_1.default.array()
        .items(joi_1.default.number().integer().positive().required())
        .min(1)
        .required()
        .messages({
        "array.base": "permissionIds should be an array",
        "array.min": "permissionIds should contain at least one element",
        "number.base": "Each permissionId should be an integer",
        "number.integer": "Each permissionId should be an integer",
        "number.positive": "Each permissionId should be a positive integer",
    }),
});
__decorate([
    (0, routing_controllers_1.Post)("/seed"),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "seedPermissions", null);
__decorate([
    (0, routing_controllers_1.Post)("/assignToUser/:id"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(PermissionController.permissionIdsSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "assignPermissionsToUser", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListPermissions", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListUserPermissions", null);
exports.PermissionController = PermissionController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/permissions")
], PermissionController);

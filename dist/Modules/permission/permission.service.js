"use strict";
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
exports.getRole = exports.getUser = exports.listPermissionOfRole = exports.listPermissionOfUser = exports.listPermissions = exports.assignPermissionToRole = exports.assignPermissionToUser = exports.seeder = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const permissions_1 = require("./permissions");
const seeder = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.seeder = seeder;
const assignPermissionToUser = (id, body, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === id) {
        throw new ApiError_1.default("you not allow to change your Permissions ..!", 401);
    }
    const user = yield prismaClient_1.prisma.user.findUnique({
        where: { id },
        include: {
            userPermissions: true,
        },
    });
    if (!user) {
        throw new ApiError_1.default("User not found", 404);
    }
    // Fetch permissions by name
    const permissions = yield prismaClient_1.prisma.permission.findMany({
        where: {
            name: { in: body.permissionNames },
        },
    });
    if (permissions.length !== body.permissionNames.length) {
        throw new ApiError_1.default("One or more permissions not found", 404);
    }
    yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.userPermission.deleteMany({ where: { userId: id } });
        const userPermissions = permissions.map((permission) => ({
            userId: id,
            permissionId: permission.id,
        }));
        yield tx.userPermission.createMany({
            data: userPermissions,
        });
    }));
});
exports.assignPermissionToUser = assignPermissionToUser;
const assignPermissionToRole = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield prismaClient_1.prisma.role.findUnique({
        where: { id },
        include: {
            rolePermissions: true,
        },
    });
    if (!role) {
        throw new ApiError_1.default("Role not found", 404);
    }
    // Fetch permissions by name
    const permissions = yield prismaClient_1.prisma.permission.findMany({
        where: {
            name: { in: body.permissionNames },
        },
    });
    if (permissions.length !== body.permissionNames.length) {
        throw new ApiError_1.default("One or more permissions not found", 404);
    }
    yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.rolePermission.deleteMany({ where: { roleId: id } });
        const rolePermissions = permissions.map((permission) => ({
            roleId: id,
            permissionId: permission.id,
        }));
        yield tx.rolePermission.createMany({
            data: rolePermissions,
        });
    }));
});
exports.assignPermissionToRole = assignPermissionToRole;
const listPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.permission.findMany();
});
exports.listPermissions = listPermissions;
const listPermissionOfUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.userPermission.findMany({
        where: { userId },
        include: {
            permission: true,
        },
    });
});
exports.listPermissionOfUser = listPermissionOfUser;
const listPermissionOfRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.rolePermission.findMany({
        where: { roleId },
        include: {
            permission: true,
        },
    });
});
exports.listPermissionOfRole = listPermissionOfRole;
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
});
exports.getUser = getUser;
const getRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.findUnique({ where: { id: roleId } });
});
exports.getRole = getRole;

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
exports.listPermissionOfRole = exports.listPermissionOfUser = exports.listPermissions = exports.assignPermissionToRole = exports.assignPermissionToUser = exports.seeder = exports.getRole = exports.getUser = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const permissions_1 = require("./permissions");
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
});
exports.getUser = getUser;
const getRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.findUnique({ where: { id: roleId } });
});
exports.getRole = getRole;
const seeder = (res) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res.status(201).json({
        status: "success",
        message: "Permissions seeded successfully",
    });
});
exports.seeder = seeder;
const assignPermissionToUser = (res, id, body, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res.status(200).json({
        message: "Permissions assigned to user successfully",
    });
});
exports.assignPermissionToUser = assignPermissionToUser;
const assignPermissionToRole = (res, id, body) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res.status(200).json({
        message: "Permissions assigned to role successfully",
    });
});
exports.assignPermissionToRole = assignPermissionToRole;
const listPermissions = (res) => __awaiter(void 0, void 0, void 0, function* () {
    let permissions = yield prismaClient_1.prisma.permission.findMany();
    return res.status(200).json({
        data: permissions,
        count: permissions.length,
    });
});
exports.listPermissions = listPermissions;
const listPermissionOfUser = (res, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, exports.getUser)(userId))) {
        throw new ApiError_1.default("user not found", 404);
    }
    const permissions = yield prismaClient_1.prisma.userPermission.findMany({
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
exports.listPermissionOfUser = listPermissionOfUser;
const listPermissionOfRole = (res, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, exports.getRole)(roleId))) {
        throw new ApiError_1.default("role not found", 404);
    }
    let permissions = yield prismaClient_1.prisma.rolePermission.findMany({
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
exports.listPermissionOfRole = listPermissionOfRole;

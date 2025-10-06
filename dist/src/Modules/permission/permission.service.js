"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPermissionOfRole = exports.listPermissionOfUser = exports.listPermissions = exports.assignPermissionToRole = exports.assignPermissionToUser = exports.seeder = exports.getRole = exports.getUser = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const permissions_1 = require("./permissions");
const getUser = async (userId) => {
    return prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
};
exports.getUser = getUser;
const getRole = async (roleId) => {
    return prismaClient_1.prisma.role.findUnique({ where: { id: roleId } });
};
exports.getRole = getRole;
const seeder = async (res) => {
    await prismaClient_1.prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany();
        await tx.userPermission.deleteMany();
        await tx.permission.deleteMany();
        for (const permission of permissions_1.permissions) {
            await tx.permission.upsert({
                where: { name: permission.name },
                update: {},
                create: permission,
            });
        }
    });
    return res.status(201).json({
        status: "success",
        message: "Permissions seeded successfully",
    });
};
exports.seeder = seeder;
const assignPermissionToUser = async (res, id, body, userId) => {
    if (userId === id) {
        throw new ApiError_1.default("you not allow to change your Permissions ..!", 401);
    }
    const user = await prismaClient_1.prisma.user.findUnique({
        where: { id },
        include: {
            userPermissions: true,
        },
    });
    if (!user) {
        throw new ApiError_1.default("User not found", 404);
    }
    // Fetch permissions by name
    const permissions = await prismaClient_1.prisma.permission.findMany({
        where: {
            name: { in: body.permissionNames },
        },
    });
    if (permissions.length !== body.permissionNames.length) {
        throw new ApiError_1.default("One or more permissions not found", 404);
    }
    await prismaClient_1.prisma.$transaction(async (tx) => {
        await tx.userPermission.deleteMany({ where: { userId: id } });
        const userPermissions = permissions.map((permission) => ({
            userId: id,
            permissionId: permission.id,
        }));
        await tx.userPermission.createMany({
            data: userPermissions,
        });
    });
    return res.status(200).json({
        message: "Permissions assigned to user successfully",
    });
};
exports.assignPermissionToUser = assignPermissionToUser;
const assignPermissionToRole = async (res, id, body) => {
    const role = await prismaClient_1.prisma.role.findUnique({
        where: { id },
        include: {
            rolePermissions: true,
        },
    });
    if (!role) {
        throw new ApiError_1.default("Role not found", 404);
    }
    // Fetch permissions by name
    const permissions = await prismaClient_1.prisma.permission.findMany({
        where: {
            name: { in: body.permissionNames },
        },
    });
    if (permissions.length !== body.permissionNames.length) {
        throw new ApiError_1.default("One or more permissions not found", 404);
    }
    await prismaClient_1.prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        const rolePermissions = permissions.map((permission) => ({
            roleId: id,
            permissionId: permission.id,
        }));
        await tx.rolePermission.createMany({
            data: rolePermissions,
        });
    });
    return res.status(200).json({
        message: "Permissions assigned to role successfully",
    });
};
exports.assignPermissionToRole = assignPermissionToRole;
const listPermissions = async (res) => {
    let permissions = await prismaClient_1.prisma.permission.findMany();
    return res.status(200).json({
        data: permissions,
        count: permissions.length,
    });
};
exports.listPermissions = listPermissions;
const listPermissionOfUser = async (res, userId) => {
    if (!(await (0, exports.getUser)(userId))) {
        throw new ApiError_1.default("user not found", 404);
    }
    const permissions = await prismaClient_1.prisma.userPermission.findMany({
        where: { userId },
        include: {
            permission: true,
        },
    });
    return res.status(200).json({
        data: permissions,
        count: permissions.length,
    });
};
exports.listPermissionOfUser = listPermissionOfUser;
const listPermissionOfRole = async (res, roleId) => {
    if (!(await (0, exports.getRole)(roleId))) {
        throw new ApiError_1.default("role not found", 404);
    }
    let permissions = await prismaClient_1.prisma.rolePermission.findMany({
        where: { roleId },
        include: {
            permission: true,
        },
    });
    return res.status(200).json({
        data: permissions,
        count: permissions.length,
    });
};
exports.listPermissionOfRole = listPermissionOfRole;
//# sourceMappingURL=permission.service.js.map
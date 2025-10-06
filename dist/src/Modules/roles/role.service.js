"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRole = exports.updateRole = exports.getRoleById = exports.listRoleUser = exports.assignRoleToUser = exports.getRole = exports.getUser = exports.listRole = exports.createRole = exports.roleExist = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const roleExist = async (name) => {
    return prismaClient_1.prisma.role.findFirst({ where: { name } });
};
exports.roleExist = roleExist;
const createRole = async (res, body) => {
    if (await (0, exports.roleExist)(body.name))
        throw new ApiError_1.default("this role name already exist", 409);
    const role = await prismaClient_1.prisma.role.create({ data: body });
    return res.status(200).json(role);
};
exports.createRole = createRole;
const listRole = async (res, query) => {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.role, query);
    await apiFeatures.filter().search("role"); // Specify the model name, 'user' in this case
    await apiFeatures.paginateWithCount(); // Get the total count for pagination
    // Execute the query and get the result and pagination
    const { result, pagination } = await apiFeatures.exec("role");
    return res.status(200).json({
        data: result,
        pagination: pagination,
    });
};
exports.listRole = listRole;
const getUser = async (userId) => {
    return prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
};
exports.getUser = getUser;
const getRole = async (roleId) => {
    return prismaClient_1.prisma.role.findUnique({
        where: { id: parseInt(roleId, 10) },
    });
};
exports.getRole = getRole;
const assignRoleToUser = async (res, userId, roleId, id) => {
    if (!(await (0, exports.getUser)(userId))) {
        throw new ApiError_1.default("user not found", 404);
    }
    else if (!(await (0, exports.getRole)(roleId))) {
        throw new ApiError_1.default("role not found", 404);
    }
    if (userId === id) {
        throw new ApiError_1.default("you not allow to change your Role ..!", 401);
    }
    await prismaClient_1.prisma.userRole.deleteMany({
        where: {
            userId,
        },
    });
    await prismaClient_1.prisma.userRole.create({
        data: {
            userId,
            roleId: parseInt(roleId, 10),
        },
    });
    return res.json({ message: "assigning role to user successfully" });
};
exports.assignRoleToUser = assignRoleToUser;
const listRoleUser = async (res, id) => {
    let all = await prismaClient_1.prisma.userRole.findMany({
        where: { userId: id },
        include: {
            user: true,
            role: true,
        },
    });
    res.status(200).json(all);
};
exports.listRoleUser = listRoleUser;
const getRoleById = async (id) => {
    return prismaClient_1.prisma.role.findUnique({
        where: { id },
        include: {
            rolePermissions: true,
        },
    });
};
exports.getRoleById = getRoleById;
const updateRole = async (res, id, body) => {
    if (!(await (0, exports.getRoleById)(id)))
        throw new ApiError_1.default("role not found");
    if (await (0, exports.roleExist)(body.name)) {
        throw new ApiError_1.default("this role name already exist", 409);
    }
    await prismaClient_1.prisma.role.update({
        where: { id },
        data: body,
    });
    return res.status(200).json({ message: "role updated successfully" });
};
exports.updateRole = updateRole;
const DeleteRole = async (res, id) => {
    if (!(await (0, exports.getRoleById)(id))) {
        throw new ApiError_1.default("role not found");
    }
    await prismaClient_1.prisma.userRole.deleteMany({
        where: {
            roleId: id,
        },
    });
    await prismaClient_1.prisma.rolePermission.deleteMany({
        where: {
            roleId: id,
        },
    });
    await prismaClient_1.prisma.role.delete({
        where: { id },
    });
    return res.status(200).json({ message: "role deleted successfully" });
};
exports.DeleteRole = DeleteRole;
//# sourceMappingURL=role.service.js.map
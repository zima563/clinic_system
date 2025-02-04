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
exports.DeleteRole = exports.updateRole = exports.getRoleById = exports.listRoleUser = exports.assignRoleToUser = exports.getRole = exports.getUser = exports.listRole = exports.createRole = exports.roleExist = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const roleExist = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.findFirst({ where: { name } });
});
exports.roleExist = roleExist;
const createRole = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.create({ data: body });
});
exports.createRole = createRole;
const listRole = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.role, query);
    yield apiFeatures.filter().search("role"); // Specify the model name, 'user' in this case
    yield apiFeatures.paginateWithCount(); // Get the total count for pagination
    // Execute the query and get the result and pagination
    const { result, pagination } = yield apiFeatures.exec("role");
    return {
        result,
        pagination,
    };
});
exports.listRole = listRole;
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.user.findUnique({ where: { id: userId } });
});
exports.getUser = getUser;
const getRole = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.findUnique({
        where: { id: parseInt(roleId, 10) },
    });
});
exports.getRole = getRole;
const assignRoleToUser = (userId, roleId, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === id) {
        throw new ApiError_1.default("you not allow to deactive your Account ..!", 401);
    }
    yield prismaClient_1.prisma.userRole.deleteMany({
        where: {
            userId,
        },
    });
    return prismaClient_1.prisma.userRole.create({
        data: {
            userId,
            roleId: parseInt(roleId, 10),
        },
    });
});
exports.assignRoleToUser = assignRoleToUser;
const listRoleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.userRole.findMany({
        where: { userId: id },
        include: {
            user: true,
            role: true,
        },
    });
});
exports.listRoleUser = listRoleUser;
const getRoleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.findUnique({
        where: { id },
        include: {
            rolePermissions: true,
        },
    });
});
exports.getRoleById = getRoleById;
const updateRole = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.role.update({
        where: { id },
        data: body,
    });
});
exports.updateRole = updateRole;
const DeleteRole = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.prisma.userRole.deleteMany({
        where: {
            roleId: id,
        },
    });
    yield prismaClient_1.prisma.rolePermission.deleteMany({
        where: {
            roleId: id,
        },
    });
    yield prismaClient_1.prisma.role.delete({
        where: { id },
    });
});
exports.DeleteRole = DeleteRole;

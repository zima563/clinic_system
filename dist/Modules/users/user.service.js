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
exports.getPermissionRelatedWithRole = exports.getUserRole = exports.getUserPermissions = exports.findUser = exports.deleteUser = exports.deactiveUser = exports.changePassword = exports.updateUser = exports.getUserById = exports.getAllUser = exports.addUser = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const addUser = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.user.create({ data: body });
});
exports.addUser = addUser;
const getAllUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        isDeleted: false,
    };
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.user, query);
    yield apiFeatures.filter(baseFilter).sort().limitedFields().search("user");
    yield apiFeatures.paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("user");
    return {
        result,
        pagination,
    };
});
exports.getAllUser = getAllUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.user.findUnique({
        where: { id },
        include: {
            userRoles: {
                select: {
                    role: true,
                },
            },
            userPermissions: {
                select: {
                    permission: true,
                },
            },
        },
    });
});
exports.getUserById = getUserById;
const updateUser = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.user.update({
        where: { id },
        data: body,
    });
});
exports.updateUser = updateUser;
const changePassword = (id, body, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!bcrypt_1.default.compareSync(body.currentPassword, user.password)) {
        throw new ApiError_1.default("Your Current Password is incorrect");
    }
    body.password = bcrypt_1.default.hashSync(body.password, 8);
    return yield prismaClient_1.prisma.user.update({
        where: { id },
        data: {
            password: body.password,
        },
    });
});
exports.changePassword = changePassword;
const deactiveUser = (id, user, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === id) {
        throw new ApiError_1.default("you not allow to deactive your Account ..!", 401);
    }
    if (user.isActive) {
        yield prismaClient_1.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
    else {
        yield prismaClient_1.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
    }
});
exports.deactiveUser = deactiveUser;
const deleteUser = (id, user, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (userId === id) {
        throw new ApiError_1.default("you not allow to delete your Account ..!", 401);
    }
    if (!user.isDeleted) {
        yield prismaClient_1.prisma.user.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
    else {
        yield prismaClient_1.prisma.user.update({
            where: { id },
            data: { isDeleted: false },
        });
    }
});
exports.deleteUser = deleteUser;
const findUser = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.user.findFirst({
        where: {
            OR: [{ phone: body.emailOrPhone }, { email: body.emailOrPhone }],
        },
    });
});
exports.findUser = findUser;
const getUserPermissions = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.userPermission.findMany({
        where: { userId: user.id },
        include: { permission: true },
    });
});
exports.getUserPermissions = getUserPermissions;
const getUserRole = (user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.userRole.findFirst({
        where: { userId: user.id },
        include: { role: true },
    });
});
exports.getUserRole = getUserRole;
const getPermissionRelatedWithRole = (userRole) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.rolePermission.findMany({
        where: { roleId: userRole.roleId },
        include: { permission: true },
    });
});
exports.getPermissionRelatedWithRole = getPermissionRelatedWithRole;

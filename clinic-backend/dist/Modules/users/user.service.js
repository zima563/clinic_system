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
exports.login = exports.getPermissionRelatedWithRole = exports.getUserRole = exports.getUserPermissions = exports.findUser = exports.deleteUser = exports.deactiveUser = exports.changePassword = exports.updateUser = exports.getUserById = exports.getUser = exports.profile = exports.getAllUser = exports.addUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const addUser = (res, body) => __awaiter(void 0, void 0, void 0, function* () {
    body.password = bcrypt_1.default.hashSync(body.password, 10);
    let user = yield prismaClient_1.prisma.user.create({ data: body });
    return res.status(201).json(user);
});
exports.addUser = addUser;
const getAllUser = (res, query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        isDeleted: false,
    };
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.user, query);
    yield apiFeatures.filter(baseFilter).sort().limitedFields().search("user");
    yield apiFeatures.paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("user");
    return res.status(200).json({
        data: result,
        pagination: pagination,
    });
});
exports.getAllUser = getAllUser;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.user;
    return res.status(201).json(user);
});
exports.profile = profile;
const getUser = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserById)(id);
    if (!user)
        throw new ApiError_1.default("user not found", 404);
    return res.status(201).json(user);
});
exports.getUser = getUser;
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
const updateUser = (res, id, body) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserById)(id);
    if (!user)
        throw new ApiError_1.default("user not found", 404);
    yield prismaClient_1.prisma.user.update({
        where: { id },
        data: body,
    });
    return res.status(201).json({ message: "user updated successfully", user });
});
exports.updateUser = updateUser;
const changePassword = (res, id, body) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserById)(id);
    if (!user)
        throw new ApiError_1.default("user not found", 404);
    if (!bcrypt_1.default.compareSync(body.currentPassword, user.password)) {
        throw new ApiError_1.default("Your Current Password is incorrect");
    }
    body.password = bcrypt_1.default.hashSync(body.password, 8);
    yield prismaClient_1.prisma.user.update({
        where: { id },
        data: {
            password: body.password,
        },
    });
    return res.status(201).json({ message: "user updated successfully" });
});
exports.changePassword = changePassword;
const deactiveUser = (res, id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserById)(id);
    if (!user)
        throw new ApiError_1.default("user not found", 404);
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
    let updatedUser = yield (0, exports.getUserById)(id);
    return res
        .status(201)
        .json({ message: "user Deactivated successfully", updatedUser });
});
exports.deactiveUser = deactiveUser;
const deleteUser = (res, id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.getUserById)(id);
    if (!user)
        throw new ApiError_1.default("user not found", 404);
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
    let updatedUser = yield (0, exports.getUserById)(id);
    return res
        .status(201)
        .json({ message: "user Deleted successfully", updatedUser });
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
const login = (res, body) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.findUser)(body);
    if (!(user && bcrypt_1.default.compareSync(body.password, user.password))) {
        throw new ApiError_1.default("email or password incorrect");
    }
    else {
        // Generate JWT token
        let token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_KEY);
        // Fetch user's direct permissions
        const userPermissions = yield (0, exports.getUserPermissions)(user);
        // Fetch user's role
        const userRole = yield (0, exports.getUserRole)(user);
        // Fetch permissions related to the user's role
        const rolePermissions = userRole
            ? yield (0, exports.getPermissionRelatedWithRole)(userRole)
            : [];
        // Extract unique permissions for the response
        const allPermissions = new Set([
            ...userPermissions.map((up) => up.permission.name),
            ...rolePermissions.map((rp) => rp.permission.name),
        ]);
        // Return response with token and combined unique permissions
        return res.status(200).json({
            token,
            permissions: Array.from(allPermissions),
        });
    }
});
exports.login = login;

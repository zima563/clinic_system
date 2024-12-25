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
exports.userControllers = void 0;
const protectedRoute_1 = require("./../../middlewares/protectedRoute");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const user_validations_1 = require("./user.validations");
const emailExists_1 = require("../../middlewares/emailExists");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const phoneExist_1 = require("../../middlewares/phoneExist");
const prisma = new client_1.PrismaClient();
let userControllers = class userControllers {
    // Apply CheckEmailMiddleware only for the POST route (user creation)
    addUser(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            body.password = bcrypt_1.default.hashSync(body.password, 10);
            let user = yield prisma.user.create({ data: body });
            return res.status(201).json(user);
        });
    }
    // GET /all does not use CheckEmailMiddleware
    allUsers(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Add isDeleted = false condition to the query
                const baseFilter = {
                    isDeleted: false, // Ensure we only fetch users where isDeleted is false
                };
                // Initialize ApiFeatures with the Prisma model and the search query
                const apiFeatures = new ApiFeatures_1.default(prisma.user, query);
                // Apply filters, sorting, field selection, search, and pagination
                yield apiFeatures
                    .filter(baseFilter)
                    .sort()
                    .limitedFields()
                    .search("user"); // Specify the model name, 'user' in this case
                yield apiFeatures.paginateWithCount();
                // Execute the query and get the result and pagination
                const { result, pagination } = yield apiFeatures.exec("user");
                // Return the result along with pagination information
                return res.status(200).json({
                    data: result,
                    pagination: pagination, // Use the pagination here
                });
            }
            catch (error) {
                console.error("Error fetching users:", error);
                // Ensure no further responses are sent
                if (!res.headersSent) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            }
        });
    }
    getOneUser(id, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield prisma.user.findUnique({
                where: { id },
            });
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            return res.status(201).json(user);
        });
    }
    updateUser(id, body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            yield prisma.user.update({
                where: { id },
                data: body,
            });
            return res.status(201).json({ message: "user updated successfully", user });
        });
    }
    deactiveUser(id, body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            if (user.isActive) {
                yield prisma.user.update({
                    where: { id },
                    data: { isActive: false },
                });
            }
            else {
                yield prisma.user.update({
                    where: { id },
                    data: { isActive: true },
                });
            }
            let updatedUser = yield prisma.user.findUnique({ where: { id } });
            return res
                .status(201)
                .json({ message: "user Deactivated successfully", updatedUser });
        });
    }
    DeleteUser(id, body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            if (!user.isDeleted) {
                yield prisma.user.update({
                    where: { id },
                    data: { isDeleted: true },
                });
            }
            else {
                yield prisma.user.update({
                    where: { id },
                    data: { isDeleted: false },
                });
            }
            let updatedUser = yield prisma.user.findUnique({ where: { id } });
            return res
                .status(201)
                .json({ message: "user Deleted successfully", updatedUser });
        });
    }
    login(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield prisma.user.findFirst({
                where: {
                    OR: [{ phone: body.emailOrPhone }, { email: body.emailOrPhone }],
                },
            });
            if (!(user && bcrypt_1.default.compareSync(body.password, user.password))) {
                throw new ApiError_1.default("email or password incorrect");
            }
            else {
                // Generate JWT token
                let token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_KEY);
                // Fetch user's direct permissions
                const userPermissions = yield prisma.userPermission.findMany({
                    where: { userId: user.id },
                    include: { permission: true },
                });
                // Fetch user's role
                const userRole = yield prisma.userRole.findFirst({
                    where: { userId: user.id },
                    include: { role: true },
                });
                // Fetch permissions related to the user's role
                const rolePermissions = userRole
                    ? yield prisma.rolePermission.findMany({
                        where: { roleId: userRole.roleId },
                        include: { permission: true },
                    })
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
    }
};
exports.userControllers = userControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("addUser"), (0, validation_1.createValidationMiddleware)(user_validations_1.addUser)),
    (0, routing_controllers_1.UseBefore)(emailExists_1.CheckEmailMiddleware),
    (0, routing_controllers_1.UseBefore)(phoneExist_1.CheckPhoneMiddleware),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "addUser", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("allUsers")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "allUsers", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getOneUser")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Function]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "getOneUser", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updateUser"), (0, validation_1.createValidationMiddleware)(user_validations_1.UpdateUser)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Function]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "updateUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("deactiveUser")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Function]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "deactiveUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/soft/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("DeleteUser")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Function]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "DeleteUser", null);
__decorate([
    (0, routing_controllers_1.Post)("/login"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(user_validations_1.loginValidation)),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "login", null);
exports.userControllers = userControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/users")
], userControllers);

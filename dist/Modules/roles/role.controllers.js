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
exports.roleControllers = void 0;
const client_1 = require("@prisma/client");
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const role_validation_1 = require("./role.validation");
const protectedRoute_1 = require("../../middlewares/protectedRoute");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const prisma = new client_1.PrismaClient();
let roleControllers = class roleControllers {
    createRole(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield prisma.role.findFirst({ where: { name: body.name } })) {
                throw new ApiError_1.default("this role name already exist", 409);
            }
            let role = yield prisma.role.create({ data: body });
            res.status(200).json(role);
        });
    }
    // GET /all does not use CheckEmailMiddleware
    allRoles(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiFeatures = new ApiFeatures_1.default(prisma.role, query);
                yield apiFeatures.filter().search("role"); // Specify the model name, 'user' in this case
                yield apiFeatures.paginateWithCount(); // Get the total count for pagination
                // Execute the query and get the result and pagination
                const { result, pagination } = yield apiFeatures.exec("role");
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
    assignRoleToUser(userId, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.user.findUnique({ where: { id: userId } }))) {
                throw new ApiError_1.default("user not found", 404);
            }
            else if (!(yield prisma.role.findUnique({
                where: { id: parseInt(body.roleId, 10) },
            }))) {
                throw new ApiError_1.default("role not found", 404);
            }
            yield prisma.userRole.create({
                data: {
                    userId,
                    roleId: parseInt(body.roleId, 10),
                },
            });
            res.json({ message: "assigning role to user successfully" });
        });
    }
    getAllRoleUsers(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let all = yield prisma.userRole.findMany({
                include: {
                    user: true,
                    role: true,
                },
            });
            res.status(200).json(all);
        });
    }
    updateRole(id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.role.findUnique({ where: { id } }))) {
                throw new ApiError_1.default("role not found");
            }
            if (yield prisma.role.findFirst({ where: { name: body.name } })) {
                throw new ApiError_1.default("this role name already exist", 409);
            }
            yield prisma.role.update({
                where: { id },
                data: body,
            });
            return res.status(200).json({ message: "role updated successfully" });
        });
    }
    deleteRole(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.role.findUnique({ where: { id } }))) {
                throw new ApiError_1.default("role not found");
            }
            yield prisma.role.delete({
                where: { id },
            });
            return res.status(200).json({ message: "role deleted successfully" });
        });
    }
};
exports.roleControllers = roleControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("createRole"), (0, validation_1.createValidationMiddleware)(role_validation_1.createRoleValidation)),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], roleControllers.prototype, "createRole", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("allRoles")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], roleControllers.prototype, "allRoles", null);
__decorate([
    (0, routing_controllers_1.Post)("/userRole/:userId"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("assignRoleToUser"), (0, validation_1.createValidationMiddleware)(role_validation_1.assignRoleToUserValidation)),
    __param(0, (0, routing_controllers_1.Param)("userId")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], roleControllers.prototype, "assignRoleToUser", null);
__decorate([
    (0, routing_controllers_1.Get)("/userRole/all"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getAllRoleUsers")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], roleControllers.prototype, "getAllRoleUsers", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updateRole"), (0, validation_1.createValidationMiddleware)(role_validation_1.updateRoleValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], roleControllers.prototype, "updateRole", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("deleteRole")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], roleControllers.prototype, "deleteRole", null);
exports.roleControllers = roleControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/roles")
], roleControllers);

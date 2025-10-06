"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const user_validations_1 = require("./user.validations");
const emailExists_1 = require("../../middlewares/emailExists");
const phoneExist_1 = require("../../middlewares/phoneExist");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const userServices = __importStar(require("./user.service"));
let userControllers = class userControllers {
    // Apply CheckEmailMiddleware only for the POST route (user creation)
    async addUser(body, res) {
        return await userServices.addUser(res, body);
    }
    async allUsers(query, res) {
        return await userServices.getAllUser(res, query);
    }
    async getUserProfile(req, res) {
        return await userServices.profile(req, res);
    }
    async getOneUser(id, res) {
        return await userServices.getUser(res, id);
    }
    async updateUserProfile(req, body, res) {
        await userServices.updateUser(res, req.user.id, body);
    }
    async ChangePassword(req, body, res) {
        return await userServices.changePassword(res, req.user.id, body);
    }
    async updateUser(id, body, res) {
        return await userServices.updateUser(res, id, body);
    }
    async deactiveUser(req, id, body, res) {
        return await userServices.deactiveUser(res, id, req?.user.id);
    }
    async DeleteUser(req, id, body, res) {
        return await userServices.deleteUser(res, id, req.user.id);
    }
    async login(body, res) {
        return await userServices.login(res, body);
    }
};
exports.userControllers = userControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("addUser"), (0, validation_1.createValidationMiddleware)(user_validations_1.addUser), emailExists_1.CheckEmailMiddleware, phoneExist_1.CheckPhoneMiddleware),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "addUser", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("allUsers")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "allUsers", null);
__decorate([
    (0, routing_controllers_1.Get)("/profile"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("profile")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "getUserProfile", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getOneUser")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "getOneUser", null);
__decorate([
    (0, routing_controllers_1.Put)("/updateProfile"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateUserProfile"), (0, validation_1.createValidationMiddleware)(user_validations_1.UpdateUserProfile)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "updateUserProfile", null);
__decorate([
    (0, routing_controllers_1.Patch)("/ChangePassword"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("ChangePassword"), (0, validation_1.createValidationMiddleware)(user_validations_1.changePassword)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "ChangePassword", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateUser"), (0, validation_1.createValidationMiddleware)(user_validations_1.UpdateUser)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "updateUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("deactiveUser")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "deactiveUser", null);
__decorate([
    (0, routing_controllers_1.Patch)("/soft/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("DeleteUser")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
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
//# sourceMappingURL=user.controllers.js.map
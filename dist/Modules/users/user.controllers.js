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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    addUser(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.addUser(res, body);
        });
    }
    allUsers(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.getAllUser(res, query);
        });
    }
    getUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.profile(req, res);
        });
    }
    getOneUser(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.getUser(res, id);
        });
    }
    updateUserProfile(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield userServices.updateUser(res, req.user.id, body);
        });
    }
    ChangePassword(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.changePassword(res, req.user.id, body);
        });
    }
    updateUser(id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.updateUser(res, id, body);
        });
    }
    deactiveUser(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.deactiveUser(res, id, req === null || req === void 0 ? void 0 : req.user.id);
        });
    }
    DeleteUser(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.deleteUser(res, id, req.user.id);
        });
    }
    login(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userServices.login(res, body);
        });
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

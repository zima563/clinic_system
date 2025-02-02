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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const user_validations_1 = require("./user.validations");
const emailExists_1 = require("../../middlewares/emailExists");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const phoneExist_1 = require("../../middlewares/phoneExist");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const userServices = __importStar(require("./user.service"));
let userControllers = class userControllers {
    // Apply CheckEmailMiddleware only for the POST route (user creation)
    addUser(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            body.password = bcrypt_1.default.hashSync(body.password, 10);
            let user = yield userServices.addUser(body);
            return res.status(201).json(user);
        });
    }
    allUsers(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield userServices.getAllUser(query);
            return res.status(200).json({
                data: data.result,
                pagination: data.pagination,
            });
        });
    }
    getOneUser(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield userServices.getUserById(id);
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            return res.status(201).json(user);
        });
    }
    updateUser(id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield userServices.getUserById(id);
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            yield userServices.updateUser(id, body);
            return res.status(201).json({ message: "user updated successfully", user });
        });
    }
    deactiveUser(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield userServices.getUserById(id);
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            yield userServices.deactiveUser(id, user, req === null || req === void 0 ? void 0 : req.user.id);
            let updatedUser = yield userServices.getUserById(id);
            return res
                .status(201)
                .json({ message: "user Deactivated successfully", updatedUser });
        });
    }
    DeleteUser(id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield userServices.getUserById(id);
            if (!user)
                throw new ApiError_1.default("user not found", 404);
            yield userServices.deleteUser(id, user);
            let updatedUser = yield userServices.getUserById(id);
            return res
                .status(201)
                .json({ message: "user Deleted successfully", updatedUser });
        });
    }
    login(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield userServices.findUser(body);
            if (!(user && bcrypt_1.default.compareSync(body.password, user.password))) {
                throw new ApiError_1.default("email or password incorrect");
            }
            else {
                // Generate JWT token
                let token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_KEY);
                // Fetch user's direct permissions
                const userPermissions = yield userServices.getUserPermissions(user);
                // Fetch user's role
                const userRole = yield userServices.getUserRole(user);
                // Fetch permissions related to the user's role
                const rolePermissions = userRole
                    ? yield userServices.getPermissionRelatedWithRole(userRole)
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
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getOneUser")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], userControllers.prototype, "getOneUser", null);
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
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
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

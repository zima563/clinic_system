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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const routing_controllers_1 = require("routing-controllers");
const joi_1 = __importDefault(require("joi"));
const validation_1 = require("../../middlewares/validation");
const permissionService = __importStar(require("./permission.service"));
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
let PermissionController = class PermissionController {
    async seedPermissions(res) {
        return await permissionService.seeder(res);
    }
    async assignPermissionsToUser(req, id, body, res) {
        return await permissionService.assignPermissionToUser(res, id, body, req.user.id);
    }
    async assignPermissionsToRole(id, body, res) {
        return await permissionService.assignPermissionToRole(res, id, body);
    }
    async ListPermissions(req, res) {
        return await permissionService.listPermissions(res);
    }
    async ListUserPermissions(userId, res) {
        return await permissionService.listPermissionOfUser(res, userId);
    }
    async ListRolePermissions(roleId, res) {
        return await permissionService.listPermissionOfRole(res, roleId);
    }
};
exports.PermissionController = PermissionController;
PermissionController.permissionSchema = joi_1.default.object({
    id: joi_1.default.string().required().messages({
        "string.base": "id should be a string",
        "string.empty": "id cannot be empty",
        "any.required": "id is required",
    }),
    permissionNames: joi_1.default.array()
        .items(joi_1.default.string().required().messages({
        "string.base": "Each permissionName should be a string",
        "string.empty": "permissionName cannot be empty",
        "any.required": "permissionName is required",
    }))
        .min(1)
        .required()
        .messages({
        "array.base": "permissionNames should be an array",
        "array.min": "permissionNames should contain at least one element",
    }),
});
__decorate([
    (0, routing_controllers_1.Post)("/seed"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("seedPermissions")),
    __param(0, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "seedPermissions", null);
__decorate([
    (0, routing_controllers_1.Post)("/assignToUser/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("assignPermissionsToUser"), (0, validation_1.createValidationMiddleware)(PermissionController.permissionSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "assignPermissionsToUser", null);
__decorate([
    (0, routing_controllers_1.Post)("/assignToRole/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("assignPermissionsToRole"), (0, validation_1.createValidationMiddleware)(PermissionController.permissionSchema)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "assignPermissionsToRole", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("ListPermissions")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListPermissions", null);
__decorate([
    (0, routing_controllers_1.Get)("/user/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("ListUserPermissions")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListUserPermissions", null);
__decorate([
    (0, routing_controllers_1.Get)("/role/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("ListRolePermissions")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "ListRolePermissions", null);
exports.PermissionController = PermissionController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/permissions")
], PermissionController);
//# sourceMappingURL=seeder.js.map
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
exports.serviceController = void 0;
const protectedRoute_1 = require("./../../middlewares/protectedRoute");
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const services_validation_1 = require("./services.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const uploadFile_1 = __importDefault(require("../../middlewares/uploadFile"));
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const services = __importStar(require("./services.service"));
const prisma = new client_1.PrismaClient();
let serviceController = class serviceController {
    addService(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (yield prisma.service.findFirst({ where: { title: body.title } })) {
                throw new ApiError_1.default("service title already exists", 409);
            }
            body.icon = (_a = (yield services.uploadFile(req, res))) !== null && _a !== void 0 ? _a : "";
            let service = yield services.createService(Object.assign(Object.assign({}, body), { createdBy: req.user.id }));
            return res.status(200).json(service);
        });
    }
    allServices(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseFilter = {
                isDeleted: false,
            };
            let data = yield services.listServices(baseFilter, query);
            return res.status(200).json({
                data: data.result,
                pagination: data.pagination,
            });
        });
    }
    updateService(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield services.getServiceById(id);
            yield services.CheckTitleExist(id, body.title);
            let fileName = yield services.uploadFileForUpdate(req, service);
            yield services.updateService(id, body, service, fileName);
            return res.status(200).json({ message: "service updated successfully" });
        });
    }
    getService(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield services.getServiceById(id);
            if (!service) {
                throw new ApiError_1.default("service not found", 404);
            }
            service.img = process.env.base_url + service.img;
            return res.status(200).json(service);
        });
    }
    deactiveService(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield services.getServiceById(id);
            if (!service) {
                throw new ApiError_1.default("service not found", 404);
            }
            yield services.deactiveService(id, service);
            let updatedService = yield services.getServiceById(id);
            return res.status(200).json(updatedService);
        });
    }
};
exports.serviceController = serviceController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("addService"), (0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(services_validation_1.addServiceValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "addService", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("allServices")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "allServices", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateService"), (0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(services_validation_1.updateServiceValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "updateService", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getService"), (0, validation_1.createValidationMiddleware)(services_validation_1.updateServiceValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "getService", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("deactiveService")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "deactiveService", null);
exports.serviceController = serviceController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/services")
], serviceController);

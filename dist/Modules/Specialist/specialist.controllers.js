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
exports.specialtyControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const uploadFile_1 = __importDefault(require("../../middlewares/uploadFile")); // Correct import
const validation_1 = require("../../middlewares/validation"); // Correct import
const client_1 = require("@prisma/client");
const specialist_validation_1 = require("./specialist.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const protectedRoute_1 = require("../../middlewares/protectedRoute");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const prisma = new client_1.PrismaClient();
const specialtyServices = __importStar(require("./specialist.service"));
let specialtyControllers = class specialtyControllers {
    createSpecialty(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield specialtyServices.checkSpecialtyExist(body);
            let iconFilename = yield specialtyServices.uploadFileForSpecialty(req, res);
            // Save the specialty to the database
            const specialty = yield specialtyServices.createSpecialty(iconFilename, body);
            return res.status(200).json(specialty);
        });
    }
    updateSpecialty(req, body, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let specialty = yield specialtyServices.findSpecialtyById(id);
            if (!specialty) {
                throw new ApiError_1.default("specialty not found", 404);
            }
            yield specialtyServices.checkSpecialtyExist(body);
            let fileName = yield specialtyServices.uploadFileForSpecialtyUpdate(req, specialty);
            yield specialtyServices.updateSpecialty(id, fileName, body);
            return res.status(200).json({ message: "specialty updated successfully" });
        });
    }
    allSpecialtys(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield specialtyServices.getListSpecial(query);
            return res.status(200).json({
                data: data.result,
                pagination: data.pagination,
                count: data.result.length,
            });
        });
    }
    getOneSpecialty(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let specialty = yield specialtyServices.findSpecialtyById(id);
            if (!specialty) {
                throw new ApiError_1.default("specialty not found");
            }
            specialty.icon = process.env.base_url + specialty.icon;
            return res.status(200).json(specialty);
        });
    }
    DeleteSpecialty(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let specialty = yield specialtyServices.findSpecialtyById(id);
            if (!specialty) {
                throw new ApiError_1.default("specialty not found");
            }
            yield specialtyServices.deleteSpecialty(id, specialty);
            return res.status(200).json({ message: "specialty deleted succesfully" });
        });
    }
};
exports.specialtyControllers = specialtyControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("createSpecialty"), (0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(specialist_validation_1.specialtySchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "createSpecialty", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateSpecialty"), (0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(specialist_validation_1.updateSpecialtySchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)("id")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "updateSpecialty", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("allSpecialtys")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "allSpecialtys", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getOneSpecialty")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "getOneSpecialty", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getOneSpecialty")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "DeleteSpecialty", null);
exports.specialtyControllers = specialtyControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/specialist")
], specialtyControllers);

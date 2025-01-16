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
exports.patientController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const patient_validation_1 = require("./patient.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const validators_1 = require("./validators");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const patientService = __importStar(require("./patient.service"));
let patientController = class patientController {
    addPatient(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, validators_1.patientExist)(body.phone);
            const birthdate = new Date(body.birthdate);
            body.birthdate = birthdate.toISOString();
            let patient = yield patientService.createPatient(body);
            return res.status(200).json(patient);
        });
    }
    updatePatient(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, validators_1.patientExist)(body.phone);
            if (body.birthdate) {
                const birthdate = new Date(body.birthdate);
                body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
            }
            yield patientService.updatePatient(id, body);
            return res.status(200).json({ message: "patient updated successfully" });
        });
    }
    listPatient(req, query, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield patientService.listPatient(query);
            // Return the result along with pagination information
            return res.status(200).json({
                data: data.result,
                pagination: data.pagination, // Use the pagination here
                count: data.result.length,
            });
        });
    }
    getPatient(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let patient = yield patientService.getPatient(id);
            if (!patient) {
                throw new ApiError_1.default("patient not found", 404);
            }
            return res.status(200).json(patient);
        });
    }
    deletePatient(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let patient = yield patientService.getPatient(id);
            if (!patient)
                throw new ApiError_1.default("patient not found", 404);
            yield patientService.deletePatient(id);
            return res.status(200).json({ message: "patient deleted successfully!" });
        });
    }
};
exports.patientController = patientController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("addPatient"), (0, validation_1.createValidationMiddleware)(patient_validation_1.addPatientSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "addPatient", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updatePatient"), (0, validation_1.createValidationMiddleware)(patient_validation_1.UpdatePatientSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "updatePatient", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("listPatient")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "listPatient", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getPatient")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "getPatient", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "deletePatient", null);
exports.patientController = patientController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/patients")
], patientController);

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
exports.patientController = void 0;
const protectedRoute_1 = require("./../../middlewares/protectedRoute");
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const patient_validation_1 = require("./patient.validation");
const phoneExist_1 = require("../../middlewares/phoneExist");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const prisma = new client_1.PrismaClient();
let patientController = class patientController {
    addPatient(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (body.phone) {
                let patient = yield prisma.patient.findUnique({
                    where: { phone: body.phone },
                });
                if (patient) {
                    throw new ApiError_1.default("patient's phone already exist");
                }
            }
            // Convert birthdate to ISO 8601 format if it's not already
            if (body.birthdate) {
                const birthdate = new Date(body.birthdate);
                body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
            }
            let patient = yield prisma.patient.create({
                data: body,
            });
            return res.status(200).json(patient);
        });
    }
    updatePatient(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (body.phone) {
                let patient = yield prisma.patient.findUnique({
                    where: { phone: body.phone, NOT: { id } },
                });
                if (patient) {
                    throw new ApiError_1.default("patient's phone already exist");
                }
            }
            if (body.birthdate) {
                const birthdate = new Date(body.birthdate);
                body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
            }
            let patient = yield prisma.patient.findUnique({
                where: { id },
            });
            if (!patient) {
                throw new ApiError_1.default("patient not found", 404);
            }
            yield prisma.patient.update({
                where: { id },
                data: body,
            });
            return res.status(200).json({ message: "patient updated successfully" });
        });
    }
    listPatient(req, query, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize ApiFeatures with the Prisma model and the search query
            const apiFeatures = new ApiFeatures_1.default(prisma.patient, query);
            // Apply filters, sorting, field selection, search, and pagination
            yield apiFeatures.filter().sort().limitedFields().search("patient"); // Specify the model name, 'user' in this case
            yield apiFeatures.paginateWithCount();
            // Execute the query and get the result and pagination
            const { result, pagination } = yield apiFeatures.exec("patient");
            // Return the result along with pagination information
            return res.status(200).json({
                data: result,
                pagination: pagination, // Use the pagination here
                count: result.length,
            });
        });
    }
    getPatient(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let patient = yield prisma.patient.findUnique({
                where: { id },
            });
            if (!patient) {
                throw new ApiError_1.default("patient not found", 404);
            }
            return res.status(200).json(patient);
        });
    }
};
exports.patientController = patientController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("addPatient"), (0, validation_1.createValidationMiddleware)(patient_validation_1.addPatientSchema), phoneExist_1.CheckPhoneMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "addPatient", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updatePatient"), (0, validation_1.createValidationMiddleware)(patient_validation_1.UpdatePatientSchema)),
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
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("listPatient")),
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
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getPatient")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "getPatient", null);
exports.patientController = patientController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/patients")
], patientController);

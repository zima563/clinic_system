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
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const patient_validation_1 = require("./patient.validation");
const phoneExist_1 = require("../../middlewares/phoneExist");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let patientController = class patientController {
    addPatient(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
};
exports.patientController = patientController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(patient_validation_1.addPatientSchema), phoneExist_1.CheckPhoneMiddleware),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], patientController.prototype, "addPatient", null);
exports.patientController = patientController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/patients")
], patientController);

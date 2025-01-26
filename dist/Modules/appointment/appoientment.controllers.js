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
exports.appointmentController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const appointment_validation_1 = require("./appointment.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const validators_1 = require("./validators");
const appointmentService = __importStar(require("./appoientment.service"));
let appointmentController = class appointmentController {
    addAppointment(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield (0, validators_1.validatePatient)(body.patientId);
            yield (0, validators_1.validateSchedule)(body.scheduleId);
            let appointment = yield appointmentService.createAppointment(Object.assign(Object.assign({}, body), { dateTime: new Date(body.dateTime).toISOString(), createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
            return res.status(200).json(appointment);
        });
    }
    getPatientAppointment(req, res, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!patientId)
                throw new ApiError_1.default("patientId must exist", 401);
            let appointments = yield appointmentService.getAllAppoientmentPatient(patientId);
            return res.status(200).json({
                data: appointments,
                count: appointments.length,
            });
        });
    }
    getAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let appointments = yield appointmentService.getAppointments();
            appointments.map((app) => {
                app.schedule.doctor.image =
                    process.env.base_url + app.schedule.doctor.image;
            });
            return res.status(200).json({
                data: appointments,
                count: appointments.length,
            });
        });
    }
    showAppointmnetDetail(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let appointment = yield appointmentService.showAppointmnetDetail(id);
            if (!appointment) {
                throw new ApiError_1.default("appointment not found", 404);
            }
            return res.status(200).json(appointment);
        });
    }
    updateStatus(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, validators_1.validateAppoientment)(id);
            yield appointmentService.updateStatus(id, body);
            return res
                .status(200)
                .json({ message: `appointment updated successfully to ${body.status}` });
        });
    }
    updateAppointment(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, validators_1.validatePatient)(body.patientId);
            yield (0, validators_1.validateSchedule)(body.scheduleId);
            yield (0, validators_1.validateAppoientment)(id);
            if (body.date) {
                body.date = new Date(body.date);
            }
            yield appointmentService.updateAppointment(id, body);
            return res
                .status(200)
                .json({ message: `appointment updated successfully` });
        });
    }
};
exports.appointmentController = appointmentController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("addAppointment"), (0, validation_1.createValidationMiddleware)(appointment_validation_1.addAppointmentValidationSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "addAppointment", null);
__decorate([
    (0, routing_controllers_1.Get)("/patient"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getPatientAppointment")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParam)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "getPatientAppointment", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getAppointment")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "getAppointment", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("showAppointmnetDetail")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "showAppointmnetDetail", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateStatus"), (0, validation_1.createValidationMiddleware)(appointment_validation_1.updateAppointmentStatusSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "updateStatus", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateAppointment"), (0, validation_1.createValidationMiddleware)(appointment_validation_1.updateAppointmentSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "updateAppointment", null);
exports.appointmentController = appointmentController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/appointment")
], appointmentController);

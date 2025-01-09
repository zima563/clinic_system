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
exports.appointmentController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const appointment_validation_1 = require("./appointment.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const protectedRoute_1 = require("../../middlewares/protectedRoute");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const patientExist_1 = require("../../middlewares/patientExist");
const scheduleExist_1 = require("../../middlewares/scheduleExist");
const prisma = new client_1.PrismaClient();
let appointmentController = class appointmentController {
    addAppointment(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let appointment = yield prisma.appointment.create({
                data: Object.assign(Object.assign({}, body), { dateTime: new Date(body.dateTime).toISOString() }),
            });
            return res.status(200).json(appointment);
        });
    }
    getPatientAppointment(req, res, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!patientId) {
                throw new ApiError_1.default("patientId must exist", 401);
            }
            let appointments = yield prisma.appointment.findMany({
                where: { patientId },
                include: {
                    schedule: true,
                    patient: true,
                },
            });
            return res.status(200).json({
                data: appointments,
                count: appointments.length,
            });
        });
    }
    getAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const normalizedDate = today.toISOString().split("T")[0];
            let appointments = yield prisma.appointment.findMany({
                where: {
                // date: `${normalizedDate}T00:00:00.000Z`,
                },
                include: {
                    schedule: {
                        include: {
                            service: true,
                            doctor: true,
                        },
                    },
                    date: true,
                    patient: true,
                },
            });
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
            let appointment = yield prisma.appointment.findUnique({
                where: {
                    id,
                },
                include: {
                    schedule: true,
                    patient: true,
                },
            });
            if (!appointment) {
                throw new ApiError_1.default("appointment not found", 404);
            }
            return res.status(200).json(appointment);
        });
    }
    updateStatus(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.appointment.findUnique({ where: { id } }))) {
                throw new ApiError_1.default("appointment not found", 404);
            }
            yield prisma.appointment.update({
                where: { id },
                data: {
                    status: body.status,
                },
            });
            return res
                .status(200)
                .json({ message: `appointment updated successfully to ${body.status}` });
        });
    }
    updateAppointment(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { date, patientId, scheduleId } = body;
            if (patientId) {
                if (!(yield prisma.patient.findUnique({ where: { id: patientId } }))) {
                    throw new ApiError_1.default("patient not found with this patientId");
                }
            }
            if (scheduleId) {
                if (!(yield prisma.schedule.findUnique({ where: { id: scheduleId } }))) {
                    throw new ApiError_1.default("patient not found with this scheduleId");
                }
            }
            if (!(yield prisma.appointment.findUnique({ where: { id } }))) {
                throw new ApiError_1.default("appointment not found", 404);
            }
            if (date) {
                date = new Date(date);
            }
            yield prisma.appointment.update({
                where: { id },
                data: body,
            });
            return res
                .status(200)
                .json({ message: `appointment updated successfully` });
        });
    }
};
exports.appointmentController = appointmentController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("addAppointment"), patientExist_1.checkPatientMiddleware, scheduleExist_1.checkScheduleMiddleware, (0, validation_1.createValidationMiddleware)(appointment_validation_1.addAppointmentValidationSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "addAppointment", null);
__decorate([
    (0, routing_controllers_1.Get)("/patient"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getPatientAppointment")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParam)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "getPatientAppointment", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getAppointment")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "getAppointment", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("showAppointmnetDetail")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], appointmentController.prototype, "showAppointmnetDetail", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updateStatus"), (0, validation_1.createValidationMiddleware)(appointment_validation_1.updateAppointmentStatusSchema)),
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
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updateAppointment"), (0, validation_1.createValidationMiddleware)(appointment_validation_1.updateAppointmentSchema)),
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

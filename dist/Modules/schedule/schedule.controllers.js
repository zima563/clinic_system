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
exports.scheduleControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const schedule_validations_1 = require("./schedule.validations");
const client_1 = require("@prisma/client");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const protectedRoute_1 = require("../../middlewares/protectedRoute");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const prisma = new client_1.PrismaClient();
let scheduleControllers = class scheduleControllers {
    addSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, servicesId, price, dates } = req.body;
            const schedule = yield prisma.schedule.create({
                data: {
                    doctorId,
                    servicesId,
                    price,
                    dates: {
                        create: dates.map((date) => ({
                            day: date.day,
                            fromTime: date.fromTime,
                            toTime: date.toTime,
                        })),
                    },
                },
            });
            return res.status(200).json(schedule);
        });
    }
    listSchedules(req, res, doctorId, servicesId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedDoctorId = doctorId ? parseInt(doctorId, 10) : undefined;
            const parsedServicesId = servicesId ? parseInt(servicesId, 10) : undefined;
            const query = Object.assign(Object.assign({}, req.query), { doctorId: parsedDoctorId, servicesId: parsedServicesId });
            const apiFeatures = new ApiFeatures_1.default(prisma.schedule, query);
            yield apiFeatures.filter().limitedFields().sort().search("schedule");
            yield apiFeatures.paginateWithCount();
            const { result, pagination } = yield apiFeatures.exec("schedule");
            return res.status(200).json({
                data: result,
                pagination,
                count: result.length,
            });
        });
    }
    listDates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { scheduleId } = req.body;
            let dates = yield prisma.date.findMany({
                where: {
                    scheduleId,
                },
            });
            return res.status(200).json(dates);
        });
    }
    showScheduleDetails(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let schedule = yield prisma.schedule.findUnique({
                where: { id },
            });
            if (!schedule) {
                throw new ApiError_1.default("schedule not found", 404);
            }
            return res.status(200).json(schedule);
        });
    }
    updateSchedule(id, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, servicesId, price, dates } = req.body;
            const schedule = yield prisma.schedule.findUnique({
                where: {
                    id,
                },
            });
            if (dates) {
                yield prisma.date.deleteMany({
                    where: {
                        scheduleId: id,
                    },
                });
            }
            if (!schedule) {
                throw new ApiError_1.default("schedule not found", 404);
            }
            yield prisma.schedule.update({
                where: {
                    id,
                },
                data: {
                    doctorId,
                    servicesId,
                    price,
                    dates: {
                        create: dates === null || dates === void 0 ? void 0 : dates.map((date) => ({
                            day: date.day,
                            fromTime: date.fromTime,
                            toTime: date.toTime,
                        })),
                    },
                },
            });
            let updatedSchedule = yield prisma.schedule.findUnique({
                where: { id },
            });
            // Return the updated schedules
            return res.status(200).json(updatedSchedule);
        });
    }
    deleteSchedule(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the schedule exists
            const schedule = yield prisma.schedule.findUnique({
                where: { id },
            });
            if (!schedule) {
                throw new ApiError_1.default("schedule not found", 404);
            }
            yield prisma.schedule.delete({
                where: { id },
            });
            return res.status(200).json({ message: "Schedule deleted successfully" });
        });
    }
};
exports.scheduleControllers = scheduleControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(
    // ProtectRoutesMiddleware,
    // roleOrPermissionMiddleware("addSchedule"),
    (0, validation_1.createValidationMiddleware)(schedule_validations_1.addscheduleSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "addSchedule", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("listSchedules")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParam)("doctorId")),
    __param(3, (0, routing_controllers_1.QueryParam)("servicesId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "listSchedules", null);
__decorate([
    (0, routing_controllers_1.Get)("/dates"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "listDates", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("showScheduleDetails")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "showScheduleDetails", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(
    // ProtectRoutesMiddleware,
    // roleOrPermissionMiddleware("updateSchedule"),
    (0, validation_1.createValidationMiddleware)(schedule_validations_1.updateScheduleSchema)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Req)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "updateSchedule", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("deleteSchedule")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "deleteSchedule", null);
exports.scheduleControllers = scheduleControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/schedule")
], scheduleControllers);

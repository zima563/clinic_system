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
exports.scheduleControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const schedule_validations_1 = require("./schedule.validations");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const scheduleServices = __importStar(require("./schedule.service"));
let scheduleControllers = class scheduleControllers {
    addSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { doctorId, servicesId, price, dates } = req.body;
            const schedule = yield scheduleServices.addSchedule((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, doctorId, servicesId, price, dates);
            return res.status(200).json(schedule);
        });
    }
    listSchedules(req, res, doctorId, servicesId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedDoctorId = doctorId ? parseInt(doctorId, 10) : undefined;
            const parsedServicesId = servicesId ? parseInt(servicesId, 10) : undefined;
            const query = Object.assign(Object.assign({}, req.query), { doctorId: parsedDoctorId, servicesId: parsedServicesId });
            const data = yield scheduleServices.listSchedules(query);
            return res.status(200).json({
                data: data.result,
                pagination: data.pagination,
                count: data.result.length,
            });
        });
    }
    listDates(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let dates = yield scheduleServices.listOfDates(id);
            return res.status(200).json(dates);
        });
    }
    showScheduleDetails(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let schedule = yield scheduleServices.showDetailsOfSchedule(id);
            if (!schedule) {
                throw new ApiError_1.default("schedule not found", 404);
            }
            return res.status(200).json(schedule);
        });
    }
    updateSchedule(id, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, servicesId, price, dates } = req.body;
            const schedule = yield scheduleServices.findScheduleById(id);
            if (dates) {
                yield scheduleServices.deleteDates(id);
            }
            if (!schedule) {
                throw new ApiError_1.default("schedule not found", 404);
            }
            yield scheduleServices.updateSchedule(id, doctorId, servicesId, price, dates);
            let updatedSchedule = yield scheduleServices.findScheduleById(id);
            // Return the updated schedules
            return res.status(200).json(updatedSchedule);
        });
    }
    deleteSchedule(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the schedule exists
            const schedule = yield scheduleServices.findScheduleById(id);
            if (!schedule) {
                throw new ApiError_1.default("schedule not found", 404);
            }
            yield scheduleServices.deleteDates(id);
            yield scheduleServices.deleteSchedule(id);
            return res.status(200).json({ message: "Schedule deleted successfully" });
        });
    }
};
exports.scheduleControllers = scheduleControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("addSchedule"), (0, validation_1.createValidationMiddleware)(schedule_validations_1.addscheduleSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "addSchedule", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("listSchedules")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParam)("doctorId")),
    __param(3, (0, routing_controllers_1.QueryParam)("servicesId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "listSchedules", null);
__decorate([
    (0, routing_controllers_1.Get)("/dates/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("listDates")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "listDates", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("showScheduleDetails")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "showScheduleDetails", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateSchedule"), (0, validation_1.createValidationMiddleware)(schedule_validations_1.updateScheduleSchema)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Req)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "updateSchedule", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("deleteSchedule")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], scheduleControllers.prototype, "deleteSchedule", null);
exports.scheduleControllers = scheduleControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/schedule")
], scheduleControllers);

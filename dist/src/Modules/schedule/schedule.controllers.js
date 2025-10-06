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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const schedule_validations_1 = require("./schedule.validations");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const scheduleServices = __importStar(require("./schedule.service"));
let scheduleControllers = class scheduleControllers {
    async addSchedule(req, res) {
        const { doctorId, servicesId, price, dates } = req.body;
        return await scheduleServices.addSchedule(res, req.user?.id, doctorId, servicesId, price, dates);
    }
    async listSchedules(req, res, doctorId, servicesId) {
        const parsedDoctorId = doctorId ? parseInt(doctorId, 10) : undefined;
        const parsedServicesId = servicesId ? parseInt(servicesId, 10) : undefined;
        const query = {
            ...req.query,
            doctorId: parsedDoctorId,
            servicesId: parsedServicesId,
        };
        return await scheduleServices.listSchedules(res, query);
    }
    async listDates(id, res) {
        return await scheduleServices.listOfDates(res, id);
    }
    async showScheduleDetails(req, id, res) {
        return await scheduleServices.showDetailsOfSchedule(res, id);
    }
    async updateSchedule(id, req, res) {
        const { doctorId, servicesId, price, dates } = req.body;
        return await scheduleServices.updateSchedule(res, id, doctorId, servicesId, price, dates);
    }
    async deleteSchedule(id, res) {
        return await scheduleServices.deleteSchedule(res, id);
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
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
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
//# sourceMappingURL=schedule.controllers.js.map
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
exports.visitController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const visit_validation_1 = require("./visit.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const prisma = new client_1.PrismaClient();
const visitServices = __importStar(require("./visit.service"));
let visitController = class visitController {
    createVisit(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patientId, visitDetails, paymentMethod } = body;
            const visitDetailsWithPrices = yield Promise.all(visitDetails.map((detail) => __awaiter(this, void 0, void 0, function* () {
                return (Object.assign(Object.assign({}, detail), { price: yield visitServices.fetchPriceForSchedule(detail.scheduleId), patientId }));
            })));
            const total = visitDetailsWithPrices.reduce((sum, detail) => sum + detail.price, 0);
            const result = yield visitServices.createVisit(total, paymentMethod, req, visitDetailsWithPrices);
            if (body.appointmentId) {
                yield visitServices.updateAppointmentToComfirmed(body.appointmentId);
            }
            return res.status(201).json(Object.assign({ message: "Visit created successfully with associated invoice details." }, result));
        });
    }
    getAllVisits(req, res, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield visitServices.getAllVisits(query);
            // Return the response
            return res.status(200).json({
                visits: data.result,
                pagination: data.pagination,
                count: data.result.length,
            });
        });
    }
    showVisitDetails(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let visit = yield visitServices.getVisitById(id);
            if (!visit) {
                throw new ApiError_1.default("visit not found");
            }
            let VisitDetails = yield visitServices.getVisitDetails(id);
            return res.status(200).json({
                VisitDetails,
                visit,
            });
        });
    }
    appendVisitDetails(req, body, visitId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { visitDetails, patientId } = body;
            const visit = yield visitServices.getVisitById(visitId);
            if (!visit) {
                throw new ApiError_1.default("Visit not found");
            }
            let visitInvoice = yield visitServices.getVisitInvoice(visitId);
            if (!visitInvoice) {
                throw new ApiError_1.default("Visit invoice not found");
            }
            const visitDetailsWithPrices = yield Promise.all(visitDetails.map((detail) => __awaiter(this, void 0, void 0, function* () {
                return (Object.assign(Object.assign({}, detail), { price: yield visitServices.fetchPriceForSchedule(detail.scheduleId), patientId }));
            })));
            const totalVisitPrice = visitDetailsWithPrices.reduce((sum, detail) => sum + detail.price, 0);
            yield visitServices.appendVisitDetails(visitDetailsWithPrices, visit, req, visitInvoice, totalVisitPrice, visitId);
            return res.status(200).json({
                message: "Visit details updated successfully",
            });
        });
    }
    removeVisitDetails(req, visitDetailId, visitId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const visit = yield visitServices.getVisitById(visitId);
            if (!visit) {
                throw new ApiError_1.default("Visit not found");
            }
            let visitInvoice = yield visitServices.getVisitInvoice(visitId);
            if (!visitInvoice) {
                throw new ApiError_1.default("Visit invoice not found");
            }
            // Fetch visit details related to this visit
            const visitDetail = yield visitServices.getVisitDetailsWithInclude(visitDetailId);
            if (!visitDetail) {
                throw new ApiError_1.default("visit detail not found");
            }
            yield visitServices.removeVisitDetails(visitDetail, visitDetailId, visit, visitId, visitInvoice);
            return res.status(200).json({
                message: "Visit details removed successfully",
            });
        });
    }
    deleteVisit(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let visit = yield visitServices.getVisitIncludeInvoiceDetails(id);
            if (!visit) {
                throw new ApiError_1.default("visit not found", 404);
            }
            yield visitServices.deleteVisitAndDeleteAllRelatedData(id, visit);
            return res
                .status(200)
                .json({ message: "Visit and all related data deleted successfully." });
        });
    }
};
exports.visitController = visitController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("createVisit"), (0, validation_1.createValidationMiddleware)(visit_validation_1.createVisitSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "createVisit", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("getAllVisits")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParams)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "getAllVisits", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("showVisitDetails")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "showVisitDetails", null);
__decorate([
    (0, routing_controllers_1.Post)("/:visitId/details"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("appendVisitDetails"), (0, validation_1.createValidationMiddleware)(visit_validation_1.appendVisitSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)("visitId")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "appendVisitDetails", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:visitId/details/:visitDetailId"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("removeVisitDetails")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("visitDetailId")),
    __param(2, (0, routing_controllers_1.Param)("visitId")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "removeVisitDetails", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("deleteVisit")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "deleteVisit", null);
exports.visitController = visitController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/visit")
], visitController);

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
exports.visitController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const visit_validation_1 = require("./visit.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const prisma = new client_1.PrismaClient();
let visitController = class visitController {
    createVisit(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { visitDetails } = body;
            const total = visitDetails.reduce((sum, detail) => sum + detail.price, 0);
            const visit = yield prisma.visit.create({
                data: {
                    total,
                },
            });
            const createdVisitDetails = yield prisma.visitDetail.createMany({
                data: visitDetails.map((detail) => ({
                    visitId: visit.id,
                    patientId: detail.patientId,
                    status: detail.status,
                    price: detail.price,
                    scheduleId: detail.scheduleId,
                })),
            });
            const invoice = yield prisma.invoice.create({
                data: {
                    total,
                },
            });
            yield prisma.visitInvoice.create({
                data: {
                    visitId: visit.id,
                    invoiceId: invoice.id,
                },
            });
            for (const invoiceData of visitDetails) {
                const invoiceDetail = yield prisma.invoiceDetail.create({
                    data: {
                        description: visit.rf,
                        amount: invoiceData.price,
                        invoiceId: invoice.id, // Link the invoice detail to the invoice
                    },
                });
            }
            return res.status(201).json({
                message: "Visit created successfully with associated invoice details.",
                visit,
                visitDetails: createdVisitDetails,
                invoice,
            });
        });
    }
    showVisitDetails(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let visit = yield prisma.visit.findUnique({ where: { id } });
            if (!visit) {
                throw new ApiError_1.default("visit not found");
            }
            let VisitDetails = yield prisma.visitDetail.findMany({
                where: { visitId: id },
                include: {},
            });
            return res.status(200).json({
                data: VisitDetails,
                total: visit.total,
            });
        });
    }
    getAllVisits(req, res, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = {};
            if (patientId) {
                filter.patientId = patientId;
            }
            let visits = yield prisma.visit.findMany({
                where: {
                    details: {
                        some: {
                            patientId,
                        },
                    },
                },
                include: {
                    details: true,
                },
            });
            return res.status(200).json({
                data: visits,
                count: visits.length,
            });
        });
    }
};
exports.visitController = visitController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(visit_validation_1.createVisitSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "createVisit", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "showVisitDetails", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParam)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "getAllVisits", null);
exports.visitController = visitController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/visit")
], visitController);

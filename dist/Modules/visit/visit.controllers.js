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
const protectedRoute_1 = require("./../../middlewares/protectedRoute");
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const visit_validation_1 = require("./visit.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const library_1 = require("@prisma/client/runtime/library");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const prisma = new client_1.PrismaClient();
let visitController = class visitController {
    createVisit(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patientId, visitDetails, paymentMethod } = body;
            const fetchPriceForSchedule = (scheduleId) => __awaiter(this, void 0, void 0, function* () {
                let schedule = yield prisma.schedule.findUnique({
                    where: { id: scheduleId },
                });
                return schedule === null || schedule === void 0 ? void 0 : schedule.price;
            });
            const visitDetailsWithPrices = yield Promise.all(visitDetails.map((detail) => __awaiter(this, void 0, void 0, function* () {
                return (Object.assign(Object.assign({}, detail), { price: yield fetchPriceForSchedule(detail.scheduleId), patientId }));
            })));
            const total = visitDetailsWithPrices.reduce((sum, detail) => sum + detail.price, 0);
            const result = yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                // Create a Visit record
                const visit = yield prisma.visit.create({
                    data: {
                        total,
                        paymentMethod, // Or dynamically set based on request
                    },
                });
                // Create visit details
                const createdVisitDetails = yield Promise.all(visitDetailsWithPrices.map((detail) => __awaiter(this, void 0, void 0, function* () {
                    return prisma.visitDetail.create({
                        data: {
                            visitId: visit.id,
                            patientId: detail.patientId,
                            price: detail.price,
                            scheduleId: detail.scheduleId,
                        },
                    });
                })));
                // Create invoice with a unique RF (reference)
                const invoice = yield prisma.invoice.create({
                    data: {
                        total,
                        ex: true,
                        paymentMethod,
                    },
                });
                // Link visit and invoice
                yield prisma.visitInvoice.create({
                    data: {
                        visitId: visit.id,
                        invoiceId: invoice.id,
                    },
                });
                // Create invoice details linked to visit details
                const createdInvoiceDetails = yield Promise.all(createdVisitDetails.map((visitDetail) => prisma.invoiceDetail.create({
                    data: {
                        description: `Detail for schedule ${visitDetail.scheduleId}`, // Customize description as needed
                        amount: visitDetail.price,
                        invoiceId: invoice.id,
                        visitDetailsId: visitDetail.id, // Link InvoiceDetail to VisitDetail
                    },
                })));
                return { visit, createdVisitDetails, invoice, createdInvoiceDetails };
            }));
            if (body.appointmentId) {
                let appointment = yield prisma.appointment.update({
                    where: {
                        id: body.appointmentId,
                    },
                    data: {
                        status: "confirmed",
                    },
                });
            }
            return res.status(201).json(Object.assign({ message: "Visit created successfully with associated invoice details." }, result));
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
                include: {
                    patient: true,
                    schedule: true,
                    visit: true,
                },
            });
            return res.status(200).json({
                VisitDetails,
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
    appendVisitDetails(req, body, visitId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { visitDetails } = body;
            // Ensure the visit exists
            const visit = yield prisma.visit.findUnique({ where: { id: visitId } });
            if (!visit) {
                throw new ApiError_1.default("Visit not found");
            }
            // Check if the visit has an associated invoice
            let visitInvoice = yield prisma.visitInvoice.findFirst({
                where: { visitId },
                include: { invoice: true },
            });
            if (!visitInvoice) {
                throw new ApiError_1.default("Visit invoice not found");
            }
            // Start a Prisma transaction to ensure atomic operations
            const result = yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                // Add the new visit details
                const createdVisitDetails = yield prisma.visitDetail.createMany({
                    data: visitDetails.map((detail) => ({
                        visitId,
                        patientId: detail.patientId,
                        status: detail.status,
                        price: detail.price,
                        scheduleId: detail.scheduleId,
                    })),
                });
                // Link each InvoiceDetail to the corresponding VisitDetail
                for (let i = 0; i < visitDetails.length; i++) {
                    const visitDetail = yield prisma.visitDetail.findFirst({
                        where: { visitId, scheduleId: visitDetails[i].scheduleId },
                    });
                    // Create invoice detail and link to the visit detail
                    if (visitDetail) {
                        yield prisma.invoiceDetail.create({
                            data: {
                                description: `Charge for patient ${visit.rf}`, // Customize description
                                amount: visitDetails[i].price,
                                invoiceId: visitInvoice === null || visitInvoice === void 0 ? void 0 : visitInvoice.invoiceId,
                                visitDetailsId: visitDetail.id, // Link to the VisitDetail
                            },
                        });
                    }
                }
                // Calculate the total amount to be added
                const totalVisitPrice = visitDetails.reduce((sum, detail) => sum + parseFloat(detail.price), 0);
                // Use Decimal to ensure precision in financial calculations
                const roundedTotalVisitPrice = new library_1.Decimal(totalVisitPrice).toFixed(2);
                // Update the visit's total cost
                yield prisma.visit.update({
                    where: { id: visitId },
                    data: { total: visit.total.add(new library_1.Decimal(roundedTotalVisitPrice)) },
                });
                // Update the invoice's total cost
                yield prisma.invoice.update({
                    where: { id: visitInvoice.invoiceId },
                    data: {
                        total: visitInvoice.invoice.total.add(new library_1.Decimal(roundedTotalVisitPrice)),
                    },
                });
                return { createdVisitDetails, visitInvoice };
            }));
            return res.status(200).json({
                message: "Visit details updated successfully",
            });
        });
    }
    removeVisitDetails(req, visitDetailId, visitId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const visit = yield prisma.visit.findUnique({ where: { id: visitId } });
            if (!visit) {
                throw new ApiError_1.default("Visit not found");
            }
            let visitInvoice = yield prisma.visitInvoice.findFirst({
                where: { visitId },
                include: { invoice: true },
            });
            if (!visitInvoice) {
                throw new ApiError_1.default("Visit invoice not found");
            }
            // Fetch visit details related to this visit
            const visitDetail = yield prisma.visitDetail.findUnique({
                where: { id: visitDetailId },
                include: { invoiceDetail: true }, // Include related invoice details
            });
            if (!visitDetail) {
                throw new ApiError_1.default("visit detail not found");
            }
            const result = yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                yield prisma.invoiceDetail.deleteMany({
                    where: { visitDetailsId: visitDetail.id },
                });
                yield prisma.visitDetail.delete({
                    where: { id: visitDetailId },
                });
                const totalVisitPrice = visit.total.toNumber() - parseFloat(visitDetail.price.toString());
                const updatedVisitTotal = new library_1.Decimal(totalVisitPrice);
                yield prisma.visit.update({
                    where: { id: visitId },
                    data: { total: updatedVisitTotal },
                });
                const totalInvoicePrice = (visitInvoice === null || visitInvoice === void 0 ? void 0 : visitInvoice.invoice.total.toNumber()) || 0;
                const updatedInvoiceTotal = new library_1.Decimal(totalInvoicePrice).sub(new library_1.Decimal(visitDetail.price.toString()));
                yield prisma.invoice.update({
                    where: { id: visitInvoice.invoiceId },
                    data: { total: updatedInvoiceTotal },
                });
            }));
            return res.status(200).json({
                message: "Visit details removed successfully",
            });
        });
    }
    deleteVisit(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let visit = yield prisma.visit.findUnique({
                where: { id },
                include: {
                    details: true,
                    VisitInvoice: {
                        include: {
                            invoice: {
                                include: { details: true },
                            },
                        },
                    },
                },
            });
            if (!visit) {
                throw new ApiError_1.default("visit not found", 404);
            }
            yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                for (const VisitInvoice of visit.VisitInvoice) {
                    const invoiceId = VisitInvoice.invoiceId;
                    yield prisma.invoiceDetail.deleteMany({
                        where: { invoiceId },
                    });
                    yield prisma.visitDetail.deleteMany({
                        where: { visitId: id },
                    });
                    yield prisma.visitInvoice.deleteMany({
                        where: { visitId: id },
                    });
                    yield prisma.invoice.delete({
                        where: { id: invoiceId },
                    });
                    yield prisma.visit.delete({
                        where: { id },
                    });
                }
            }));
            return res
                .status(200)
                .json({ message: "Visit and all related data deleted successfully." });
        });
    }
};
exports.visitController = visitController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("createVisit"), (0, validation_1.createValidationMiddleware)(visit_validation_1.createVisitSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "createVisit", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("showVisitDetails")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "showVisitDetails", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getAllVisits")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __param(2, (0, routing_controllers_1.QueryParam)("patientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], visitController.prototype, "getAllVisits", null);
__decorate([
    (0, routing_controllers_1.Post)("/:visitId/details"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("appendVisitDetails"), (0, validation_1.createValidationMiddleware)(visit_validation_1.appendVisitSchema)),
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
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("removeVisitDetails")),
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
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("deleteVisit")),
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

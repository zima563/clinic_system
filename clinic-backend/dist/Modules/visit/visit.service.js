"use strict";
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
exports.deleteVisitAndDeleteAllRelatedData = exports.getVisitIncludeInvoiceDetails = exports.removeVisitDetails = exports.getVisitDetailsWithInclude = exports.appendVisitDetails = exports.getVisitInvoice = exports.getVisitDetails = exports.getVisitById = exports.getAllVisits = exports.updateAppointmentToComfirmed = exports.createVisit = exports.fetchPriceForSchedule = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const library_1 = require("@prisma/client/runtime/library");
const fetchPriceForSchedule = (scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    let schedule = yield prismaClient_1.prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    return schedule === null || schedule === void 0 ? void 0 : schedule.price;
});
exports.fetchPriceForSchedule = fetchPriceForSchedule;
const createVisit = (total, paymentMethod, req, visitDetailsWithPrices) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        // Create a Visit record
        const visit = yield prisma.visit.create({
            data: {
                total,
                paymentMethod, // Or dynamically set based on request
                createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
            },
        });
        // Create visit details
        const createdVisitDetails = yield Promise.all(visitDetailsWithPrices.map((detail) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            return prisma.visitDetail.create({
                data: {
                    visitId: visit.id,
                    patientId: detail.patientId,
                    price: detail.price,
                    scheduleId: detail.scheduleId,
                    dateId: detail.dateId,
                    createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
                },
            });
        })));
        // Create invoice with a unique RF (reference)
        const invoice = yield prisma.invoice.create({
            data: {
                total,
                ex: true,
                paymentMethod,
                createdBy: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 0,
            },
        });
        // Link visit and invoice
        yield prisma.visitInvoice.create({
            data: {
                visitId: visit.id,
                invoiceId: invoice.id,
                createdBy: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || 0,
            },
        });
        // Create invoice details linked to visit details
        const createdInvoiceDetails = yield Promise.all(createdVisitDetails.map((visitDetail) => {
            var _a;
            return prisma.invoiceDetail.create({
                data: {
                    description: `Detail for schedule ${visitDetail.scheduleId}`, // Customize description as needed
                    amount: visitDetail.price,
                    invoiceId: invoice.id,
                    visitDetailsId: visitDetail.id, // Link InvoiceDetail to VisitDetail
                    createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
                },
            });
        }));
        return { visit, createdVisitDetails, invoice, createdInvoiceDetails };
    }));
});
exports.createVisit = createVisit;
const updateAppointmentToComfirmed = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.appointment.update({
        where: {
            id,
        },
        data: {
            status: "confirmed",
        },
    });
});
exports.updateAppointmentToComfirmed = updateAppointmentToComfirmed;
const getAllVisits = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (query.patientId) {
        query.patientId = parseInt(query.patientId, 10);
    }
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.visit, query);
    // Apply the filter for visits
    yield apiFeatures
        .filter()
        .sort()
        .limitedFields()
        .search("visit")
        .paginateWithCount();
    // Use the correct query to get the result and pagination data
    const { result, pagination } = yield apiFeatures.exec("visit");
    return {
        result,
        pagination,
    };
});
exports.getAllVisits = getAllVisits;
const getVisitById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.visit.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    userName: true,
                },
            },
        },
    });
});
exports.getVisitById = getVisitById;
const getVisitDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.visitDetail.findMany({
        where: { visitId: id },
        select: {
            id: true,
            price: true,
            patient: {
                select: {
                    id: true,
                    name: true,
                },
            },
            schedule: {
                select: {
                    id: true,
                    price: true,
                    service: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
            date: {
                select: {
                    id: true,
                    fromTime: true,
                    toTime: true,
                },
            },
        },
    });
});
exports.getVisitDetails = getVisitDetails;
const getVisitInvoice = (visitId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.visitInvoice.findFirst({
        where: { visitId },
        include: { invoice: true },
    });
});
exports.getVisitInvoice = getVisitInvoice;
const appendVisitDetails = (visitDetailsWithPrices, visit, req, visitInvoice, totalVisitPrice, visitId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const createdVisitDetails = yield Promise.all(visitDetailsWithPrices.map((detail) => {
            var _a;
            return prisma.visitDetail.create({
                data: {
                    visitId: visit.id,
                    patientId: detail.patientId,
                    price: detail.price,
                    scheduleId: detail.scheduleId,
                    dateId: detail.dateId,
                    createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
                },
            });
        }));
        // Create InvoiceDetails for each VisitDetail
        yield Promise.all(createdVisitDetails.map((visitDetail, index) => {
            var _a;
            return prisma.invoiceDetail.create({
                data: {
                    description: `Charge for patient ${visit.rf}`, // Customize description if necessary
                    amount: visitDetailsWithPrices[index].price,
                    invoiceId: visitInvoice.invoiceId,
                    visitDetailsId: visitDetail.id,
                    createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
                },
            });
        }));
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
});
exports.appendVisitDetails = appendVisitDetails;
const getVisitDetailsWithInclude = (visitDetailId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.visitDetail.findUnique({
        where: { id: visitDetailId },
        include: { invoiceDetail: true }, // Include related invoice details
    });
});
exports.getVisitDetailsWithInclude = getVisitDetailsWithInclude;
const removeVisitDetails = (visitDetail, visitDetailId, visit, visitId, visitInvoice) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.removeVisitDetails = removeVisitDetails;
const getVisitIncludeInvoiceDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.visit.findUnique({
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
});
exports.getVisitIncludeInvoiceDetails = getVisitIncludeInvoiceDetails;
const deleteVisitAndDeleteAllRelatedData = (id, visit) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.deleteVisitAndDeleteAllRelatedData = deleteVisitAndDeleteAllRelatedData;

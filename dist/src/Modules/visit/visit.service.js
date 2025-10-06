"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVisitAndDeleteAllRelatedData = exports.getVisitIncludeInvoiceDetails = exports.removeVisitDetails = exports.getVisitDetailsWithInclude = exports.appendVisitDetails = exports.getVisitInvoice = exports.getVisitDetails = exports.getVisitById = exports.getAllVisits = exports.updateAppointmentToComfirmed = exports.createVisit = exports.fetchPriceForSchedule = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const library_1 = require("@prisma/client/runtime/library");
const fetchPriceForSchedule = async (scheduleId) => {
    let schedule = await prismaClient_1.prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    return schedule?.price;
};
exports.fetchPriceForSchedule = fetchPriceForSchedule;
const createVisit = async (total, paymentMethod, req, visitDetailsWithPrices) => {
    return await prismaClient_1.prisma.$transaction(async (prisma) => {
        // Create a Visit record
        const visit = await prisma.visit.create({
            data: {
                total,
                paymentMethod, // Or dynamically set based on request
                createdBy: req.user?.id || 0,
            },
        });
        // Create visit details
        const createdVisitDetails = await Promise.all(visitDetailsWithPrices.map(async (detail) => prisma.visitDetail.create({
            data: {
                visitId: visit.id,
                patientId: detail.patientId,
                price: detail.price,
                scheduleId: detail.scheduleId,
                dateId: detail.dateId,
                createdBy: req.user?.id || 0,
            },
        })));
        // Create invoice with a unique RF (reference)
        const invoice = await prisma.invoice.create({
            data: {
                total,
                ex: true,
                paymentMethod,
                createdBy: req.user?.id || 0,
            },
        });
        // Link visit and invoice
        await prisma.visitInvoice.create({
            data: {
                visitId: visit.id,
                invoiceId: invoice.id,
                createdBy: req.user?.id || 0,
            },
        });
        // Create invoice details linked to visit details
        const createdInvoiceDetails = await Promise.all(createdVisitDetails.map((visitDetail) => prisma.invoiceDetail.create({
            data: {
                description: `Detail for schedule ${visitDetail.scheduleId}`, // Customize description as needed
                amount: visitDetail.price,
                invoiceId: invoice.id,
                visitDetailsId: visitDetail.id, // Link InvoiceDetail to VisitDetail
                createdBy: req.user?.id || 0,
            },
        })));
        return { visit, createdVisitDetails, invoice, createdInvoiceDetails };
    });
};
exports.createVisit = createVisit;
const updateAppointmentToComfirmed = async (id) => {
    return await prismaClient_1.prisma.appointment.update({
        where: {
            id,
        },
        data: {
            status: "confirmed",
        },
    });
};
exports.updateAppointmentToComfirmed = updateAppointmentToComfirmed;
const getAllVisits = async (query) => {
    if (query.patientId) {
        query.patientId = parseInt(query.patientId, 10);
    }
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.visit, query);
    // Apply the filter for visits
    await apiFeatures
        .filter()
        .sort()
        .limitedFields()
        .search("visit")
        .paginateWithCount();
    // Use the correct query to get the result and pagination data
    const { result, pagination } = await apiFeatures.exec("visit");
    return {
        result,
        pagination,
    };
};
exports.getAllVisits = getAllVisits;
const getVisitById = async (id) => {
    return await prismaClient_1.prisma.visit.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    userName: true,
                },
            },
        },
    });
};
exports.getVisitById = getVisitById;
const getVisitDetails = async (id) => {
    return await prismaClient_1.prisma.visitDetail.findMany({
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
};
exports.getVisitDetails = getVisitDetails;
const getVisitInvoice = async (visitId) => {
    return await prismaClient_1.prisma.visitInvoice.findFirst({
        where: { visitId },
        include: { invoice: true },
    });
};
exports.getVisitInvoice = getVisitInvoice;
const appendVisitDetails = async (visitDetailsWithPrices, visit, req, visitInvoice, totalVisitPrice, visitId) => {
    return await prismaClient_1.prisma.$transaction(async (prisma) => {
        const createdVisitDetails = await Promise.all(visitDetailsWithPrices.map((detail) => prisma.visitDetail.create({
            data: {
                visitId: visit.id,
                patientId: detail.patientId,
                price: detail.price,
                scheduleId: detail.scheduleId,
                dateId: detail.dateId,
                createdBy: req.user?.id || 0,
            },
        })));
        // Create InvoiceDetails for each VisitDetail
        await Promise.all(createdVisitDetails.map((visitDetail, index) => prisma.invoiceDetail.create({
            data: {
                description: `Charge for patient ${visit.rf}`, // Customize description if necessary
                amount: visitDetailsWithPrices[index].price,
                invoiceId: visitInvoice.invoiceId,
                visitDetailsId: visitDetail.id,
                createdBy: req.user?.id || 0,
            },
        })));
        // Use Decimal to ensure precision in financial calculations
        const roundedTotalVisitPrice = new library_1.Decimal(totalVisitPrice).toFixed(2);
        // Update the visit's total cost
        await prisma.visit.update({
            where: { id: visitId },
            data: { total: visit.total.add(new library_1.Decimal(roundedTotalVisitPrice)) },
        });
        // Update the invoice's total cost
        await prisma.invoice.update({
            where: { id: visitInvoice.invoiceId },
            data: {
                total: visitInvoice.invoice.total.add(new library_1.Decimal(roundedTotalVisitPrice)),
            },
        });
        return { createdVisitDetails, visitInvoice };
    });
};
exports.appendVisitDetails = appendVisitDetails;
const getVisitDetailsWithInclude = async (visitDetailId) => {
    return await prismaClient_1.prisma.visitDetail.findUnique({
        where: { id: visitDetailId },
        include: { invoiceDetail: true }, // Include related invoice details
    });
};
exports.getVisitDetailsWithInclude = getVisitDetailsWithInclude;
const removeVisitDetails = async (visitDetail, visitDetailId, visit, visitId, visitInvoice) => {
    return await prismaClient_1.prisma.$transaction(async (prisma) => {
        await prisma.invoiceDetail.deleteMany({
            where: { visitDetailsId: visitDetail.id },
        });
        await prisma.visitDetail.delete({
            where: { id: visitDetailId },
        });
        const totalVisitPrice = visit.total.toNumber() - parseFloat(visitDetail.price.toString());
        const updatedVisitTotal = new library_1.Decimal(totalVisitPrice);
        await prisma.visit.update({
            where: { id: visitId },
            data: { total: updatedVisitTotal },
        });
        const totalInvoicePrice = visitInvoice?.invoice.total.toNumber() || 0;
        const updatedInvoiceTotal = new library_1.Decimal(totalInvoicePrice).sub(new library_1.Decimal(visitDetail.price.toString()));
        await prisma.invoice.update({
            where: { id: visitInvoice.invoiceId },
            data: { total: updatedInvoiceTotal },
        });
    });
};
exports.removeVisitDetails = removeVisitDetails;
const getVisitIncludeInvoiceDetails = async (id) => {
    return await prismaClient_1.prisma.visit.findUnique({
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
};
exports.getVisitIncludeInvoiceDetails = getVisitIncludeInvoiceDetails;
const deleteVisitAndDeleteAllRelatedData = async (id, visit) => {
    await prismaClient_1.prisma.$transaction(async (prisma) => {
        for (const VisitInvoice of visit.VisitInvoice) {
            const invoiceId = VisitInvoice.invoiceId;
            await prisma.invoiceDetail.deleteMany({
                where: { invoiceId },
            });
            await prisma.visitDetail.deleteMany({
                where: { visitId: id },
            });
            await prisma.visitInvoice.deleteMany({
                where: { visitId: id },
            });
            await prisma.invoice.delete({
                where: { id: invoiceId },
            });
            await prisma.visit.delete({
                where: { id },
            });
        }
    });
};
exports.deleteVisitAndDeleteAllRelatedData = deleteVisitAndDeleteAllRelatedData;
//# sourceMappingURL=visit.service.js.map
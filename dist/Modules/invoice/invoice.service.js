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
exports.removeInvoiceDetail = exports.appendInvoiceDetail = exports.getInvoiceWithDetails = exports.listInvoiceDetails = exports.showInvoiceDetails = exports.pdf_summary = exports.summeryInvoice = exports.updateInvoice = exports.getInvoiceDetails = exports.listInvoice = exports.createInvoiceDetails = exports.createInvoice = void 0;
const pdf_creator_node_1 = __importDefault(require("pdf-creator-node"));
const library_1 = require("@prisma/client/runtime/library");
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const createInvoice = (total) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.invoice.create({
        data: {
            total: total,
            ex: false,
        },
    });
});
exports.createInvoice = createInvoice;
const createInvoiceDetails = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.invoiceDetail.create({
        data: Object.assign({ invoiceId: id }, body),
        include: {
            invoice: true,
        },
    });
});
exports.createInvoiceDetails = createInvoiceDetails;
const listInvoice = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.invoice, query);
    // Apply filtering, sorting, and pagination
    yield apiFeatures.filter().sort().paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("invoice");
    // Calculate the total sum of all `total` values for the filtered results
    const totalSum = yield prismaClient_1.prisma.invoice.aggregate({
        _sum: {
            total: true,
        },
        where: apiFeatures.query.where, // Use the same filtering logic
    });
    return { result, pagination, totalSum };
});
exports.listInvoice = listInvoice;
const getInvoiceDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.invoiceDetail.findUnique({
        where: { id },
    });
});
exports.getInvoiceDetails = getInvoiceDetails;
const updateInvoice = (id, body, invoiceDetail) => __awaiter(void 0, void 0, void 0, function* () {
    if (body.amount) {
        const invoice = yield prismaClient_1.prisma.invoice.findUnique({
            where: { id: invoiceDetail.invoiceId },
        });
        if (!((invoice === null || invoice === void 0 ? void 0 : invoice.total) instanceof library_1.Decimal) ||
            !(invoiceDetail.amount instanceof library_1.Decimal)) {
            throw new ApiError_1.default("Invalid data for amount calculation");
        }
        // Convert values to Decimal if necessary
        const invoiceTotal = new library_1.Decimal((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0);
        const invoiceDetailAmount = new library_1.Decimal(invoiceDetail.amount || 0);
        const bodyAmount = new library_1.Decimal(body.amount || 0);
        const finalTotal = invoiceTotal.minus(invoiceDetailAmount).plus(bodyAmount);
        yield prismaClient_1.prisma.invoice.update({
            where: { id: invoiceDetail.invoiceId },
            data: { total: finalTotal },
        });
    }
    yield prismaClient_1.prisma.invoiceDetail.update({
        where: { id },
        data: body,
    });
});
exports.updateInvoice = updateInvoice;
const summeryInvoice = (date, month) => __awaiter(void 0, void 0, void 0, function* () {
    if (!date && !month) {
        throw new ApiError_1.default("You must provide either a specific date or a month in the format YYYY-MM.");
    }
    let startDate = new Date();
    let endDate = new Date();
    if (date) {
        // For specific day
        startDate = new Date(date);
        endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1); // End of the day
    }
    else if (month) {
        // For specific month
        startDate = new Date(`${month}-01`);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1); // End of the month
    }
    const [exTrueTotal, exFalseTotal, invoices] = yield Promise.all([
        prismaClient_1.prisma.invoice.aggregate({
            _sum: { total: true },
            where: {
                ex: true,
                createdAt: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString(),
                },
            },
        }),
        prismaClient_1.prisma.invoice.aggregate({
            _sum: { total: true },
            where: {
                ex: false,
                createdAt: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString(),
                },
            },
        }),
        prismaClient_1.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString(),
                },
            },
            include: {
                details: true, // Include related invoice details
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);
    const totalExTrue = exTrueTotal._sum.total
        ? exTrueTotal._sum.total.toNumber()
        : 0;
    const totalExFalse = exFalseTotal._sum.total
        ? exFalseTotal._sum.total.toNumber()
        : 0;
    const profit = totalExTrue - totalExFalse;
    return {
        totalExTrue,
        totalExFalse,
        invoices,
        profit,
    };
});
exports.summeryInvoice = summeryInvoice;
const pdf_summary = (date, month, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!date && !month) {
        throw new ApiError_1.default("You must provide either a specific date or a month in the format YYYY-MM.");
    }
    let startDate = new Date();
    let endDate = new Date();
    if (date) {
        startDate = new Date(date);
        endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
    }
    else if (month) {
        startDate = new Date(`${month}-01`);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
    }
    const [exTrueTotal, exFalseTotal, invoices] = yield Promise.all([
        prismaClient_1.prisma.invoice.aggregate({
            _sum: { total: true },
            where: {
                ex: true,
                createdAt: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString(),
                },
            },
        }),
        prismaClient_1.prisma.invoice.aggregate({
            _sum: { total: true },
            where: {
                ex: false,
                createdAt: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString(),
                },
            },
        }),
        prismaClient_1.prisma.invoice.findMany({
            where: {
                createdAt: {
                    gte: startDate.toISOString(),
                    lt: endDate.toISOString(),
                },
            },
            include: {
                details: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);
    const totalExTrue = exTrueTotal._sum.total
        ? exTrueTotal._sum.total.toNumber()
        : 0;
    const totalExFalse = exFalseTotal._sum.total
        ? exFalseTotal._sum.total.toNumber()
        : 0;
    const profit = totalExTrue - totalExFalse;
    // Prepare the HTML content for the PDF
    const html = `
      <html>
        <head>
          <style>
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table, th, td { border: 1px solid black; }
            th, td { padding: 8px; text-align: left; }
            h2 { text-align: center; }
            .success { color: green; font-weight: bold; }
            .danger { color: red; font-weight: bold; }
            .total-row { font-weight: bold; text-align: right; background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Invoice Summarized Report</h1>
          <p>Report Date: ${date || month || "N/A"}</p>
         <p>Total Income (Ex True): <span class="success">${totalExTrue || 0}</span></p>
          <p>Total Expense (Ex False): <span class="danger">${totalExFalse || 0}</span></p>
          <p>Profit: ${profit >= 0
        ? `<span class="success">${profit}</span>`
        : `<span class="danger">(${Math.abs(profit)})</span>`}</p>
          <p>Total Invoices: ${invoices.length || 0}</p>
          
          <h2>Invoice Details:</h2>
          ${invoices
        .map((invoice) => `
              <h3>Invoice ID: ${invoice.id}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.details
        .map((detail) => `
                      <tr>
                        <td>${new Date(invoice.createdAt.day)
        .toISOString()
        .split("T")[0]}</td>
                        <td>${detail.description}</td>
                        <td>${detail.amount}</td>
                      </tr>
                    `)
        .join("")}
                    <tr class="total-row">
                    <td colspan="2">Total</td>
            ${invoice.ex
        ? `<td class="success" >${invoice.total}</td>`
        : `<td  class="danger">${invoice.total}</td>`}
                  </tr>
                </tbody>
              </table>
            `)
        .join("")}
        </body>
      </html>
    `;
    // Define PDF options
    const options = {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
    };
    // Define the PDF document
    const document = {
        html,
        data: {},
        type: "buffer", // Add any additional data if needed
    };
    const result = yield pdf_creator_node_1.default.create(document, options);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice_report.pdf");
    return result;
});
exports.pdf_summary = pdf_summary;
const showInvoiceDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.invoice.findUnique({
        where: {
            id,
        },
        include: {
            details: {
                select: {
                    description: true,
                    amount: true,
                    visitDetail: {
                        select: {
                            patient: {
                                select: {
                                    name: true,
                                },
                            },
                            schedule: {
                                select: {
                                    doctor: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                    service: {
                                        select: {
                                            title: true,
                                        },
                                    },
                                },
                            },
                            date: {
                                select: {
                                    day: true,
                                    fromTime: true,
                                    toTime: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
});
exports.showInvoiceDetails = showInvoiceDetails;
const listInvoiceDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.invoiceDetail.findMany({
        where: { invoiceId: id },
    });
});
exports.listInvoiceDetails = listInvoiceDetails;
const getInvoiceWithDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.invoice.findUnique({
        where: { id },
        include: {
            details: true,
        },
    });
});
exports.getInvoiceWithDetails = getInvoiceWithDetails;
const appendInvoiceDetail = (id, invoice, body) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceTotal = new library_1.Decimal((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0);
    const bodyAmount = new library_1.Decimal(body.amount || 0);
    const finalTotal = invoiceTotal.plus(bodyAmount);
    yield prismaClient_1.prisma.invoice.update({
        where: { id },
        data: { total: finalTotal },
    });
    yield prismaClient_1.prisma.invoiceDetail.create({
        data: Object.assign({ invoiceId: id }, body),
        include: {
            invoice: true,
        },
    });
});
exports.appendInvoiceDetail = appendInvoiceDetail;
const removeInvoiceDetail = (id, invoice, invoiceDetail) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceTotal = new library_1.Decimal((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0);
    const invoiceDetailAmount = new library_1.Decimal(invoiceDetail.amount || 0);
    const finalTotal = invoiceTotal.minus(invoiceDetailAmount);
    yield prismaClient_1.prisma.invoice.update({
        where: { id: invoiceDetail.invoiceId },
        data: { total: finalTotal },
    });
    yield prismaClient_1.prisma.invoiceDetail.delete({
        where: { id },
    });
});
exports.removeInvoiceDetail = removeInvoiceDetail;

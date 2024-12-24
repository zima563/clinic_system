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
exports.invoiceControllers = void 0;
const protectedRoute_1 = require("./../../middlewares/protectedRoute");
const client_1 = require("@prisma/client");
const pdf_creator_node_1 = __importDefault(require("pdf-creator-node"));
const routing_controllers_1 = require("routing-controllers");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const validation_1 = require("../../middlewares/validation");
const invoive_validation_1 = require("./invoive.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const library_1 = require("@prisma/client/runtime/library");
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const prisma = new client_1.PrismaClient();
let invoiceControllers = class invoiceControllers {
    createInvoice(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let invoice = yield prisma.invoice.create({
                data: {
                    total: body.amount,
                    ex: false,
                },
            });
            let invoiceDetails = yield prisma.invoiceDetail.create({
                data: Object.assign({ invoiceId: invoice.id }, body),
                include: {
                    invoice: true,
                },
            });
            return res
                .status(200)
                .json({ message: "invoice created successfully", invoiceDetails });
        });
    }
    listInvoice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiFeatures = new ApiFeatures_1.default(prisma.invoice, req.query);
            // Apply filtering, sorting, and pagination
            yield apiFeatures.filter().sort().paginateWithCount();
            const { result, pagination } = yield apiFeatures.exec("invoice");
            // Calculate the total sum of all `total` values for the filtered results
            const totalSum = yield prisma.invoice.aggregate({
                _sum: {
                    total: true,
                },
                where: apiFeatures.query.where, // Use the same filtering logic
            });
            return res.status(200).json({
                data: result,
                pagination,
                total: totalSum._sum.total || 0,
            });
        });
    }
    updateInvoiceDetail(id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoiceDetail = yield prisma.invoiceDetail.findUnique({
                where: { id },
            });
            if (!invoiceDetail) {
                throw new ApiError_1.default("invoiceDetail not found");
            }
            if (body.amount) {
                const invoice = yield prisma.invoice.findUnique({
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
                const finalTotal = invoiceTotal
                    .minus(invoiceDetailAmount)
                    .plus(bodyAmount);
                yield prisma.invoice.update({
                    where: { id: invoiceDetail.invoiceId },
                    data: { total: finalTotal },
                });
            }
            yield prisma.invoiceDetail.update({
                where: { id },
                data: body,
            });
            return res.json({ message: "invoiceDetail updated Successfully" });
        });
    }
    summarized_report(query, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { date, month } = query;
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
                prisma.invoice.aggregate({
                    _sum: { total: true },
                    where: {
                        ex: true,
                        createdAt: {
                            gte: startDate.toISOString(),
                            lt: endDate.toISOString(),
                        },
                    },
                }),
                prisma.invoice.aggregate({
                    _sum: { total: true },
                    where: {
                        ex: false,
                        createdAt: {
                            gte: startDate.toISOString(),
                            lt: endDate.toISOString(),
                        },
                    },
                }),
                prisma.invoice.findMany({
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
            return res.status(200).json({
                incomes: totalExTrue,
                expen: totalExFalse,
                invoiceCount: invoices.length,
                reportDate: date || month,
                profit,
                invoices,
            });
        });
    }
    downloadPdf(query, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { date, month } = query;
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
                prisma.invoice.aggregate({
                    _sum: { total: true },
                    where: {
                        ex: true,
                        createdAt: {
                            gte: startDate.toISOString(),
                            lt: endDate.toISOString(),
                        },
                    },
                }),
                prisma.invoice.aggregate({
                    _sum: { total: true },
                    where: {
                        ex: false,
                        createdAt: {
                            gte: startDate.toISOString(),
                            lt: endDate.toISOString(),
                        },
                    },
                }),
                prisma.invoice.findMany({
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
            try {
                // Create the PDF and stream it directly to the response
                const result = yield pdf_creator_node_1.default.create(document, options);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "attachment; filename=invoice_report.pdf");
                return res.end(result);
            }
            catch (error) {
                console.error("Error generating PDF:", error);
                res.status(500).send("Error generating PDF");
            }
        });
    }
    Show_Invoice_Details(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let Invoice = yield prisma.invoice.findUnique({
                where: {
                    id,
                },
                include: {
                    details: true,
                },
            });
            if (!Invoice) {
                throw new ApiError_1.default("invoice not found", 404);
            }
            return res.status(200).json(Invoice);
        });
    }
    List_Invoice_Details(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let Invoice = yield prisma.invoiceDetail.findMany({
                where: { invoiceId: id },
            });
            // Calculate the total amount using reduce
            const total = Invoice.reduce((acc, Invoice) => {
                return acc.plus(Invoice.amount);
            }, new library_1.Decimal(0));
            return res.status(200).json({
                Invoice,
                total,
            });
        });
    }
    Append_Invoice_Details(req, body, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoice = yield prisma.invoice.findUnique({
                where: { id },
                include: {
                    details: true,
                },
            });
            const invoiceTotal = new library_1.Decimal((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0);
            const bodyAmount = new library_1.Decimal(body.amount || 0);
            const finalTotal = invoiceTotal.plus(bodyAmount);
            yield prisma.invoice.update({
                where: { id },
                data: { total: finalTotal },
            });
            yield prisma.invoiceDetail.create({
                data: Object.assign({ invoiceId: id }, body),
                include: {
                    invoice: true,
                },
            });
            const invoiceAfter = yield prisma.invoice.findUnique({
                where: { id },
                include: {
                    details: true,
                },
            });
            return res
                .status(200)
                .json({ message: "invoice appended successfully", invoiceAfter });
        });
    }
    Remove_Invoice_Details(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let invoiceDetail = yield prisma.invoiceDetail.findUnique({
                where: {
                    id,
                },
            });
            if (!invoiceDetail) {
                throw new ApiError_1.default("invoice Details not found", 404);
            }
            let invoice = yield prisma.invoice.findUnique({
                where: { id: invoiceDetail.invoiceId },
            });
            const invoiceTotal = new library_1.Decimal((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0);
            const invoiceDetailAmount = new library_1.Decimal(invoiceDetail.amount || 0);
            const finalTotal = invoiceTotal.minus(invoiceDetailAmount);
            yield prisma.invoice.update({
                where: { id: invoiceDetail.invoiceId },
                data: { total: finalTotal },
            });
            yield prisma.invoiceDetail.delete({
                where: { id },
            });
            const invoiceAfter = yield prisma.invoice.findUnique({
                where: { id: invoiceDetail.invoiceId },
                include: {
                    details: true,
                },
            });
            return res
                .status(200)
                .json({ message: "invoice details removed successfully", invoiceAfter });
        });
    }
};
exports.invoiceControllers = invoiceControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("createInvoice"), (0, validation_1.createValidationMiddleware)(invoive_validation_1.addInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "createInvoice", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("listInvoice")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "listInvoice", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updateInvoiceDetail"), (0, validation_1.createValidationMiddleware)(invoive_validation_1.updateInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "updateInvoiceDetail", null);
__decorate([
    (0, routing_controllers_1.Get)("/summarized-report"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("summarized_report")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Req)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "summarized_report", null);
__decorate([
    (0, routing_controllers_1.Get)("/summarized-report/pdf"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("downloadPdf")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Req)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "downloadPdf", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("Show_Invoice_Details")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "Show_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Get)("/list/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("List_Invoice_Details")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "List_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Post)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("Append_Invoice_Details"), (0, validation_1.createValidationMiddleware)(invoive_validation_1.appendInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)("id")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "Append_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("Remove_Invoice_Details")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "Remove_Invoice_Details", null);
exports.invoiceControllers = invoiceControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/invoice")
], invoiceControllers);

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const invoive_validation_1 = require("./invoive.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const library_1 = require("@prisma/client/runtime/library");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const invoiceService = __importStar(require("./invoice.service"));
let invoiceControllers = class invoiceControllers {
    async createInvoice(req, body, res) {
        let invoice = await invoiceService.createInvoice(body.amount, req.user.id);
        let invoiceDetails = await invoiceService.createInvoiceDetails(invoice.id, body, req.user.id);
        return res
            .status(200)
            .json({ message: "invoice created successfully", invoiceDetails });
    }
    async listInvoice(req, res) {
        const data = await invoiceService.listInvoice(req.query);
        return res.status(200).json({
            data: data.result,
            pagination: data.pagination,
            total: data.totalSum._sum.total || 0,
        });
    }
    async updateInvoiceDetail(id, body, res) {
        const invoiceDetail = await invoiceService.getInvoiceDetails(id);
        if (!invoiceDetail) {
            throw new ApiError_1.default("invoiceDetail not found");
        }
        await invoiceService.updateInvoice(id, body, invoiceDetail);
        return res.json({ message: "invoiceDetail updated Successfully" });
    }
    async summarized_report(query, req, res) {
        const { date, month } = query;
        const data = await invoiceService.summeryInvoice(date, month);
        return res.status(200).json({
            incomes: data.totalExTrue,
            expen: data.totalExFalse,
            invoiceCount: data.invoices.length,
            reportDate: date || month,
            profit: data.profit,
            invoices: data.invoices,
        });
    }
    async downloadPdf(query, req, res) {
        const { date, month } = query;
        const result = await invoiceService.pdf_summary(date, month, res);
        return res.end(result);
    }
    async Show_Invoice_Details(req, id, res) {
        let Invoice = await invoiceService.showInvoiceDetails(id);
        if (!Invoice) {
            throw new ApiError_1.default("invoice not found", 404);
        }
        return res.status(200).json(Invoice);
    }
    async List_Invoice_Details(req, id, res) {
        let Invoice = await invoiceService.listInvoiceDetails(id);
        // Calculate the total amount using reduce
        const total = Invoice.reduce((acc, Invoice) => {
            return acc.plus(Invoice.amount);
        }, new library_1.Decimal(0));
        return res.status(200).json({
            Invoice,
            total,
        });
    }
    async Append_Invoice_Details(req, body, id, res) {
        const invoice = await invoiceService.getInvoiceWithDetails(id);
        await invoiceService.appendInvoiceDetail(id, invoice, body, req);
        const invoiceAfter = await invoiceService.getInvoiceWithDetails(id);
        return res
            .status(200)
            .json({ message: "invoice appended successfully", invoiceAfter });
    }
    async Remove_Invoice_Details(req, id, res) {
        let invoiceDetail = await invoiceService.getInvoiceDetails(id);
        if (!invoiceDetail) {
            throw new ApiError_1.default("invoice Details not found", 404);
        }
        let invoice = await invoiceService.getInvoiceWithDetails(invoiceDetail.invoiceId);
        await invoiceService.removeInvoiceDetail(id, invoice, invoiceDetail);
        const invoiceAfter = await invoiceService.getInvoiceWithDetails(invoiceDetail.invoiceId);
        return res
            .status(200)
            .json({ message: "invoice details removed successfully", invoiceAfter });
    }
    async DeleteInvoice(req, id, res) {
        let invoice = await invoiceService.getInvoiceById(id);
        if (!invoice)
            throw new ApiError_1.default("invoice not found", 404);
        await invoiceService.deleteInvoice(id);
        return res.status(200).json({
            message: "invoice deleted successfully",
        });
    }
};
exports.invoiceControllers = invoiceControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("createInvoice"), (0, validation_1.createValidationMiddleware)(invoive_validation_1.addInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "createInvoice", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("listInvoice")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "listInvoice", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateInvoiceDetail"), (0, validation_1.createValidationMiddleware)(invoive_validation_1.updateInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "updateInvoiceDetail", null);
__decorate([
    (0, routing_controllers_1.Get)("/summarized-report"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("summarized_report")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Req)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "summarized_report", null);
__decorate([
    (0, routing_controllers_1.Get)("/summarized-report/pdf"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("downloadPdf")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Req)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "downloadPdf", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("Show_Invoice_Details")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "Show_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Get)("/list/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("List_Invoice_Details")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "List_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Post)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("Append_Invoice_Details"), (0, validation_1.createValidationMiddleware)(invoive_validation_1.appendInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)("id")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "Append_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Delete)("/details/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("Remove_Invoice_Details")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "Remove_Invoice_Details", null);
__decorate([
    (0, routing_controllers_1.Delete)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("DeleteInvoice")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "DeleteInvoice", null);
exports.invoiceControllers = invoiceControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/invoice")
], invoiceControllers);
//# sourceMappingURL=invoice.controllers.js.map
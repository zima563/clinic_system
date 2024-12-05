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
const client_1 = require("@prisma/client");
const routing_controllers_1 = require("routing-controllers");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const validation_1 = require("../../middlewares/validation");
const invoive_validation_1 = require("./invoive.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
let invoiceControllers = class invoiceControllers {
    createInvoice(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let invoice = yield prisma.invoice.create({
                data: {
                    total: body.amount,
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
};
exports.invoiceControllers = invoiceControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(invoive_validation_1.addInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "createInvoice", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "listInvoice", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(invoive_validation_1.updateInvoiceDetailValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], invoiceControllers.prototype, "updateInvoiceDetail", null);
exports.invoiceControllers = invoiceControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/invoice")
], invoiceControllers);

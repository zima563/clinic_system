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
const prisma = new client_1.PrismaClient();
let invoiceControllers = class invoiceControllers {
    createInvoice(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.invoice.create({
                data: body,
            });
            return res.status(200).json({ message: "invoice created successfully" });
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
                success: true,
                data: result,
                pagination,
                total: totalSum._sum.total || 0,
            });
        });
    }
};
exports.invoiceControllers = invoiceControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
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
exports.invoiceControllers = invoiceControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/invoice")
], invoiceControllers);

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
exports.serviceController = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const services_validation_1 = require("./services.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const prisma = new client_1.PrismaClient();
let serviceController = class serviceController {
    addService(body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield prisma.service.findFirst({ where: { title: body.title } })) {
                throw new ApiError_1.default("service title already exists", 409);
            }
            let service = yield prisma.service.create({
                data: body
            });
            return res.status(200).json(service);
        });
    }
    allServices(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const baseFilter = {
                    isDeleted: false,
                };
                const apiFeatures = new ApiFeatures_1.default(prisma.service, query);
                yield apiFeatures
                    .filter(baseFilter)
                    .sort()
                    .limitedFields()
                    .search("service")
                    .paginateWithCount(yield prisma.user.count({ where: baseFilter }));
                const { result, pagination } = yield apiFeatures.exec("service");
                return res.status(200).json({
                    data: result,
                    pagination: pagination,
                });
            }
            catch (error) {
                console.error("Error fetching services:", error);
                if (!res.headersSent) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            }
        });
    }
    updateService(id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield prisma.service.findFirst({ where: { title: body.title } })) {
                throw new ApiError_1.default("service title already exists", 409);
            }
            let service = yield prisma.service.update({
                where: { id },
                data: body
            });
            return res.status(200).json(service);
        });
    }
};
exports.serviceController = serviceController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(services_validation_1.addServiceValidation)),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "addService", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "allServices", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)((0, validation_1.createValidationMiddleware)(services_validation_1.updateServiceValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "updateService", null);
exports.serviceController = serviceController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/services")
], serviceController);

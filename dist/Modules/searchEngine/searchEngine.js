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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchControllers = void 0;
const client_1 = require("@prisma/client");
const routing_controllers_1 = require("routing-controllers");
const prisma = new client_1.PrismaClient();
let searchControllers = class searchControllers {
    search(req, query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keyword } = query;
            const doctors = yield prisma.doctor.findMany({
                where: {
                    OR: [{ name: { contains: keyword } }, { phone: { contains: keyword } }],
                },
            });
            const patient = yield prisma.patient.findMany({
                where: {
                    OR: [{ name: { contains: keyword } }, { phone: { contains: keyword } }],
                },
            });
            const sevices = yield prisma.service.findMany({
                where: {
                    OR: [{ title: { contains: keyword } }, { desc: { contains: keyword } }],
                },
            });
            const specialty = yield prisma.specialty.findMany({
                where: {
                    OR: [{ title: { contains: keyword } }],
                },
            });
            return res.status(200).json({
                doctors,
                patient,
                sevices,
                specialty,
            });
        });
    }
};
exports.searchControllers = searchControllers;
__decorate([
    (0, routing_controllers_1.Get)("/"),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object, Object]),
    __metadata("design:returntype", Promise)
], searchControllers.prototype, "search", null);
exports.searchControllers = searchControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/search")
], searchControllers);

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.checkPatientMiddleware = void 0;
const routing_controllers_1 = require("routing-controllers");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const prisma = new client_1.PrismaClient();
let checkPatientMiddleware = class checkPatientMiddleware {
    use(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { patientId } = req.body;
                const patient = yield prisma.patient.findUnique({
                    where: { id: patientId },
                });
                if (!patient) {
                    throw new ApiError_1.default("patient not found with this patientId");
                }
                next();
            }
            catch (error) {
                return res.status(500).json({
                    status: "error",
                    message: "Internal Server Error",
                });
            }
        });
    }
};
exports.checkPatientMiddleware = checkPatientMiddleware;
exports.checkPatientMiddleware = checkPatientMiddleware = __decorate([
    (0, routing_controllers_1.Middleware)({ type: "before" }) // Runs before the controllers
], checkPatientMiddleware);

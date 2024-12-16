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
exports.ProtectRoutesMiddleware = void 0;
const client_1 = require("@prisma/client");
const routing_controllers_1 = require("routing-controllers");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
let ProtectRoutesMiddleware = class ProtectRoutesMiddleware {
    use(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                throw new ApiError_1.default("not token provider", 401);
            }
            const token = authorization.split(" ")[1];
            const jwtKey = process.env.JWT_KEY;
            if (!jwtKey) {
                throw new ApiError_1.default("JWT secret key is missing", 500);
            }
            let decoded;
            decoded = jsonwebtoken_1.default.verify(token, jwtKey);
            let user = yield prisma.user.findUnique({ where: { id: decoded.userId } });
            if (!user) {
                throw new ApiError_1.default("user not found", 404);
            }
            if (!user.isActive) {
                throw new ApiError_1.default("user not active", 403);
            }
            if (user.isDeleted) {
                throw new ApiError_1.default("user is deleted", 403);
            }
            req.user = user;
            next();
        });
    }
};
exports.ProtectRoutesMiddleware = ProtectRoutesMiddleware;
exports.ProtectRoutesMiddleware = ProtectRoutesMiddleware = __decorate([
    (0, routing_controllers_1.Middleware)({ type: "before" })
], ProtectRoutesMiddleware);

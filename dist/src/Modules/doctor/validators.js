"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhone = exports.validateSpecialty = exports.validateDoctor = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const validateDoctor = async (phone) => {
    if (phone) {
        if (await prismaClient_1.prisma.doctor.findFirst({ where: { phone } })) {
            throw new ApiError_1.default("doctor with this phone already exists");
        }
    }
};
exports.validateDoctor = validateDoctor;
const validateSpecialty = async (id) => {
    if (id) {
        if (!(await prismaClient_1.prisma.specialty.findUnique({
            where: { id: parseInt(id, 10) },
        }))) {
            throw new ApiError_1.default("specialtyId not found");
        }
    }
};
exports.validateSpecialty = validateSpecialty;
const validatePhone = async (phone, id) => {
    if (phone) {
        if (await prismaClient_1.prisma.doctor.findFirst({
            where: { phone, NOT: { id } },
        })) {
            throw new ApiError_1.default("doctor with this phone already exists");
        }
    }
};
exports.validatePhone = validatePhone;
//# sourceMappingURL=validators.js.map
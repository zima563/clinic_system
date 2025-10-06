"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientExist = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const patientExist = async (phone, id) => {
    if (phone) {
        let patient = await prismaClient_1.prisma.patient.findUnique({
            where: { phone, NOT: { id } },
        });
        if (patient) {
            throw new ApiError_1.default("patient's phone already exist");
        }
    }
};
exports.patientExist = patientExist;
//# sourceMappingURL=validators.js.map
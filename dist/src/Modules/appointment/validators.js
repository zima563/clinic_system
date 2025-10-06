"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAppoientment = exports.validateSchedule = exports.validatePatient = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const validatePatient = async (patientId) => {
    const patient = await prismaClient_1.prisma.patient.findUnique({
        where: { id: patientId },
    });
    if (!patient) {
        throw new ApiError_1.default("patient not found with this patientId");
    }
};
exports.validatePatient = validatePatient;
const validateSchedule = async (scheduleId) => {
    const schedule = await prismaClient_1.prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    if (!schedule) {
        throw new ApiError_1.default("schedule not found with this scheduleId");
    }
};
exports.validateSchedule = validateSchedule;
const validateAppoientment = async (id) => {
    if (!(await prismaClient_1.prisma.appointment.findUnique({ where: { id } }))) {
        throw new ApiError_1.default("appointment not found", 404);
    }
};
exports.validateAppoientment = validateAppoientment;
//# sourceMappingURL=validators.js.map
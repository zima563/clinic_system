"use strict";
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
exports.updateAppointment = exports.updateStatus = exports.showAppointmnetDetail = exports.getAppointments = exports.getAllAppoientmentPatient = exports.createAppointment = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const createAppointment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.appointment.create({ data });
});
exports.createAppointment = createAppointment;
const getAllAppoientmentPatient = (patientId) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.appointment.findMany({
        where: { patientId },
        select: {
            id: true,
            dateTime: true,
            status: true,
            schedule: {
                select: {
                    id: true,
                    service: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            patient: {
                select: {
                    id: true,
                    name: true,
                },
            },
            date: {
                select: {
                    id: true,
                    fromTime: true,
                    toTime: true,
                },
            },
        },
    });
});
exports.getAllAppoientmentPatient = getAllAppoientmentPatient;
const getAppointments = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.appointment, query);
    // Apply filtering, sorting, and pagination
    yield apiFeatures.filter().sort().paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("appointment");
    return { result, pagination };
});
exports.getAppointments = getAppointments;
const showAppointmnetDetail = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.appointment.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            dateTime: true,
            status: true,
            creator: {
                select: {
                    userName: true,
                },
            },
            schedule: {
                select: {
                    price: true,
                    service: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            date: {
                select: {
                    fromTime: true,
                    toTime: true,
                },
            },
            patient: {
                select: {
                    name: true,
                },
            },
        },
    });
});
exports.showAppointmnetDetail = showAppointmnetDetail;
const updateStatus = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.appointment.update({
        where: { id },
        data: {
            status: body.status,
        },
    });
});
exports.updateStatus = updateStatus;
const updateAppointment = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.appointment.update({
        where: { id },
        data: body,
    });
});
exports.updateAppointment = updateAppointment;

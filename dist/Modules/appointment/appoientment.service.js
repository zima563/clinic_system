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
const validators_1 = require("./validators");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const createAppointment = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validators_1.validatePatient)(data.patientId);
    yield (0, validators_1.validateSchedule)(data.scheduleId);
    const appointment = prismaClient_1.prisma.appointment.create({ data });
    return res.status(200).json(appointment);
});
exports.createAppointment = createAppointment;
const getAllAppoientmentPatient = (patientId, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!patientId)
        throw new ApiError_1.default("patientId must exist", 401);
    const appointments = yield prismaClient_1.prisma.appointment.findMany({
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
    return res.status(200).json({
        data: appointments,
        count: appointments.length,
    });
});
exports.getAllAppoientmentPatient = getAllAppoientmentPatient;
const getAppointments = (query, res) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.appointment, query);
    // Apply filtering, sorting, and pagination
    yield apiFeatures.filter().sort().paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("appointment");
    result.map((app) => {
        app.schedule.doctor.image =
            process.env.base_url + app.schedule.doctor.image;
    });
    return res.status(200).json({
        data: result,
        pagination,
        count: result.length,
    });
});
exports.getAppointments = getAppointments;
const showAppointmnetDetail = (id, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointment = yield prismaClient_1.prisma.appointment.findUnique({
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
    if (!appointment) {
        throw new ApiError_1.default("appointment not found", 404);
    }
    return res.status(200).json(appointment);
});
exports.showAppointmnetDetail = showAppointmnetDetail;
const updateStatus = (id, body, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validators_1.validateAppoientment)(id);
    yield prismaClient_1.prisma.appointment.update({
        where: { id },
        data: {
            status: body.status,
        },
    });
    return res
        .status(200)
        .json({ message: `appointment updated successfully to ${body.status}` });
});
exports.updateStatus = updateStatus;
const updateAppointment = (id, body, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validators_1.validatePatient)(body.patientId);
    yield (0, validators_1.validateSchedule)(body.scheduleId);
    yield (0, validators_1.validateAppoientment)(id);
    if (body.date) {
        body.date = new Date(body.date);
    }
    yield prismaClient_1.prisma.appointment.update({
        where: { id },
        data: body,
    });
    return res.status(200).json({ message: `appointment updated successfully` });
});
exports.updateAppointment = updateAppointment;

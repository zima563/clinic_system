"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointment = exports.updateStatus = exports.showAppointmnetDetail = exports.getAppointments = exports.getAllAppoientmentPatient = exports.createAppointment = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const validators_1 = require("./validators");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const createAppointment = async (data, res) => {
    await (0, validators_1.validatePatient)(data.patientId);
    await (0, validators_1.validateSchedule)(data.scheduleId);
    const appointment = prismaClient_1.prisma.appointment.create({ data });
    return res.status(200).json(appointment);
};
exports.createAppointment = createAppointment;
const getAllAppoientmentPatient = async (patientId, res) => {
    if (!patientId)
        throw new ApiError_1.default("patientId must exist", 401);
    const appointments = await prismaClient_1.prisma.appointment.findMany({
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
};
exports.getAllAppoientmentPatient = getAllAppoientmentPatient;
const getAppointments = async (query, res) => {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.appointment, query);
    // Apply filtering, sorting, and pagination
    await apiFeatures.filter().sort().paginateWithCount();
    const { result, pagination } = await apiFeatures.exec("appointment");
    result.map((app) => {
        app.schedule.doctor.image =
            process.env.base_url + app.schedule.doctor.image;
    });
    return res.status(200).json({
        data: result,
        pagination,
        count: result.length,
    });
};
exports.getAppointments = getAppointments;
const showAppointmnetDetail = async (id, res) => {
    const appointment = await prismaClient_1.prisma.appointment.findUnique({
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
};
exports.showAppointmnetDetail = showAppointmnetDetail;
const updateStatus = async (id, body, res) => {
    await (0, validators_1.validateAppoientment)(id);
    await prismaClient_1.prisma.appointment.update({
        where: { id },
        data: {
            status: body.status,
        },
    });
    return res
        .status(200)
        .json({ message: `appointment updated successfully to ${body.status}` });
};
exports.updateStatus = updateStatus;
const updateAppointment = async (id, body, res) => {
    await (0, validators_1.validatePatient)(body.patientId);
    await (0, validators_1.validateSchedule)(body.scheduleId);
    await (0, validators_1.validateAppoientment)(id);
    if (body.date) {
        body.date = new Date(body.date);
    }
    await prismaClient_1.prisma.appointment.update({
        where: { id },
        data: body,
    });
    return res.status(200).json({ message: `appointment updated successfully` });
};
exports.updateAppointment = updateAppointment;
//# sourceMappingURL=appoientment.service.js.map
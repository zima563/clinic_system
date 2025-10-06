"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateSchedule = exports.deleteDates = exports.showDetailsOfSchedule = exports.listOfDates = exports.listSchedules = exports.addSchedule = exports.findScheduleById = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const findScheduleById = async (id) => {
    return await prismaClient_1.prisma.schedule.findUnique({
        where: {
            id,
        },
    });
};
exports.findScheduleById = findScheduleById;
const addSchedule = async (res, createdBy, doctorId, servicesId, price, dates) => {
    const schedule = await prismaClient_1.prisma.schedule.create({
        data: {
            createdBy,
            doctorId,
            servicesId,
            price,
            dates: {
                create: dates.map((date) => ({
                    day: date.day,
                    fromTime: date.fromTime,
                    toTime: date.toTime,
                })),
            },
        },
    });
    return res.status(200).json(schedule);
};
exports.addSchedule = addSchedule;
const listSchedules = async (res, query) => {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.schedule, query);
    await apiFeatures.filter().limitedFields().sort().search("schedule");
    await apiFeatures.paginateWithCount();
    const { result, pagination } = await apiFeatures.exec("schedule");
    result.map((result) => {
        result.doctor.image = process.env.base_url + result.doctor.image;
    });
    return res.status(200).json({
        data: result,
        pagination: pagination,
        count: result.length,
    });
};
exports.listSchedules = listSchedules;
const listOfDates = async (res, id) => {
    const dates = await prismaClient_1.prisma.date.findMany({
        where: {
            scheduleId: id,
        },
    });
    return res.status(200).json(dates);
};
exports.listOfDates = listOfDates;
const showDetailsOfSchedule = async (res, id) => {
    const schedule = await prismaClient_1.prisma.schedule.findUnique({
        where: { id },
        select: {
            id: true,
            price: true,
            doctorId: false,
            servicesId: false,
            createdAt: true,
            updatedAt: true,
            dates: {
                select: {
                    id: true,
                    fromTime: true,
                    toTime: true,
                },
            },
            doctor: {
                select: {
                    id: true,
                    name: true,
                },
            },
            service: {
                select: {
                    id: true,
                    title: true,
                },
            },
            creator: {
                select: {
                    userName: true,
                },
            },
        },
    });
    if (!schedule) {
        throw new ApiError_1.default("schedule not found", 404);
    }
    return res.status(200).json(schedule);
};
exports.showDetailsOfSchedule = showDetailsOfSchedule;
const deleteDates = async (id) => {
    return await prismaClient_1.prisma.date.deleteMany({
        where: {
            scheduleId: id,
        },
    });
};
exports.deleteDates = deleteDates;
const updateSchedule = async (res, id, doctorId, servicesId, price, dates) => {
    const schedule = await (0, exports.findScheduleById)(id);
    if (dates) {
        await (0, exports.deleteDates)(id);
    }
    if (!schedule) {
        throw new ApiError_1.default("schedule not found", 404);
    }
    await prismaClient_1.prisma.schedule.update({
        where: {
            id,
        },
        data: {
            doctorId,
            servicesId,
            price,
            dates: {
                create: dates?.map((date) => ({
                    day: date.day,
                    fromTime: date.fromTime,
                    toTime: date.toTime,
                })),
            },
        },
    });
    let updatedSchedule = await (0, exports.findScheduleById)(id);
    // Return the updated schedules
    return res.status(200).json(updatedSchedule);
};
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (res, id) => {
    // Check if the schedule exists
    const schedule = await (0, exports.findScheduleById)(id);
    if (!schedule) {
        throw new ApiError_1.default("schedule not found", 404);
    }
    await (0, exports.deleteDates)(id);
    await prismaClient_1.prisma.schedule.delete({
        where: { id },
    });
    return res.status(200).json({ message: "Schedule deleted successfully" });
};
exports.deleteSchedule = deleteSchedule;
//# sourceMappingURL=schedule.service.js.map
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
exports.deleteSchedule = exports.updateSchedule = exports.deleteDates = exports.showDetailsOfSchedule = exports.listOfDates = exports.listSchedules = exports.addSchedule = exports.findScheduleById = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const findScheduleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.schedule.findUnique({
        where: {
            id,
        },
    });
});
exports.findScheduleById = findScheduleById;
const addSchedule = (res, createdBy, doctorId, servicesId, price, dates) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield prismaClient_1.prisma.schedule.create({
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
});
exports.addSchedule = addSchedule;
const listSchedules = (res, query) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.schedule, query);
    yield apiFeatures.filter().limitedFields().sort().search("schedule");
    yield apiFeatures.paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("schedule");
    result.map((result) => {
        result.doctor.image = process.env.base_url + result.doctor.image;
    });
    return res.status(200).json({
        data: result,
        pagination: pagination,
        count: result.length,
    });
});
exports.listSchedules = listSchedules;
const listOfDates = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    const dates = yield prismaClient_1.prisma.date.findMany({
        where: {
            scheduleId: id,
        },
    });
    return res.status(200).json(dates);
});
exports.listOfDates = listOfDates;
const showDetailsOfSchedule = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield prismaClient_1.prisma.schedule.findUnique({
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
});
exports.showDetailsOfSchedule = showDetailsOfSchedule;
const deleteDates = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.date.deleteMany({
        where: {
            scheduleId: id,
        },
    });
});
exports.deleteDates = deleteDates;
const updateSchedule = (res, id, doctorId, servicesId, price, dates) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield (0, exports.findScheduleById)(id);
    if (dates) {
        yield (0, exports.deleteDates)(id);
    }
    if (!schedule) {
        throw new ApiError_1.default("schedule not found", 404);
    }
    yield prismaClient_1.prisma.schedule.update({
        where: {
            id,
        },
        data: {
            doctorId,
            servicesId,
            price,
            dates: {
                create: dates === null || dates === void 0 ? void 0 : dates.map((date) => ({
                    day: date.day,
                    fromTime: date.fromTime,
                    toTime: date.toTime,
                })),
            },
        },
    });
    let updatedSchedule = yield (0, exports.findScheduleById)(id);
    // Return the updated schedules
    return res.status(200).json(updatedSchedule);
});
exports.updateSchedule = updateSchedule;
const deleteSchedule = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the schedule exists
    const schedule = yield (0, exports.findScheduleById)(id);
    if (!schedule) {
        throw new ApiError_1.default("schedule not found", 404);
    }
    yield (0, exports.deleteDates)(id);
    yield prismaClient_1.prisma.schedule.delete({
        where: { id },
    });
    return res.status(200).json({ message: "Schedule deleted successfully" });
});
exports.deleteSchedule = deleteSchedule;

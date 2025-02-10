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
exports.deletePatient = exports.getPatient = exports.listPatient = exports.updatePatient = exports.createPatient = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const createPatient = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.patient.create({
        data: body,
    });
});
exports.createPatient = createPatient;
const updatePatient = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    let patient = yield prismaClient_1.prisma.patient.findUnique({
        where: { id },
    });
    if (!patient) {
        throw new ApiError_1.default("patient not found", 404);
    }
    yield prismaClient_1.prisma.patient.update({
        where: { id },
        data: body,
    });
});
exports.updatePatient = updatePatient;
const listPatient = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        isDeleted: false,
    };
    // Initialize ApiFeatures with the Prisma model and the search query
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.patient, query);
    // Apply filters, sorting, field selection, search, and pagination
    yield apiFeatures.filter(baseFilter).sort().limitedFields().search("patient"); // Specify the model name, 'user' in this case
    yield apiFeatures.paginateWithCount();
    // Execute the query and get the result and pagination
    const { result, pagination } = yield apiFeatures.exec("patient");
    return {
        result,
        pagination,
    };
});
exports.listPatient = listPatient;
const getPatient = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.patient.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    userName: true,
                },
            },
        },
    });
});
exports.getPatient = getPatient;
const deletePatient = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.prisma.patient.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
});
exports.deletePatient = deletePatient;

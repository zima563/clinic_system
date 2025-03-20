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
const validators_1 = require("./validators");
const getPatientById = (id) => __awaiter(void 0, void 0, void 0, function* () {
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
const validatePatientFound = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield getPatientById(id);
    if (!patient) {
        throw new ApiError_1.default("patient not found", 404);
    }
    return patient;
});
const createPatient = (res, body) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validators_1.patientExist)(body.phone, 0);
    const birthdate = new Date(body.birthdate);
    body.birthdate = birthdate.toISOString();
    const patient = yield prismaClient_1.prisma.patient.create({
        data: body,
    });
    return res.status(200).json(patient);
});
exports.createPatient = createPatient;
const updatePatient = (res, id, body) => __awaiter(void 0, void 0, void 0, function* () {
    let patient = yield prismaClient_1.prisma.patient.findUnique({
        where: { id },
    });
    if (!patient) {
        throw new ApiError_1.default("patient not found", 404);
    }
    yield (0, validators_1.patientExist)(body.phone, id);
    if (body.birthdate) {
        const birthdate = new Date(body.birthdate);
        body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
    }
    yield prismaClient_1.prisma.patient.update({
        where: { id },
        data: body,
    });
    return res.status(200).json({ message: "patient updated successfully" });
});
exports.updatePatient = updatePatient;
const listPatient = (res, query) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res.status(200).json({
        data: result,
        pagination: pagination, // Use the pagination here
        count: result.length,
    });
});
exports.listPatient = listPatient;
const getPatient = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield validatePatientFound(id);
    return res.status(200).json(patient);
});
exports.getPatient = getPatient;
const deletePatient = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield validatePatientFound(id);
    yield prismaClient_1.prisma.patient.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
    return res.status(200).json({ message: "patient deleted successfully!" });
});
exports.deletePatient = deletePatient;

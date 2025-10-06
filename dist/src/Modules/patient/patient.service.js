"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatient = exports.getPatient = exports.listPatient = exports.updatePatient = exports.createPatient = void 0;
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const validators_1 = require("./validators");
const getPatientById = async (id) => {
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
};
const validatePatientFound = async (id) => {
    const patient = await getPatientById(id);
    if (!patient) {
        throw new ApiError_1.default("patient not found", 404);
    }
    return patient;
};
const createPatient = async (res, body) => {
    await (0, validators_1.patientExist)(body.phone, 0);
    const birthdate = new Date(body.birthdate);
    body.birthdate = birthdate.toISOString();
    const patient = await prismaClient_1.prisma.patient.create({
        data: body,
    });
    return res.status(200).json(patient);
};
exports.createPatient = createPatient;
const updatePatient = async (res, id, body) => {
    let patient = await prismaClient_1.prisma.patient.findUnique({
        where: { id },
    });
    if (!patient) {
        throw new ApiError_1.default("patient not found", 404);
    }
    await (0, validators_1.patientExist)(body.phone, id);
    if (body.birthdate) {
        const birthdate = new Date(body.birthdate);
        body.birthdate = birthdate.toISOString(); // Ensure it’s in ISO 8601 format
    }
    await prismaClient_1.prisma.patient.update({
        where: { id },
        data: body,
    });
    return res.status(200).json({ message: "patient updated successfully" });
};
exports.updatePatient = updatePatient;
const listPatient = async (res, query) => {
    const baseFilter = {
        isDeleted: false,
    };
    // Initialize ApiFeatures with the Prisma model and the search query
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.patient, query);
    // Apply filters, sorting, field selection, search, and pagination
    await apiFeatures.filter(baseFilter).sort().limitedFields().search("patient"); // Specify the model name, 'user' in this case
    await apiFeatures.paginateWithCount();
    // Execute the query and get the result and pagination
    const { result, pagination } = await apiFeatures.exec("patient");
    return res.status(200).json({
        data: result,
        pagination: pagination, // Use the pagination here
        count: result.length,
    });
};
exports.listPatient = listPatient;
const getPatient = async (res, id) => {
    const patient = await validatePatientFound(id);
    return res.status(200).json(patient);
};
exports.getPatient = getPatient;
const deletePatient = async (res, id) => {
    const patient = await validatePatientFound(id);
    await prismaClient_1.prisma.patient.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
    return res.status(200).json({ message: "patient deleted successfully!" });
};
exports.deletePatient = deletePatient;
//# sourceMappingURL=patient.service.js.map
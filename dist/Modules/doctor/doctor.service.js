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
exports.deactiveOrActive = exports.getDoctor = exports.getDoctors = exports.updateDoctor = exports.addDoctor = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const services_service_1 = require("../service/services.service");
const validators_1 = require("./validators");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const sharp_1 = __importDefault(require("sharp"));
const uploadDoctorFile = (req, doctor) => __awaiter(void 0, void 0, void 0, function* () {
    let fileName = doctor === null || doctor === void 0 ? void 0 : doctor.image;
    if (req.file) {
        const cleanedFilename = req.file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_.]/g, "");
        const newFilename = `img-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
        const imgPath = path_1.default.join("uploads", newFilename);
        // Resize and save the image
        yield (0, sharp_1.default)(req.file.buffer)
            .resize(100, 100)
            .png({ quality: 80 })
            .toFile(imgPath);
        // Delete old image if it exists
        if (doctor === null || doctor === void 0 ? void 0 : doctor.image) {
            const oldImagePath = path_1.default.join("uploads", doctor.image);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        fileName = newFilename;
    }
    return fileName;
});
const getDoctorById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.doctor.findUnique({
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
const addDoctor = (req, res, body) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, validators_1.validateDoctor)(body.phone);
    yield (0, validators_1.validateSpecialty)(body.specialtyId);
    body.specialtyId = parseInt(body.specialtyId, 10);
    body.image = yield (0, services_service_1.uploadFile)(req, res, "doctor");
    const doctor = yield prismaClient_1.prisma.doctor.create({
        data: Object.assign({}, body),
    });
    return res.status(200).json(doctor);
});
exports.addDoctor = addDoctor;
const updateDoctor = (id, req, res, body) => __awaiter(void 0, void 0, void 0, function* () {
    const doctor = yield getDoctorById(id);
    if (!doctor)
        throw new ApiError_1.default("doctor not found", 404);
    yield (0, validators_1.validatePhone)(body.phone, id);
    let fileName = yield uploadDoctorFile(req, doctor);
    body.specialtyId = parseInt(body.specialtyId, 8);
    const updatedDoctor = yield prismaClient_1.prisma.doctor.update({
        where: { id },
        data: Object.assign({ image: fileName }, body),
    });
    return res.status(200).json({
        message: "Doctor updated successfully",
        data: updatedDoctor,
    });
});
exports.updateDoctor = updateDoctor;
const getDoctors = (res, query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseFilter = {
        isDeleted: false,
    };
    // Initialize ApiFeatures with the Prisma model and the search query
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.doctor, query);
    // Apply filters, sorting, field selection, search, and pagination
    yield apiFeatures.filter(baseFilter).sort().limitedFields().search("doctor"); // Specify the model name, 'user' in this case
    yield apiFeatures.paginateWithCount();
    // Execute the query and get the result and pagination
    const { result, pagination } = yield apiFeatures.exec("doctor");
    result.map((doc) => {
        doc.image = process.env.base_url + doc.image;
    });
    return res.status(200).json({
        data: result,
        pagination: pagination, // Use the pagination here
        count: result.length,
    });
});
exports.getDoctors = getDoctors;
const getDoctor = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    const doctor = yield getDoctorById(id);
    if (!doctor) {
        throw new ApiError_1.default("doctor not found", 404);
    }
    doctor.image = process.env.base_url + doctor.image;
    return res.status(200).json(doctor);
});
exports.getDoctor = getDoctor;
const deactiveOrActive = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    const doctor = yield getDoctorById(id);
    if (!doctor) {
        throw new ApiError_1.default("doctor not found", 404);
    }
    yield prismaClient_1.prisma.doctor.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
    const updatedDoctor = yield getDoctorById(id);
    return res
        .status(200)
        .json({ message: "doctor deactiveded successfully", updatedDoctor });
});
exports.deactiveOrActive = deactiveOrActive;

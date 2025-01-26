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
exports.deleteSpecialty = exports.getListSpecial = exports.updateSpecialty = exports.uploadFileForSpecialtyUpdate = exports.findSpecialtyById = exports.checkSpecialtyExist = exports.createSpecialty = exports.uploadFileForSpecialty = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const uploadFileForSpecialty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ error: "Icon file is required." });
    }
    // Clean up the file name to prevent issues with special characters
    const cleanedFilename = req.file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.]/g, "");
    // Generate a unique filename
    const iconFilename = `icon-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
    const iconPath = path_1.default.join("uploads", iconFilename);
    // Resize and save the icon using sharp
    (0, sharp_1.default)(req.file.buffer).resize(160, 160).png({ quality: 80 }).toFile(iconPath);
    return iconFilename;
});
exports.uploadFileForSpecialty = uploadFileForSpecialty;
const createSpecialty = (icon, body, createdBy) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.specialty.create({
        data: {
            title: body.title,
            icon: icon !== null && icon !== void 0 ? icon : "",
            createdBy,
        },
    });
});
exports.createSpecialty = createSpecialty;
const checkSpecialtyExist = (body) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield prismaClient_1.prisma.specialty.findUnique({ where: { title: body.title } })) {
        throw new ApiError_1.default("specialty title already exist", 409);
    }
});
exports.checkSpecialtyExist = checkSpecialtyExist;
const findSpecialtyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.specialty.findUnique({ where: { id } });
});
exports.findSpecialtyById = findSpecialtyById;
const uploadFileForSpecialtyUpdate = (req, specialty) => __awaiter(void 0, void 0, void 0, function* () {
    let fileName = specialty.icon;
    // Process image if provided
    if (req.file) {
        const cleanedFilename = req.file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_.]/g, "");
        const newFilename = `img-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
        const imgPath = path_1.default.join("uploads", newFilename);
        // Resize and save the image
        yield (0, sharp_1.default)(req.file.buffer)
            .resize(160, 160)
            .png({ quality: 80 })
            .toFile(imgPath);
        // Delete old image if it exists
        if (specialty.icon) {
            const oldImagePath = path_1.default.join("uploads", specialty.icon);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        fileName = newFilename;
    }
    return fileName;
});
exports.uploadFileForSpecialtyUpdate = uploadFileForSpecialtyUpdate;
const updateSpecialty = (id, fileName, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.specialty.update({
        where: { id },
        data: Object.assign({ icon: fileName !== null && fileName !== void 0 ? fileName : "" }, body),
    });
});
exports.updateSpecialty = updateSpecialty;
const getListSpecial = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.specialty, query);
    yield apiFeatures.filter().sort().limitedFields().search("specialty");
    // Get the count of documents and apply pagination
    yield apiFeatures.paginateWithCount();
    // Execute the query and get the results along with pagination info
    const { result, pagination } = yield apiFeatures.exec("specialty");
    result.map((doc) => {
        doc.icon = process.env.base_url + doc.icon;
    });
    return {
        result,
        pagination,
    };
});
exports.getListSpecial = getListSpecial;
const deleteSpecialty = (id, specialty) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.prisma.doctor.deleteMany({ where: { specialtyId: id } });
    if (specialty.icon) {
        const oldImagePath = path_1.default.join("uploads", specialty.icon);
        if (fs_1.default.existsSync(oldImagePath)) {
            fs_1.default.unlinkSync(oldImagePath);
        }
    }
    yield prismaClient_1.prisma.specialty.delete({
        where: { id },
    });
});
exports.deleteSpecialty = deleteSpecialty;

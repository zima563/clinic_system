"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpecialty = exports.getListSpecial = exports.updateSpecialty = exports.uploadFileForSpecialtyUpdate = exports.getSpecialty = exports.findSpecialtyById = exports.checkSpecialtyExist = exports.createSpecialty = exports.uploadFileForSpecialty = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const prismaClient_1 = require("../../prismaClient");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const uploadFileForSpecialty = async (req, res) => {
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
};
exports.uploadFileForSpecialty = uploadFileForSpecialty;
const createSpecialty = async (req, res, body, createdBy) => {
    await (0, exports.checkSpecialtyExist)(body);
    let iconFilename = await (0, exports.uploadFileForSpecialty)(req, res);
    let specialty = await prismaClient_1.prisma.specialty.create({
        data: {
            title: body.title,
            icon: iconFilename ?? "",
            createdBy,
        },
    });
    return res.status(200).json(specialty);
};
exports.createSpecialty = createSpecialty;
const checkSpecialtyExist = async (body) => {
    if (await prismaClient_1.prisma.specialty.findUnique({ where: { title: body.title } })) {
        throw new ApiError_1.default("specialty title already exist", 409);
    }
};
exports.checkSpecialtyExist = checkSpecialtyExist;
const findSpecialtyById = async (id) => {
    return await prismaClient_1.prisma.specialty.findUnique({
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
exports.findSpecialtyById = findSpecialtyById;
const getSpecialty = async (res, id) => {
    let specialty = await (0, exports.findSpecialtyById)(id);
    if (!specialty) {
        throw new ApiError_1.default("specialty not found");
    }
    specialty.icon = process.env.base_url + specialty.icon;
    return res.status(200).json(specialty);
};
exports.getSpecialty = getSpecialty;
const uploadFileForSpecialtyUpdate = async (req, specialty) => {
    let fileName = specialty.icon;
    // Process image if provided
    if (req.file) {
        const cleanedFilename = req.file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_.]/g, "");
        const newFilename = `img-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
        const imgPath = path_1.default.join("uploads", newFilename);
        // Resize and save the image
        await (0, sharp_1.default)(req.file.buffer)
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
};
exports.uploadFileForSpecialtyUpdate = uploadFileForSpecialtyUpdate;
const updateSpecialty = async (req, res, id, body) => {
    let specialty = await (0, exports.findSpecialtyById)(id);
    if (!specialty) {
        throw new ApiError_1.default("specialty not found", 404);
    }
    await (0, exports.checkSpecialtyExist)(body);
    let fileName = await (0, exports.uploadFileForSpecialtyUpdate)(req, specialty);
    await prismaClient_1.prisma.specialty.update({
        where: { id },
        data: {
            icon: fileName ?? "",
            ...body,
        },
    });
    return res.status(200).json({ message: "specialty updated successfully" });
};
exports.updateSpecialty = updateSpecialty;
const getListSpecial = async (res, query) => {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.specialty, query);
    await apiFeatures.filter().sort().limitedFields().search("specialty");
    // Get the count of documents and apply pagination
    await apiFeatures.paginateWithCount();
    // Execute the query and get the results along with pagination info
    const { result, pagination } = await apiFeatures.exec("specialty");
    result.map((doc) => {
        doc.icon = process.env.base_url + doc.icon;
    });
    return res.status(200).json({
        data: result,
        pagination: pagination,
        count: result.length,
    });
};
exports.getListSpecial = getListSpecial;
const deleteSpecialty = async (res, id) => {
    let specialty = await (0, exports.findSpecialtyById)(id);
    if (!specialty) {
        throw new ApiError_1.default("specialty not found");
    }
    await prismaClient_1.prisma.doctor.deleteMany({ where: { specialtyId: id } });
    if (specialty.icon) {
        const oldImagePath = path_1.default.join("uploads", specialty.icon);
        if (fs_1.default.existsSync(oldImagePath)) {
            fs_1.default.unlinkSync(oldImagePath);
        }
    }
    await prismaClient_1.prisma.specialty.delete({
        where: { id },
    });
    return res.status(200).json({ message: "specialty deleted succesfully" });
};
exports.deleteSpecialty = deleteSpecialty;
//# sourceMappingURL=specialist.service.js.map
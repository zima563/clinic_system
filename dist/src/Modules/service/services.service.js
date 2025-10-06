"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactiveService = exports.updateService = exports.uploadFileForUpdate = exports.CheckTitleExist = exports.getService = exports.getServiceById = exports.listServices = exports.createService = exports.uploadFile = exports.validateService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const validateService = async (id) => {
    let service = await (0, exports.getServiceById)(id);
    if (!service) {
        throw new ApiError_1.default("service not found", 404);
    }
    return service;
};
exports.validateService = validateService;
const uploadFile = async (req, res, modelName) => {
    if (!req.file && modelName === "doctor") {
        return "avatar.png";
    }
    if (!req.file && modelName === "service") {
        return "avatar.png";
    }
    const cleanedFilename = req.file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.]/g, "");
    // Generate a unique filename
    const iconFilename = `icon-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
    const iconPath = path_1.default.join("uploads", iconFilename);
    // Resize and save the icon using sharp
    await (0, sharp_1.default)(req.file.buffer)
        .resize({ width: 100, height: 100, fit: "cover" })
        .png({ quality: 70, compressionLevel: 9 })
        .toFile(iconPath);
    return iconFilename;
};
exports.uploadFile = uploadFile;
const createService = async (req, res, body) => {
    if (await prismaClient_1.prisma.service.findFirst({ where: { title: body.title } })) {
        throw new ApiError_1.default("service title already exists", 409);
    }
    body.icon = (await (0, exports.uploadFile)(req, res, "service")) ?? "";
    const service = await prismaClient_1.prisma.service.create({
        data: {
            title: body.title,
            desc: body.desc,
            img: body.icon,
            createdBy: body.createdBy,
        },
    });
    return res.status(200).json(service);
};
exports.createService = createService;
const listServices = async (res, query) => {
    const baseFilter = {
        isDeleted: false,
    };
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.service, query);
    await apiFeatures.filter(baseFilter).sort().limitedFields().search("service");
    await apiFeatures.paginateWithCount();
    const { result, pagination } = await apiFeatures.exec("service");
    result.map((doc) => {
        doc.img = process.env.base_url + doc.img;
    });
    return res.status(200).json({
        data: result,
        pagination: pagination,
    });
};
exports.listServices = listServices;
const getServiceById = async (id) => {
    return await prismaClient_1.prisma.service.findUnique({
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
exports.getServiceById = getServiceById;
const getService = async (res, id) => {
    let service = await (0, exports.getServiceById)(id);
    if (!service) {
        throw new ApiError_1.default("service not found", 404);
    }
    service.img = process.env.base_url + service.img;
    return res.status(200).json(service);
};
exports.getService = getService;
const CheckTitleExist = async (id, title) => {
    if (await prismaClient_1.prisma.service.findFirst({
        where: { title, NOT: { id } },
    })) {
        throw new ApiError_1.default("service title already exists", 409);
    }
};
exports.CheckTitleExist = CheckTitleExist;
const uploadFileForUpdate = async (req, service) => {
    let fileName;
    if (req.file) {
        const cleanedFilename = req.file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_.]/g, "");
        const newFilename = `img-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
        const imgPath = path_1.default.join("uploads", newFilename);
        // Resize and save the image
        await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 100, height: 100, fit: "cover" })
            .png({ quality: 70, compressionLevel: 9 })
            .toFile(imgPath);
        // Delete old image if it exists
        if (service?.img) {
            const oldImagePath = path_1.default.join("uploads", service?.img);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        fileName = newFilename;
    }
    return fileName;
};
exports.uploadFileForUpdate = uploadFileForUpdate;
const updateService = async (req, res, id, body) => {
    let service = await (0, exports.validateService)(id);
    await (0, exports.CheckTitleExist)(id, body.title);
    let fileName = await (0, exports.uploadFileForUpdate)(req, service);
    await prismaClient_1.prisma.service.update({
        where: { id },
        data: {
            title: body.title || service?.title,
            desc: body.desc || service?.desc,
            img: fileName || service?.img,
        },
    });
    return res.status(200).json({ message: "service updated successfully" });
};
exports.updateService = updateService;
const deactiveService = async (res, id) => {
    let service = await (0, exports.validateService)(id);
    if (service.status) {
        await prismaClient_1.prisma.service.update({
            where: { id },
            data: { status: false },
        });
    }
    else {
        await prismaClient_1.prisma.service.update({
            where: { id },
            data: { status: true },
        });
    }
    let updatedService = await (0, exports.getServiceById)(id);
    return res.status(200).json(updatedService);
};
exports.deactiveService = deactiveService;
//# sourceMappingURL=services.service.js.map
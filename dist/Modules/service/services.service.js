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
exports.deactiveService = exports.updateService = exports.uploadFileForUpdate = exports.CheckTitleExist = exports.getServiceById = exports.listServices = exports.createService = exports.uploadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ error: "image file is required." });
    }
    const cleanedFilename = req.file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.]/g, "");
    // Generate a unique filename
    const iconFilename = `icon-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
    const iconPath = path_1.default.join("uploads", iconFilename);
    // Resize and save the icon using sharp
    yield (0, sharp_1.default)(req.file.buffer)
        .resize({ width: 100, height: 100, fit: "cover" })
        .png({ quality: 70, compressionLevel: 9 })
        .toFile(iconPath);
    return iconPath;
});
exports.uploadFile = uploadFile;
const createService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(body);
    return yield prismaClient_1.prisma.service.create({
        data: {
            title: body.title,
            desc: body.desc,
            img: body.icon,
            createdBy: body.createdBy,
        },
    });
});
exports.createService = createService;
const listServices = (baseFilter, query) => __awaiter(void 0, void 0, void 0, function* () {
    const apiFeatures = new ApiFeatures_1.default(prismaClient_1.prisma.service, query);
    yield apiFeatures.filter(baseFilter).sort().limitedFields().search("service");
    yield apiFeatures.paginateWithCount();
    const { result, pagination } = yield apiFeatures.exec("service");
    result.map((doc) => {
        doc.img = process.env.base_url + doc.img;
    });
    return {
        result,
        pagination,
    };
});
exports.listServices = listServices;
const getServiceById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.prisma.service.findUnique({ where: { id } });
});
exports.getServiceById = getServiceById;
const CheckTitleExist = (id, title) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield prismaClient_1.prisma.service.findFirst({
        where: { title, NOT: { id } },
    })) {
        throw new ApiError_1.default("service title already exists", 409);
    }
});
exports.CheckTitleExist = CheckTitleExist;
const uploadFileForUpdate = (req, service) => __awaiter(void 0, void 0, void 0, function* () {
    let fileName;
    if (req.file) {
        const cleanedFilename = req.file.originalname
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_.]/g, "");
        const newFilename = `img-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
        const imgPath = path_1.default.join("uploads", newFilename);
        // Resize and save the image
        yield (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 100, height: 100, fit: "cover" })
            .png({ quality: 70, compressionLevel: 9 })
            .toFile(imgPath);
        // Delete old image if it exists
        if (service === null || service === void 0 ? void 0 : service.img) {
            const oldImagePath = path_1.default.join("uploads", service === null || service === void 0 ? void 0 : service.img);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        fileName = newFilename;
    }
    return fileName;
});
exports.uploadFileForUpdate = uploadFileForUpdate;
const updateService = (id, body, service, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    prismaClient_1.prisma.service.update({
        where: { id },
        data: {
            title: body.title || (service === null || service === void 0 ? void 0 : service.title),
            desc: body.desc || (service === null || service === void 0 ? void 0 : service.desc),
            img: fileName || (service === null || service === void 0 ? void 0 : service.img),
        },
    });
});
exports.updateService = updateService;
const deactiveService = (id, service) => __awaiter(void 0, void 0, void 0, function* () {
    if (service.status) {
        yield prismaClient_1.prisma.service.update({
            where: { id },
            data: { status: false },
        });
    }
    else {
        yield prismaClient_1.prisma.service.update({
            where: { id },
            data: { status: true },
        });
    }
});
exports.deactiveService = deactiveService;

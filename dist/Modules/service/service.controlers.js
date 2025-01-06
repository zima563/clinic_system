"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.serviceController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const protectedRoute_1 = require("./../../middlewares/protectedRoute");
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const services_validation_1 = require("./services.validation");
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const roleOrPermission_1 = require("../../middlewares/roleOrPermission");
const uploadFile_1 = __importDefault(require("../../middlewares/uploadFile"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
let serviceController = class serviceController {
    addService(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                return res.status(400).json({ error: "image file is required." });
            }
            if (yield prisma.service.findFirst({ where: { title: body.title } })) {
                throw new ApiError_1.default("service title already exists", 409);
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
            body.icon = iconFilename !== null && iconFilename !== void 0 ? iconFilename : "";
            let service = yield prisma.service.create({
                data: {
                    title: body.title,
                    desc: body.desc,
                    img: body.icon,
                },
            });
            return res.status(200).json(service);
        });
    }
    allServices(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const baseFilter = {
                    isDeleted: false,
                };
                const apiFeatures = new ApiFeatures_1.default(prisma.service, query);
                yield apiFeatures
                    .filter(baseFilter)
                    .sort()
                    .limitedFields()
                    .search("service");
                yield apiFeatures.paginateWithCount();
                const { result, pagination } = yield apiFeatures.exec("service");
                result.map((doc) => {
                    doc.img = process.env.base_url + doc.img;
                });
                return res.status(200).json({
                    data: result,
                    pagination: pagination,
                });
            }
            catch (error) {
                console.error("Error fetching services:", error);
                if (!res.headersSent) {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            }
        });
    }
    updateService(req, id, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield prisma.service.findUnique({ where: { id } });
            if (yield prisma.service.findFirst({
                where: { title: body.title, NOT: { id } },
            })) {
                throw new ApiError_1.default("service title already exists", 409);
            }
            let fileName;
            // Process image if provided
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
            yield prisma.service.update({
                where: { id },
                data: {
                    title: body.title || (service === null || service === void 0 ? void 0 : service.title),
                    desc: body.desc || (service === null || service === void 0 ? void 0 : service.desc),
                    img: fileName || (service === null || service === void 0 ? void 0 : service.img),
                },
            });
            return res.status(200).json({ message: "service updated successfully" });
        });
    }
    getService(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield prisma.service.findUnique({
                where: { id },
            });
            if (!service) {
                throw new ApiError_1.default("service not found", 404);
            }
            service.img = process.env.base_url + service.img;
            return res.status(200).json(service);
        });
    }
    deactiveService(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let service = yield prisma.service.findUnique({
                where: { id },
            });
            if (!service) {
                throw new ApiError_1.default("service not found", 404);
            }
            if (service.status) {
                yield prisma.service.update({
                    where: { id },
                    data: { status: false },
                });
            }
            else {
                yield prisma.service.update({
                    where: { id },
                    data: { status: true },
                });
            }
            let updatedService = yield prisma.service.findUnique({
                where: { id },
            });
            return res.status(200).json(updatedService);
        });
    }
};
exports.serviceController = serviceController;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("addService"), (0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(services_validation_1.addServiceValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "addService", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("allServices")),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "allServices", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("updateService"), (0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(services_validation_1.updateServiceValidation)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "updateService", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("getService"), (0, validation_1.createValidationMiddleware)(services_validation_1.updateServiceValidation)),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "getService", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(protectedRoute_1.ProtectRoutesMiddleware, (0, roleOrPermission_1.roleOrPermissionMiddleware)("deactiveService")),
    __param(0, (0, routing_controllers_1.Param)("id")),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], serviceController.prototype, "deactiveService", null);
exports.serviceController = serviceController = __decorate([
    (0, routing_controllers_1.JsonController)("/api/services")
], serviceController);

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
exports.specialtyControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const uploadFile_1 = require("../../middlewares/uploadFile"); // Correct import
const validation_1 = require("../../middlewares/validation"); // Correct import
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const specialist_validation_1 = require("./specialist.validation");
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const prisma = new client_1.PrismaClient();
let specialtyControllers = class specialtyControllers {
    createSpecialty(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                return res.status(400).json({ error: "Icon file is required." });
            }
            if (yield prisma.specialty.findUnique({ where: { title: body.title } })) {
                throw new ApiError_1.default("specialty title already exist", 409);
            }
            // Clean up the file name to prevent issues with special characters
            const cleanedFilename = req.file.originalname
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9_.]/g, "");
            // Generate a unique filename
            const iconFilename = `icon-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
            const iconPath = path_1.default.join("uploads", iconFilename);
            // Resize and save the icon using sharp
            yield (0, sharp_1.default)(req.file.buffer)
                .resize(100, 100)
                .png({ quality: 80 })
                .toFile(iconPath);
            // Save the specialty to the database
            const specialty = yield prisma.specialty.create({
                data: {
                    title: body.title,
                    icon: iconFilename !== null && iconFilename !== void 0 ? iconFilename : "",
                },
            });
            return res.status(200).json(specialty);
        });
    }
    updateSpecialty(req, body, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield prisma.specialty.findUnique({ where: { id } }))) {
                throw new ApiError_1.default("specialty not found", 404);
            }
            if (yield prisma.specialty.findUnique({ where: { title: body === null || body === void 0 ? void 0 : body.title } })) {
                throw new ApiError_1.default("specialty title already exist", 409);
            }
            yield prisma.specialty.update({
                where: { id },
                data: body,
            });
            return res.status(200).json({ message: "specialty updated successfully" });
        });
    }
    allSpecialtys(query, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiFeatures = new ApiFeatures_1.default(prisma.specialty, query);
            yield apiFeatures.filter().sort().limitedFields().search("specialty");
            // Get the count of documents and apply pagination
            yield apiFeatures.paginateWithCount();
            // Execute the query and get the results along with pagination info
            const { result, pagination } = yield apiFeatures.exec("specialty");
            return res.status(200).json({
                data: result,
                pagination: pagination,
                count: result.length,
            });
        });
    }
};
exports.specialtyControllers = specialtyControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(uploadFile_1.uploadSingleFile, (0, validation_1.createValidationMiddleware)(specialist_validation_1.specialtySchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "createSpecialty", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(uploadFile_1.uploadSingleFile, (0, validation_1.createValidationMiddleware)(specialist_validation_1.updateSpecialtySchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)("id")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "updateSpecialty", null);
__decorate([
    (0, routing_controllers_1.Get)("/all"),
    __param(0, (0, routing_controllers_1.QueryParams)()),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], specialtyControllers.prototype, "allSpecialtys", null);
exports.specialtyControllers = specialtyControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/specialist")
], specialtyControllers);

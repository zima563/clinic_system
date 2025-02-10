"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.doctorControllers = void 0;
const fs_1 = __importDefault(require("fs"));
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const doctor_validation_1 = require("./doctor.validation");
const uploadFile_1 = __importDefault(require("../../middlewares/uploadFile"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const secureRoutesMiddleware_1 = require("../../middlewares/secureRoutesMiddleware");
const validators_1 = require("./validators");
const doctorServices = __importStar(require("./doctor.service"));
const services_service_1 = require("../service/services.service");
const minioClient = new client_s3_1.S3Client({
    region: "us-east-1",
    endpoint: "http://127.0.0.1:9000",
    credentials: {
        accessKeyId: "admin",
        secretAccessKey: "admin123",
    },
});
let doctorControllers = class doctorControllers {
    addDoctor(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield (0, validators_1.validateDoctor)(body.phone);
            yield (0, validators_1.validateSpecialty)(body.specialtyId);
            body.specialtyId = parseInt(body.specialtyId, 10);
            body.image = yield (0, services_service_1.uploadFile)(req, res, "doctor");
            const doctor = yield doctorServices.addDoctor(Object.assign(Object.assign({}, body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
            return res.status(200).json(doctor);
        });
    }
    updateDoctor(req, body, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield doctorServices.getDoctor(id);
            // Check if the doctor exists
            yield (0, validators_1.validateDoctorById)(id);
            yield (0, validators_1.validatePhone)(body.phone, id);
            // Initialize fileName to preserve existing image if no new image is uploaded
            let fileName = doctor === null || doctor === void 0 ? void 0 : doctor.image;
            // Process image if provided
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
            // Update the doctor record
            const updatedDoctor = yield doctorServices.updateDoctor(id, fileName, body);
            // Return success response
            return res.status(200).json({
                message: "Doctor updated successfully",
                data: updatedDoctor,
            });
        });
    }
    listDoctors(req, query, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctors = yield doctorServices.getDoctors(query);
            // Return the result along with pagination information
            return res.status(200).json({
                data: doctors.result,
                pagination: doctors.pagination, // Use the pagination here
                count: doctors.result.length,
            });
        });
    }
    showDoctorDetails(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let doctor = yield doctorServices.getDoctor(id);
            if (!doctor) {
                throw new ApiError_1.default("doctor not found", 404);
            }
            doctor.image = process.env.base_url + doctor.image;
            return res.status(200).json(doctor);
        });
    }
    DeactiveDoctor(req, id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let doctor = yield doctorServices.getDoctor(id);
            if (!doctor)
                throw new ApiError_1.default("doctor not found", 404);
            yield doctorServices.deactiveOrActive(id);
            let updatedDoctor = yield doctorServices.getDoctor(id);
            return res
                .status(200)
                .json({ message: "doctor deactiveded successfully", updatedDoctor });
        });
    }
};
exports.doctorControllers = doctorControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("addDoctor"), (0, uploadFile_1.default)("image"), (0, validation_1.createValidationMiddleware)(doctor_validation_1.addDoctorValidationSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], doctorControllers.prototype, "addDoctor", null);
__decorate([
    (0, routing_controllers_1.Put)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("updateDoctor"), (0, uploadFile_1.default)("icon"), // Ensure this middleware works as expected
    (0, validation_1.createValidationMiddleware)(doctor_validation_1.UpdateDoctorValidationSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)("id")),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], doctorControllers.prototype, "updateDoctor", null);
__decorate([
    (0, routing_controllers_1.Get)("/"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("listDoctors")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.QueryParams)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], doctorControllers.prototype, "listDoctors", null);
__decorate([
    (0, routing_controllers_1.Get)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("showDoctorDetails")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], doctorControllers.prototype, "showDoctorDetails", null);
__decorate([
    (0, routing_controllers_1.Patch)("/:id"),
    (0, routing_controllers_1.UseBefore)(...(0, secureRoutesMiddleware_1.secureRouteWithPermissions)("DeactiveDoctor")),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Param)("id")),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], doctorControllers.prototype, "DeactiveDoctor", null);
exports.doctorControllers = doctorControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/doctors")
], doctorControllers);

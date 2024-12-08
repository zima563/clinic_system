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
exports.doctorControllers = void 0;
const routing_controllers_1 = require("routing-controllers");
const validation_1 = require("../../middlewares/validation");
const doctor_validation_1 = require("./doctor.validation");
const uploadFile_1 = __importDefault(require("../../middlewares/uploadFile"));
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
let doctorControllers = class doctorControllers {
    addDoctor(req, body, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                return res.status(400).json({ error: "image file is required." });
            }
            body.specialtyId = parseInt(body.specialtyId, 10);
            const cleanedFilename = req.file.originalname
                .replace(/\s+/g, "_")
                .replace(/[^a-zA-Z0-9_.]/g, "");
            const Filename = `img-${(0, uuid_1.v4)()}-${encodeURIComponent(cleanedFilename)}`;
            const imgPath = path_1.default.join("uploads", Filename);
            yield (0, sharp_1.default)(req.file.buffer)
                .resize(100, 100)
                .png({ quality: 80 })
                .toFile(imgPath);
            const doctor = yield prisma.doctor.create({
                data: Object.assign({ image: Filename !== null && Filename !== void 0 ? Filename : "" }, body),
            });
            return res.status(200).json(doctor);
        });
    }
};
exports.doctorControllers = doctorControllers;
__decorate([
    (0, routing_controllers_1.Post)("/"),
    (0, routing_controllers_1.UseBefore)((0, uploadFile_1.default)("icon"), (0, validation_1.createValidationMiddleware)(doctor_validation_1.addDoctorValidationSchema)),
    __param(0, (0, routing_controllers_1.Req)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], doctorControllers.prototype, "addDoctor", null);
exports.doctorControllers = doctorControllers = __decorate([
    (0, routing_controllers_1.JsonController)("/api/doctors")
], doctorControllers);

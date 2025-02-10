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
const prismaClient_1 = require("../../prismaClient");
const ApiFeatures_1 = __importDefault(require("../../utils/ApiFeatures"));
const addDoctor = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.prisma.doctor.create({
        data: Object.assign({}, body),
    });
});
exports.addDoctor = addDoctor;
const updateDoctor = (id, fileName, body) => __awaiter(void 0, void 0, void 0, function* () {
    body.specialtyId = parseInt(body.specialtyId, 8);
    return prismaClient_1.prisma.doctor.update({
        where: { id },
        data: Object.assign({ image: fileName }, body),
    });
});
exports.updateDoctor = updateDoctor;
const getDoctors = (query) => __awaiter(void 0, void 0, void 0, function* () {
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
    return { result, pagination };
});
exports.getDoctors = getDoctors;
const getDoctor = (id) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getDoctor = getDoctor;
const deactiveOrActive = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.prisma.doctor.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
});
exports.deactiveOrActive = deactiveOrActive;

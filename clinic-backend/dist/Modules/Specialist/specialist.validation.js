"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSpecialtySchema = exports.specialtySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.specialtySchema = joi_1.default.object({
    title: joi_1.default.string().required().messages({
        "string.empty": "Title is required",
        "string.base": "Title must be a string",
    }),
    icon: joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string()
            .valid("image/png", "image/jpg", "image/jpeg")
            .required(),
        size: joi_1.default.number().required(),
        buffer: joi_1.default.any(),
    }).required(),
});
exports.updateSpecialtySchema = joi_1.default.object({
    id: joi_1.default.string().required(),
    title: joi_1.default.string().messages({
        "string.base": "Title must be a string",
    }),
    icon: joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string()
            .valid("image/png", "image/jpg", "image/jpeg")
            .required(),
        size: joi_1.default.number().required(),
        buffer: joi_1.default.any(),
    }),
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVisitSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createVisitSchema = joi_1.default.object({
    visitDetails: joi_1.default.array()
        .items(joi_1.default.object({
        patientId: joi_1.default.number().integer().required(),
        status: joi_1.default.boolean().required(),
        price: joi_1.default.number().precision(2).positive().required(),
        scheduleId: joi_1.default.number().integer().required(),
    }))
        .min(1)
        .required(),
});

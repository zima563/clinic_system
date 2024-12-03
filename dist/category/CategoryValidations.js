"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCategorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.AddCategorySchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().max(1000).required(),
    image: joi_1.default.string().required(),
    parentId: joi_1.default.number().optional(), // Optional field, could be nullable
});

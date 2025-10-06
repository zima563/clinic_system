"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// Set up multer storage (use memoryStorage for in-memory uploads)
const storage = multer_1.default.memoryStorage();
// Set the file size limit to avoid large file uploads causing issues
const createUploadMiddleware = (fieldName) => {
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Max size 10MB
    }).single(fieldName);
};
exports.default = createUploadMiddleware;
//# sourceMappingURL=uploadFile.js.map
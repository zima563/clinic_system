import multer from "multer";
import { RequestHandler } from "express";

// Set up multer storage (use memoryStorage for in-memory uploads)
const storage = multer.memoryStorage();

// Set the file size limit to avoid large file uploads causing issues
const createUploadMiddleware = (fieldName: string): RequestHandler => {
  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max size 10MB
  }).single(fieldName);
};

export default createUploadMiddleware;

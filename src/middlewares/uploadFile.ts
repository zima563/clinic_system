import multer from "multer";
import { RequestHandler } from "express";

// Set up multer storage (use memoryStorage for in-memory uploads)
const storage = multer.memoryStorage();

// Set the file size limit to avoid large file uploads causing issues
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max size 10MB
}).single("icon"); // "icon" is the fieldname in your form-data

export const uploadSingleFile: RequestHandler = upload;

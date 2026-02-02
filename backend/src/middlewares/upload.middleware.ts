import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../utils/errors';

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'text/csv',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Configure multer storage (memory storage for S3 upload)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`File type ${file.mimetype} is not allowed`));
  }
};

/**
 * Multer upload middleware for single file
 */
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('file');

/**
 * Multer upload middleware for multiple files
 */
export const uploadMultiple = (maxCount: number = 10) =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: maxCount,
    },
  }).array('files', maxCount);

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Validate file size
 */
export const validateFileSize = (size: number, maxSize: number = MAX_FILE_SIZE): boolean => {
  return size <= maxSize;
};

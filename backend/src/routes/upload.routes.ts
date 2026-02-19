import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

// Multer config for file uploads (memory storage for S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1,
  },
});

// ========== PUBLIC ROUTES (No Auth - Token Based) ==========

/**
 * GET /api/v1/upload/:token
 * Get checklist information for the upload page (public)
 */
router.get('/:token', uploadController.getUploadPageData);

/**
 * POST /api/v1/upload/:token
 * Upload file via token (public)
 * Body: multipart/form-data with 'file' and 'itemId'
 */
router.post('/:token', upload.single('file'), uploadController.uploadViaToken);

export default router;

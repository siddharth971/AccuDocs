import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
// import clientRoutes from './client.routes'; // Legacy
import clientRoutes from '../modules/client/presentation/client.routes';
import documentRoutes from './document.routes';
import logRoutes from './log.routes';
import whatsappRoutes from './whatsapp.routes';
import workspaceRoutes from './workspace.routes';
import telegramRoutes from './telegram.routes';
import moduleAuthRoutes from '../modules/auth/presentation/auth.routes';
import userRoutes from '../modules/user/presentation/user.routes';
import checklistRoutes from './checklist.routes';
import uploadRoutes from './upload.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AccuDocs API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/v2/auth', moduleAuthRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/logs', logRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/telegram', telegramRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/checklists', checklistRoutes);
router.use('/upload', uploadRoutes); // Public upload routes (token-based, no auth)

export default router;


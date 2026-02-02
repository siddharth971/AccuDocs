import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import documentRoutes from './document.routes';
import logRoutes from './log.routes';
import whatsappRoutes from './whatsapp.routes';

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
router.use('/clients', clientRoutes);
router.use('/documents', documentRoutes);
router.use('/logs', logRoutes);
router.use('/whatsapp', whatsappRoutes);

export default router;

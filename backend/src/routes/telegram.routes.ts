
import { Router } from 'express';
import * as telegramController from '../controllers/telegram.controller';

const router = Router();

// Webhook endpoint
router.post('/webhook', telegramController.handleWebhook);

// Utility to set webhook
router.post('/set-webhook', telegramController.setWebhook);

export default router;

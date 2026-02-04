
import { Request, Response } from 'express';
import axios from 'axios';
import { telegramService } from '../services/telegram.service';
import { logService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middlewares';
import { config } from '../config';

/**
 * Telegram webhook handler (POST)
 * POST /telegram/webhook
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req;

  // Telegram Update Object
  // https://core.telegram.org/bots/api#update
  if (body.message && body.message.chat && body.message.chat.id) {
    const chatId = body.message.chat.id.toString();
    const text = body.message.text || '';
    const username = body.message.from?.username;

    // Log incoming message
    await logService.createLog('TELEGRAM_MESSAGE', `Received Telegram message from ${chatId}: ${text.substring(0, 50)}`, {
      metadata: { chatId, username, text }
    });

    try {
      const responseText = await telegramService.processMessage(chatId, text, username);
      await telegramService.sendMessage(chatId, responseText);
    } catch (error) {
      console.error('Telegram processing error:', error);
    }
  }

  // Always respond 200 OK to Telegram
  sendSuccess(res, null, 'OK');
});

/**
 * Set Telegram Webhook
 * POST /telegram/set-webhook
 */
export const setWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body; // The public URL of this API + /api/v1/telegram/webhook

  if (!config.telegram.botToken) {
    return sendError(res, 'Telegram Bot Token not configured', 400);
  }

  const webhookUrl = url || `https://${req.get('host')}/api/${config.apiVersion}/telegram/webhook`;
  const telegramApiUrl = `https://api.telegram.org/bot${config.telegram.botToken}/setWebhook?url=${webhookUrl}`;

  try {
    const response = await axios.get(telegramApiUrl);
    sendSuccess(res, response.data, 'Webhook set successfully');
  } catch (error: any) {
    sendError(res, `Failed to set webhook: ${error.message}`, 500);
  }
});

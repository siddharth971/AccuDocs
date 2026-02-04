
import { Request, Response } from 'express';
import { whatsappService } from '../services';
import { authService } from '../services';
import { logService } from '../services';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middlewares';
import { config } from '../config';

/**
 * WhatsApp webhook verification (GET)
 * GET /whatsapp/webhook
 */
export const verifyWebhook = asyncHandler(async (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.meta.webhookVerifyToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

/**
 * WhatsApp webhook handler (POST)
 * POST /whatsapp/webhook
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req;

  // Check if this is a WhatsApp status update (entry[0].changes[0].value.statuses)
  // We strictly look for "messages"
  if (body.object === 'whatsapp_business_account') {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const messageObject = body.entry[0].changes[0].value.messages[0];
      const from = messageObject.from; // Mobile number
      const messageId = messageObject.id;
      const type = messageObject.type;

      let messageBody = '';

      if (type === 'text') {
        messageBody = messageObject.text.body;
      } else if (type === 'button') {
        messageBody = messageObject.button.text; // Payload or text
      } else if (type === 'interactive') {
        if (messageObject.interactive.type === 'button_reply') {
          messageBody = messageObject.interactive.button_reply.id; // or title
        } else if (messageObject.interactive.type === 'list_reply') {
          messageBody = messageObject.interactive.list_reply.id;
        }
      } else {
        // Handle other types as empty or specific text
        messageBody = `[${type}]`;
      }

      const ip = req.ip || req.socket.remoteAddress;

      // Log the incoming message
      await logService.createLog('WHATSAPP_MESSAGE', `Received message from ${from}: ${messageBody.substring(0, 50)}...`, {
        ip,
        metadata: { from, messageId, raw: JSON.stringify(messageObject) },
      });

      try {
        // Check if this is an OTP verification
        const session = await whatsappService.getSession(from);
        const trimmedMessage = messageBody.trim();

        if (session?.state === 'AWAITING_OTP' && /^\d{6}$/.test(trimmedMessage)) {
          // This is an OTP verification attempt
          try {
            await authService.verifyOTP(from, trimmedMessage, ip);
            await whatsappService.updateSession(from, { state: 'AUTHENTICATED' });
          } catch (error) {
            // OTP verification failed, let the regular message handler deal with it
            // or we can consume it here
            await whatsappService.sendMessage(from, '❌ Invalid or expired OTP. Please try again.');
            sendSuccess(res, null, 'OK'); // Ack to Meta
            return;
          }
        }

        // Process the message through WhatsApp service
        const response = await whatsappService.processMessage(from, messageBody);

        // Send response via WhatsApp
        await whatsappService.sendMessage(from, response);
      } catch (error) {
        console.error('WhatsApp webhook error:', error);
        // Don't loop errors back to user ideally
      }
    }
  }

  // Always respond with 200 to acknowledge the webhook to Meta
  sendSuccess(res, null, 'OK');
});

/**
 * Send custom WhatsApp message (admin only)
 * POST /whatsapp/send
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { to, message } = req.body;

  await whatsappService.sendMessage(to, message);

  // Log the action
  await logService.createLog('WHATSAPP_MESSAGE', `Admin sent message to ${to}`, {
    userId: req.user!.userId,
    metadata: { to, messagePreview: message.substring(0, 100) },
  });

  sendSuccess(res, null, 'Message sent successfully');
});

/**
 * Get WhatsApp session status
 * GET /whatsapp/session/:mobile
 */
export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.params;
  const session = await whatsappService.getSession(mobile);
  sendSuccess(res, session);
});

/**
 * Clear WhatsApp session
 * DELETE /whatsapp/session/:mobile
 */
export const clearSession = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.params;
  await whatsappService.clearSession(mobile);
  sendSuccess(res, null, 'Session cleared');
});

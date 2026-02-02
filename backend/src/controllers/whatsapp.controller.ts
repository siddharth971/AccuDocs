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

  if (mode === 'subscribe' && token === config.twilio.webhookVerifyToken) {
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
  const { From, Body, MessageSid } = req.body;

  if (!From || !Body) {
    sendSuccess(res, null, 'OK');
    return;
  }

  const mobile = From.replace('whatsapp:', '');
  const ip = req.ip || req.socket.remoteAddress;

  // Log the incoming message
  await logService.createLog('WHATSAPP_MESSAGE', `Received message from ${mobile}: ${Body.substring(0, 50)}...`, {
    ip,
    metadata: { from: From, messageSid: MessageSid },
  });

  try {
    // Check if this is an OTP verification
    const session = await whatsappService.getSession(mobile);
    const message = Body.trim();

    if (session?.state === 'AWAITING_OTP' && /^\d{6}$/.test(message)) {
      // This is an OTP verification attempt
      try {
        await authService.verifyOTP(mobile, message, ip);
        await whatsappService.updateSession(mobile, { state: 'AUTHENTICATED' });
      } catch (error) {
        // OTP verification failed, let the regular message handler deal with it
      }
    }

    // Process the message through WhatsApp service
    const response = await whatsappService.processMessage(From, Body);

    // Send response via WhatsApp
    await whatsappService.sendMessage(From, response);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    await whatsappService.sendMessage(
      From,
      '❌ Sorry, something went wrong. Please try again later.'
    );
  }

  // Always respond with 200 to acknowledge the webhook
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

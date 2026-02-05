
import { Request, Response } from 'express';
import { whatsappService } from '../services';
import { logService } from '../services';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middlewares';



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

import Twilio from 'twilio';
import { config } from '../config';
import { redisHelpers } from '../config';
import { logger } from '../utils/logger';
import { clientRepository, yearRepository, documentRepository } from '../repositories';
import { s3Helpers } from '../config/s3.config';

// WhatsApp session states
export type SessionState =
  | 'INITIAL'
  | 'AWAITING_OTP'
  | 'AUTHENTICATED'
  | 'SELECTING_YEAR'
  | 'SELECTING_FILE';

export interface WhatsAppSession {
  state: SessionState;
  userId?: string;
  clientId?: string;
  clientCode?: string;
  selectedYear?: string;
  yearId?: string;
  lastActivity: number;
}

// Initialize Twilio client
const twilioClient = config.twilio.accountSid && config.twilio.authToken
  ? Twilio(config.twilio.accountSid, config.twilio.authToken)
  : null;

export const whatsappService = {
  /**
   * Send a WhatsApp message
   */
  async sendMessage(to: string, body: string): Promise<void> {
    if (!twilioClient) {
      logger.warn('Twilio client not configured, logging message instead');
      logger.debug(`WhatsApp message to ${to}: ${body}`);
      return;
    }

    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      await twilioClient.messages.create({
        from: config.twilio.whatsappNumber,
        to: formattedTo,
        body,
      });
      logger.info(`WhatsApp message sent to ${to}`);
    } catch (error) {
      logger.error(`Failed to send WhatsApp message: ${(error as Error).message}`);
      throw error;
    }
  },

  /**
   * Send OTP via WhatsApp
   */
  async sendOTP(mobile: string, otp: string): Promise<void> {
    const message = `🔐 *AccuDocs Authentication*\n\nYour OTP is: *${otp}*\n\nThis code will expire in ${config.otp.expiryMinutes} minutes.\n\n⚠️ Do not share this code with anyone.`;
    await this.sendMessage(mobile, message);
  },

  /**
   * Get or create WhatsApp session
   */
  async getSession(mobile: string): Promise<WhatsAppSession | null> {
    const session = await redisHelpers.getWhatsAppSession(mobile);
    return session as WhatsAppSession | null;
  },

  /**
   * Update WhatsApp session
   */
  async updateSession(mobile: string, session: Partial<WhatsAppSession>): Promise<void> {
    const existing = await this.getSession(mobile) || {
      state: 'INITIAL',
      lastActivity: Date.now(),
    };

    const updated: WhatsAppSession = {
      ...existing,
      ...session,
      lastActivity: Date.now(),
    };

    await redisHelpers.setWhatsAppSession(mobile, updated, 30 * 60); // 30 minute session
  },

  /**
   * Clear WhatsApp session
   */
  async clearSession(mobile: string): Promise<void> {
    await redisHelpers.deleteWhatsAppSession(mobile);
  },

  /**
   * Process incoming WhatsApp message
   */
  async processMessage(from: string, body: string): Promise<string> {
    const mobile = from.replace('whatsapp:', '');
    const message = body.trim().toLowerCase();

    let session = await this.getSession(mobile);

    // Initialize session if not exists
    if (!session) {
      session = {
        state: 'INITIAL',
        lastActivity: Date.now(),
      };
    }

    let response: string;

    switch (session.state) {
      case 'INITIAL':
        response = await this.handleInitialState(mobile, message, session);
        break;

      case 'AWAITING_OTP':
        response = await this.handleOTPState(mobile, body, session);
        break;

      case 'AUTHENTICATED':
        response = await this.handleAuthenticatedState(mobile, message, session);
        break;

      case 'SELECTING_YEAR':
        response = await this.handleYearSelection(mobile, message, session);
        break;

      case 'SELECTING_FILE':
        response = await this.handleFileSelection(mobile, message, session);
        break;

      default:
        response = await this.sendWelcomeMessage();
    }

    return response;
  },

  /**
   * Handle initial state - user says hi
   */
  async handleInitialState(mobile: string, message: string, session: WhatsAppSession): Promise<string> {
    const greetings = ['hi', 'hello', 'hey', 'start', 'help'];

    if (greetings.some(g => message.includes(g))) {
      // Check if user exists
      const client = await clientRepository.findAll({ search: mobile });

      if (client.clients.length > 0) {
        await this.updateSession(mobile, {
          state: 'AWAITING_OTP',
          clientId: client.clients[0].id,
          clientCode: client.clients[0].code,
        });

        return `👋 *Welcome to AccuDocs!*\n\nWe'll send you an OTP to verify your identity.\n\n📱 Please wait for your OTP...`;
      } else {
        return `❌ *Access Denied*\n\nYour mobile number is not registered with AccuDocs.\n\nPlease contact your accountant to get registered.`;
      }
    }

    return this.sendWelcomeMessage();
  },

  /**
   * Handle OTP verification state
   */
  async handleOTPState(mobile: string, otp: string, session: WhatsAppSession): Promise<string> {
    // Validate OTP format
    if (!/^\d{6}$/.test(otp.trim())) {
      return `⚠️ Please enter a valid 6-digit OTP code.`;
    }

    // OTP verification is handled by auth service
    // Here we just update the session state
    await this.updateSession(mobile, {
      state: 'AUTHENTICATED',
    });

    return await this.showMainMenu(mobile, session);
  },

  /**
   * Handle authenticated state
   */
  async handleAuthenticatedState(mobile: string, message: string, session: WhatsAppSession): Promise<string> {
    if (message === 'menu' || message === 'm') {
      return await this.showMainMenu(mobile, session);
    }

    if (message === 'documents' || message === 'd' || message === '1') {
      const years = await yearRepository.findByClientId(session.clientId!);

      if (years.length === 0) {
        return `📁 *No Documents Available*\n\nNo year folders have been created yet.\nPlease contact your accountant.`;
      }

      let yearList = `📅 *Select Year*\n\nPlease choose a year:\n\n`;
      years.forEach((year, index) => {
        const docCount = year.documents?.length || 0;
        yearList += `${index + 1}. ${year.year} (${docCount} files)\n`;
      });
      yearList += `\n📝 Reply with the year number (e.g., "1" for ${years[0].year})`;

      await this.updateSession(mobile, {
        state: 'SELECTING_YEAR',
      });

      return yearList;
    }

    if (message === 'logout' || message === 'exit' || message === '0') {
      await this.clearSession(mobile);
      return `👋 *Goodbye!*\n\nYou have been logged out.\n\nSend "Hi" to start a new session.`;
    }

    return await this.showMainMenu(mobile, session);
  },

  /**
   * Handle year selection
   */
  async handleYearSelection(mobile: string, message: string, session: WhatsAppSession): Promise<string> {
    if (message === 'back' || message === 'b') {
      await this.updateSession(mobile, { state: 'AUTHENTICATED' });
      return await this.showMainMenu(mobile, session);
    }

    const years = await yearRepository.findByClientId(session.clientId!);
    const selection = parseInt(message, 10);

    if (isNaN(selection) || selection < 1 || selection > years.length) {
      return `⚠️ Invalid selection. Please enter a number between 1 and ${years.length}, or type "back" to go back.`;
    }

    const selectedYear = years[selection - 1];
    const documents = await documentRepository.findByYearId(selectedYear.id);

    if (documents.length === 0) {
      return `📁 *No Documents in ${selectedYear.year}*\n\nNo documents have been uploaded for this year yet.\n\nType "back" to select a different year.`;
    }

    await this.updateSession(mobile, {
      state: 'SELECTING_FILE',
      selectedYear: selectedYear.year,
      yearId: selectedYear.id,
    });

    let fileList = `📄 *Documents for ${selectedYear.year}*\n\n`;
    documents.forEach((doc, index) => {
      const sizeKB = Math.round(doc.size / 1024);
      fileList += `${index + 1}. ${doc.originalName} (${sizeKB}KB)\n`;
    });
    fileList += `\n📝 Reply with the file number to receive it.`;
    fileList += `\n↩️ Type "back" to select a different year.`;

    return fileList;
  },

  /**
   * Handle file selection
   */
  async handleFileSelection(mobile: string, message: string, session: WhatsAppSession): Promise<string> {
    if (message === 'back' || message === 'b') {
      await this.updateSession(mobile, { state: 'AUTHENTICATED' });
      const years = await yearRepository.findByClientId(session.clientId!);

      let yearList = `📅 *Select Year*\n\n`;
      years.forEach((year, index) => {
        yearList += `${index + 1}. ${year.year}\n`;
      });
      yearList += `\n📝 Reply with the year number.`;

      await this.updateSession(mobile, { state: 'SELECTING_YEAR' });
      return yearList;
    }

    const documents = await documentRepository.findByYearId(session.yearId!);
    const selection = parseInt(message, 10);

    if (isNaN(selection) || selection < 1 || selection > documents.length) {
      return `⚠️ Invalid selection. Please enter a number between 1 and ${documents.length}, or type "back" to go back.`;
    }

    const selectedDoc = documents[selection - 1];

    try {
      // Generate signed URL
      const signedUrl = await s3Helpers.getSignedDownloadUrl(selectedDoc.s3Path);

      // In production, you would send the document as a media message
      // For now, we send the download link
      return `📎 *${selectedDoc.originalName}*\n\n🔗 Download Link (expires in 5 minutes):\n${signedUrl}\n\n📝 Type "back" to select another file or "menu" for main menu.`;
    } catch (error) {
      logger.error(`Failed to generate download URL: ${(error as Error).message}`);
      return `❌ Sorry, there was an error retrieving the document. Please try again later.`;
    }
  },

  /**
   * Show main menu
   */
  async showMainMenu(mobile: string, session: WhatsAppSession): Promise<string> {
    return `📋 *AccuDocs Menu*\n\nClient: ${session.clientCode || 'N/A'}\n\n1️⃣ View Documents\n0️⃣ Logout\n\n📝 Reply with the option number.`;
  },

  /**
   * Send welcome message
   */
  sendWelcomeMessage(): string {
    return `👋 *Welcome to AccuDocs!*\n\n📄 Access your tax and finance documents securely.\n\n💬 Send "Hi" to get started.`;
  },

  /**
   * Handle webhook verification (for Twilio)
   */
  verifyWebhook(signature: string, url: string, body: Record<string, string>): boolean {
    if (!twilioClient) return true; // Skip verification if not configured

    const authToken = config.twilio.authToken;
    const twilio = require('twilio');
    return twilio.validateRequest(authToken, signature, url, body);
  },
};

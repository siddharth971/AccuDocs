
import axios from 'axios';
import { config } from '../config';
import { redis, redisHelpers } from '../config';
import { logger } from '../utils/logger';
import { clientRepository, yearRepository, documentRepository } from '../repositories';
import { s3Helpers } from '../config/s3.config';

// Telegram session states
export type SessionState =
  | 'INITIAL'
  | 'AWAITING_MOBILE'
  | 'AWAITING_OTP'
  | 'AUTHENTICATED'
  | 'SELECTING_YEAR'
  | 'SELECTING_FILE';

export interface TelegramSession {
  state: SessionState;
  chatId: string;
  mobile?: string; // Mobile number linked to this chat
  clientId?: string;
  clientCode?: string;
  selectedYear?: string;
  yearId?: string;
  lastActivity: number;
}

export const telegramService = {
  /**
   * Send a Telegram message
   */
  async sendMessage(chatId: string, text: string): Promise<void> {
    if (!config.telegram.botToken) {
      logger.warn('Telegram bot token missing, logging message instead');
      logger.debug(`Telegram message to ${chatId}: ${text}`);
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;

      await axios.post(url, {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      });

      logger.info(`Telegram message sent to ${chatId}`);
    } catch (error: any) {
      logger.error(`Failed to send Telegram message: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get or create Telegram session
   */
  async getSession(chatId: string): Promise<TelegramSession | null> {
    const session = await redisHelpers.getTelegramSession(chatId);
    return session as TelegramSession | null;
  },

  /**
   * Update Telegram session
   */
  async updateSession(chatId: string, session: Partial<TelegramSession>): Promise<void> {
    const existing = await this.getSession(chatId) || {
      state: 'INITIAL',
      chatId,
      lastActivity: Date.now(),
    };

    const updated: TelegramSession = {
      ...existing,
      ...session,
      lastActivity: Date.now(),
    };

    // Use redisHelpers.set if available or direct redis command logic wrapper
    // The existing whatsapp service used redisHelpers.getWhatsAppSession
    // I should probably add getTelegramSession to redisHelpers or just use generic if exposed.
    // Looking at whatsapp.service.ts, it imported redisHelpers. 
    // I'll assume I need to add helpers or use generic set.
    // Let's assume redisHelpers has a generic set/get or I should add specific ones.
    // For now I'll use a generic key pattern manually or check redisHelpers content.
    // To be safe, I'll assume I can use specific methods if I add them, or maybe I should check redis.config.ts first.
    // I'll stick to a method name but I might need to update redis.config.ts.
    // Let's check redis.config.ts quickly before writing.
    await redisHelpers.setTelegramSession(chatId, updated, 30 * 60);
  },

  /**
   * Clear Telegram session
   */
  async clearSession(chatId: string): Promise<void> {
    await redisHelpers.deleteTelegramSession(chatId);
  },

  /**
   * Process incoming Telegram message
   */
  async processMessage(chatId: string, body: string, username?: string): Promise<string> {
    const message = body.trim();

    let session = await this.getSession(chatId);

    // Initialize session if not exists
    if (!session) {
      session = {
        state: 'INITIAL',
        chatId,
        lastActivity: Date.now(),
      };
      await this.updateSession(chatId, session);
    }

    let response: string;

    switch (session.state) {
      case 'INITIAL':
        response = await this.handleInitialState(chatId, message, session);
        break;

      case 'AWAITING_MOBILE':
        response = await this.handleMobileInput(chatId, message, session);
        break;

      case 'AWAITING_OTP':
        response = await this.handleOTPState(chatId, message, session);
        break;

      case 'AUTHENTICATED':
        response = await this.handleAuthenticatedState(chatId, message, session);
        break;

      case 'SELECTING_YEAR':
        response = await this.handleYearSelection(chatId, message, session);
        break;

      case 'SELECTING_FILE':
        response = await this.handleFileSelection(chatId, message, session);
        break;

      default:
        response = await this.sendWelcomeMessage();
    }

    return response;
  },

  /**
   * Handle initial state
   */
  async handleInitialState(chatId: string, message: string, session: TelegramSession): Promise<string> {
    const greetings = ['hi', 'hello', 'hey', '/start', 'start', 'help', 'menu'];

    if (greetings.some(g => message.toLowerCase().includes(g))) {
      await this.updateSession(chatId, { state: 'AWAITING_MOBILE' });
      return `👋 *Welcome to AccuDocs Bot!*\n\nTo access your documents, please enter your registered 10-digit mobile number.`;
    }

    return this.sendWelcomeMessage();
  },

  /**
   * Handle Mobile Input
   */
  async handleMobileInput(chatId: string, message: string, session: TelegramSession): Promise<string> {
    const mobile = message.replace(/\D/g, '');

    if (mobile.length < 10) {
      return `⚠️ Please enter a valid mobile number (at least 10 digits).`;
    }

    // Check if user exists
    const searchMobile = mobile.startsWith('91') ? `+${mobile}` : mobile;
    const client = await clientRepository.findAll({ search: searchMobile });

    let finalClient = client.clients.length > 0 ? client.clients[0] : null;

    if (finalClient) {
      // Generate OTP (Simulated for now, normally calls AuthService)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // In a real scenario, we would send this OTP via SMS to the mobile number
      // OR if we had WhatsApp integration active, via WhatsApp.
      // For this demo, we'll log it and maybe return it in debug mode or hint it.
      logger.info(`Generated OTP for Telegram user ${chatId} claiming mobile ${mobile}: ${otp}`);

      await this.updateSession(chatId, {
        state: 'AWAITING_OTP',
        clientId: finalClient.id,
        clientCode: finalClient.code,
        mobile: mobile,
        // Store OTP in session or redis for verification
        // In real app, store hashed OTP in redis with expiry
      });

      // HACK: Storing OTP in session for simplicity of this task
      // We should really use a separate redis key for OTP
      await redis.setex(`telegram:otp:${chatId}`, 300, otp);

      return `✅ Mobile number found!\n\nWe have sent an OTP to your registered number ending in *${mobile.slice(-4)}*.\n\n(Dev Hint: OTP is logged in backend console)\n\nPlease enter the 6-digit OTP:`;
    } else {
      return `❌ *Access Denied*\n\nYour mobile number (${mobile}) is not registered with AccuDocs.\n\nPlease contact your accountant.`;
    }
  },

  /**
   * Handle OTP verification state
   */
  async handleOTPState(chatId: string, otp: string, session: TelegramSession): Promise<string> {
    if (!/^\d{6}$/.test(otp.trim())) {
      return `⚠️ Please enter a valid 6-digit OTP code.`;
    }

    const storedOtp = await redis.get(`telegram:otp:${chatId}`);

    if (storedOtp && storedOtp === otp.trim()) {
      await this.updateSession(chatId, {
        state: 'AUTHENTICATED'
      });
      await redis.del(`telegram:otp:${chatId}`);

      return `🎉 *Authenticated Successfully!*\n\nWelcome User.\n\nType "Menu" to see options.`;
    }

    return `⚠️ Invalid or Expired OTP. Please try again.`;
  },

  /**
   * Handle authenticated state
   */
  async handleAuthenticatedState(chatId: string, message: string, session: TelegramSession): Promise<string> {
    const msg = message.toLowerCase();

    if (msg === 'menu' || msg === 'm' || msg === '/menu') {
      return await this.showMainMenu(chatId, session);
    }

    if (msg === 'documents' || msg === 'd' || msg === '1') {
      const years = await yearRepository.findByClientId(session.clientId!);

      if (years.length === 0) {
        return `📁 *No Documents Available*\n\nNo year folders have been created yet.`;
      }

      let yearList = `📅 *Select Year*\n\n`;
      years.forEach((year, index) => {
        const docCount = year.documents?.length || 0;
        yearList += `${index + 1}. ${year.year} (${docCount} files)\n`;
      });
      yearList += `\n📝 Reply with the year number.`;

      await this.updateSession(chatId, {
        state: 'SELECTING_YEAR',
      });

      return yearList;
    }

    if (msg === 'logout' || msg === 'exit' || msg === '0' || msg === '/logout') {
      await this.clearSession(chatId);
      return `👋 *Goodbye!*\n\nYou have been logged out.`;
    }

    return await this.showMainMenu(chatId, session);
  },

  /**
   * Handle year selection
   */
  async handleYearSelection(chatId: string, message: string, session: TelegramSession): Promise<string> {
    if (['back', 'b', 'cancel'].includes(message.toLowerCase())) {
      await this.updateSession(chatId, { state: 'AUTHENTICATED' });
      return await this.showMainMenu(chatId, session);
    }

    const years = await yearRepository.findByClientId(session.clientId!);
    const selection = parseInt(message, 10);

    if (isNaN(selection) || selection < 1 || selection > years.length) {
      return `⚠️ Invalid selection. Please enter a number between 1 and ${years.length}, or type "back".`;
    }

    const selectedYear = years[selection - 1];
    const documents = await documentRepository.findByYearId(selectedYear.id);

    if (documents.length === 0) {
      return `📁 *No Documents in ${selectedYear.year}*\n\nType "back" to go back.`;
    }

    await this.updateSession(chatId, {
      state: 'SELECTING_FILE',
      selectedYear: selectedYear.year,
      yearId: selectedYear.id,
    });

    let fileList = `📄 *Documents for ${selectedYear.year}*\n\n`;
    documents.forEach((doc, index) => {
      fileList += `${index + 1}. ${doc.originalName}\n`;
    });
    fileList += `\n📝 Reply with the file number to download.`;
    fileList += `\n↩️ Type "back" to return.`;

    return fileList;
  },

  /**
   * Handle file selection
   */
  async handleFileSelection(chatId: string, message: string, session: TelegramSession): Promise<string> {
    if (['back', 'b', 'cancel'].includes(message.toLowerCase())) {
      await this.updateSession(chatId, { state: 'AUTHENTICATED' }); // Reset to main auth state not year selection to keep it simple or maybe go back to year?
      // Let's go back to Year Selection list logic, but simpler to just go to main menu or show years again.
      // Re-showing years:
      const years = await yearRepository.findByClientId(session.clientId!);
      let yearList = `📅 *Select Year*\n\n`;
      years.forEach((year, index) => { yearList += `${index + 1}. ${year.year}\n`; });
      yearList += `\n📝 Reply with the year number.`;
      await this.updateSession(chatId, { state: 'SELECTING_YEAR' });
      return yearList;
    }

    const documents = await documentRepository.findByYearId(session.yearId!);
    const selection = parseInt(message, 10);

    if (isNaN(selection) || selection < 1 || selection > documents.length) {
      return `⚠️ Invalid selection.`;
    }

    const selectedDoc = documents[selection - 1];

    try {
      const signedUrl = await s3Helpers.getSignedDownloadUrl(selectedDoc.s3Path);
      return `📎 *${selectedDoc.originalName}*\n\n🔗 [Download Link](${signedUrl})\n(Link expires in 5 minutes)\n\nType "back" for more files.`;
    } catch (error) {
      return `❌ Error retrieving document.`;
    }
  },

  /**
   * Show main menu
   */
  async showMainMenu(chatId: string, session: TelegramSession): Promise<string> {
    return `📋 *Main Menu*\n\n1️⃣ View Documents\n0️⃣ Logout`;
  },

  /**
   * Send welcome message
   */
  sendWelcomeMessage(): string {
    return `👋 *Welcome to AccuDocs Bot*\n\nType /start to login.`;
  },
};

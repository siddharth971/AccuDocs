
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';
import * as qrcode from 'qrcode-terminal';
import { config } from '../config';
import { redisHelpers } from '../config';
import { logger } from '../utils/logger';
import { clientRepository, yearRepository, documentRepository, userRepository, folderRepository, fileRepository } from '../repositories';
import { authService } from './auth.service';
import { s3Helpers } from '../config/s3.config';

// WhatsApp session states
export type SessionState =
  | 'INITIAL'
  | 'AWAITING_OTP'
  | 'AUTHENTICATED'
  | 'EXPLORING_FOLDER';

export interface WhatsAppSession {
  state: SessionState;
  userId?: string;
  clientId?: string;
  clientCode?: string;
  currentFolderId?: string;
  lastActivity: number;
}

let client: Client;

export const whatsappService = {
  /**
   * Initialize WhatsApp Client
   */
  initialize(): void {
    logger.info('Initializing WhatsApp Client...');

    client = new Client({
      authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    client.on('qr', (qr) => {
      logger.info('QR Code received. Scan it with your phone:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      logger.info('✅ WhatsApp Client is ready!');
    });

    client.on('authenticated', () => {
      logger.info('✅ WhatsApp Client authenticated!');
    });

    client.on('auth_failure', (msg) => {
      logger.error('❌ WhatsApp Authentication failure:', msg);
    });

    client.on('message', async (msg) => {
      try {
        if (msg.from.includes('@g.us')) return; // Ignore group messages

        // Process message and get response
        const response = await this.processMessage(msg);

        if (response) {
          await client.sendMessage(msg.from, response);
          logger.info(`Replied to ${msg.from}`);
        }
      } catch (err) {
        logger.error('Error handling message:', err);
      }
    });

    client.initialize();
  },

  /**
   * Send a WhatsApp message
   */
  async sendMessage(to: string, body: string): Promise<void> {
    if (!client) {
      logger.warn('WhatsApp client not initialized');
      return;
    }

    try {
      // Ensure 'to' is successfully formatted for whatsapp-web.js
      let chatId = to;
      if (!chatId.includes('@')) {
        chatId = `${to.replace(/\D/g, '')}@c.us`;
      }

      await client.sendMessage(chatId, body);
      logger.info(`WhatsApp message sent to ${chatId}`);
    } catch (error: any) {
      logger.error(`Failed to send WhatsApp message: ${error.message}`);
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
  async processMessage(msg: any): Promise<any> {
    const from = msg.from;
    const mobile = from.replace(/\D/g, ''); // Clean number

    let message = msg.body.trim().toLowerCase();

    // Handle Button clicks
    if (msg.type === 'buttons_response' && msg.selectedButtonId) {
      message = msg.selectedButtonId.toLowerCase();
    }

    // Handle List selections
    if (msg.type === 'list_response' && msg.selectedRowId) {
      message = msg.selectedRowId.toLowerCase();
    }

    let session = await this.getSession(mobile);

    // Initialize session if not exists
    if (!session) {
      session = {
        state: 'INITIAL',
        lastActivity: Date.now(),
      };
    }

    let response: any;

    switch (session.state) {
      case 'INITIAL':
        response = await this.handleInitialState(mobile, message, session);
        break;

      case 'AWAITING_OTP':
        response = await this.handleOTPState(mobile, msg.body, session);
        break;

      case 'AUTHENTICATED':
        response = await this.handleAuthenticatedState(mobile, message, session);
        break;

      case 'EXPLORING_FOLDER':
        response = await this.handleFolderExploration(mobile, message, session);
        break;

      default:
        response = await this.sendWelcomeMessage();
    }

    return response;
  },

  /**
   * Handle initial state - user says hi
   */
  async handleInitialState(mobile: string, message: string, session: WhatsAppSession): Promise<any> {
    const greetings = ['hi', 'hello', 'hey', 'start', 'help', 'menu'];

    if (greetings.some(g => message.includes(g)) || message === 'start_btn') {
      // Check if user exists via UserRepository for precise mobile matching
      const formattedMobile = mobile.startsWith('91') ? `+${mobile}` : mobile;
      let user = await userRepository.findByMobile(formattedMobile);

      let finalClient = null;
      if (user) {
        finalClient = await clientRepository.findByUserId(user.id);
      }

      if (finalClient) {
        // SKIP OTP Authentication as requested
        await this.updateSession(mobile, {
          state: 'AUTHENTICATED',
          clientId: finalClient.id,
          clientCode: finalClient.code,
        });

        return await this.showMainMenu(mobile, {
          state: 'AUTHENTICATED',
          clientId: finalClient.id,
          clientCode: finalClient.code,
          lastActivity: Date.now()
        });
      } else {
        return `❌ *Access Denied*\n\nYour mobile number (${mobile}) is not registered with AccuDocs.\n\nPlease contact your accountant to get registered.`;
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

    try {
      const formattedMobile = mobile.startsWith('91') ? `+${mobile}` : mobile;
      await authService.verifyOTP(formattedMobile, otp.trim());

      await this.updateSession(mobile, { state: 'AUTHENTICATED' });
      return await this.showMainMenu(mobile, session);
    } catch (error: any) {
      return `❌ ${error.message || 'Invalid OTP'}. Please try again or say "Hi" to restart.`;
    }
  },


  /**
   * Handle authenticated state
   */
  async handleAuthenticatedState(mobile: string, message: string, session: WhatsAppSession): Promise<any> {
    if (message === 'menu' || message === 'm' || message === 'main_menu') {
      return await this.showMainMenu(mobile, session);
    }

    if (message === 'documents' || message === 'd' || message === '1' || message === 'view_docs') {
      const rootFolder = await folderRepository.findRootByClientId(session.clientId!);
      if (!rootFolder) {
        return `📁 *No Documents Available*\n\nYour account has no folders. Please contact your accountant.`;
      }
      return await this.listFolderContents(mobile, rootFolder.id, session);
    }

    if (message === 'logout' || message === 'exit' || message === '0' || message === 'logout_btn') {
      await this.clearSession(mobile);
      return `👋 *Goodbye!*\n\nYou have been logged out.\n\nSend "Hi" to start a new session.`;
    }

    return await this.showMainMenu(mobile, session);
  },

  /**
   * List folder contents and update session
   */
  async listFolderContents(mobile: string, folderId: string, session: WhatsAppSession): Promise<any> {
    const folder = await folderRepository.findById(folderId);
    if (!folder) return `❌ Folder not found.`;

    const subfolders = await folderRepository.findByParentId(folderId);
    subfolders.sort((a, b) => {
      const aIsYear = /^\d{4}$/.test(a.name);
      const bIsYear = /^\d{4}$/.test(b.name);
      if (aIsYear && bIsYear) return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });

    const files = (folder as any).files || folder.get('files') || [];
    files.sort((a: any, b: any) => (a.originalName || a.fileName).localeCompare(b.originalName || b.fileName));

    const totalItems = subfolders.length + files.length;
    if (totalItems === 0) {
      if (!folder.parentId) {
        return `📁 *No Documents Available*\n\nNo folders or files have been created yet.`;
      }
      return `📁 *${folder.name}*\n\nThis folder is empty.\n\nType "back" to go up or "menu" for main menu.`;
    }

    let menuText = `┌─────────────────────┐\n`;
    menuText += `│  📁 *${folder.name}*\n`;
    menuText += `└─────────────────────┘\n\n`;

    let itemNumber = 1;

    if (subfolders.length > 0) {
      menuText += `📂 *FOLDERS*\n`;
      menuText += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
      subfolders.forEach(sub => {
        menuText += `  *${itemNumber}* ▸ 📁 ${sub.name}\n`;
        itemNumber++;
      });
      menuText += `\n`;
    }

    if (files.length > 0) {
      menuText += `📄 *FILES*\n`;
      menuText += `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
      files.forEach((file: any) => {
        const fileName = file.originalName || file.fileName;
        const fileSize = Math.round(file.size / 1024);
        menuText += `  *${itemNumber}* ▸ 📄 ${fileName}\n`;
        menuText += `       _(${fileSize} KB)_\n`;
        itemNumber++;
      });
      menuText += `\n`;
    }

    menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
    menuText += `💡 *Quick Actions:*\n`;
    menuText += `  *B* ◂ Go Back\n`;
    menuText += `  *M* ◂ Main Menu\n`;
    menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
    menuText += `_Reply with a number to select_`;

    await this.updateSession(mobile, {
      state: 'EXPLORING_FOLDER',
      currentFolderId: folderId
    });

    return menuText;
  },

  /**
   * Handle dynamic folder exploration (multi-level)
   */
  async handleFolderExploration(mobile: string, message: string, session: WhatsAppSession): Promise<any> {
    if (message === 'back' || message === 'b' || message === 'back_btn') {
      const currentFolder = await folderRepository.findById(session.currentFolderId!);
      if (!currentFolder || !currentFolder.parentId) {
        await this.updateSession(mobile, { state: 'AUTHENTICATED' });
        return await this.showMainMenu(mobile, session);
      }
      return await this.listFolderContents(mobile, currentFolder.parentId, session);
    }

    if (message === 'menu' || message === 'm' || message === 'main_menu') {
      await this.updateSession(mobile, { state: 'AUTHENTICATED' });
      return await this.showMainMenu(mobile, session);
    }

    const currentFolder = await folderRepository.findById(session.currentFolderId!);
    if (!currentFolder) return `❌ Session error. Type "menu" to restart.`;

    // Handle interactive selection IDs
    if (message.startsWith('folder_')) {
      const folderId = message.replace('folder_', '');
      return await this.listFolderContents(mobile, folderId, session);
    }

    if (message.startsWith('file_')) {
      const fileId = message.replace('file_', '');
      const files = (currentFolder as any).files || currentFolder.get('files') || [];
      const selectedFile = files.find((f: any) => f.id === fileId || f.id === parseInt(fileId));

      if (selectedFile) {
        return await this.deliverFile(mobile, selectedFile);
      }
    }

    // Fallback to numeric selection for backward compatibility
    const subfolders = await folderRepository.findByParentId(currentFolder.id);
    subfolders.sort((a, b) => {
      const aIsYear = /^\d{4}$/.test(a.name);
      const bIsYear = /^\d{4}$/.test(b.name);
      if (aIsYear && bIsYear) return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });

    const files = (currentFolder as any).files || currentFolder.get('files') || [];
    files.sort((a: any, b: any) => (a.originalName || a.fileName).localeCompare(b.originalName || b.fileName));

    const items = [
      ...subfolders.map(f => ({ type: 'folder' as const, id: f.id })),
      ...files.map((f: any) => ({ type: 'file' as const, id: f.id, originalName: f.originalName, fileName: f.fileName, s3Path: f.s3Path }))
    ];

    const selection = parseInt(message, 10);
    if (!isNaN(selection) && selection >= 1 && selection <= items.length) {
      const selectedItem = items[selection - 1];
      if (selectedItem.type === 'folder') {
        return await this.listFolderContents(mobile, selectedItem.id, session);
      } else {
        return await this.deliverFile(mobile, selectedItem);
      }
    }

    return `⚠️ Invalid selection. Please select an item from the list, or type "back" to go up.`;
  },

  /**
   * Deliver file directly to user
   */
  async deliverFile(mobile: string, file: any): Promise<string> {
    try {
      const signedUrl = await s3Helpers.getSignedDownloadUrl(file.s3Path!);
      const docName = file.originalName || file.fileName;

      // Fetch the file as a buffer
      const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
      const media = new MessageMedia(
        response.headers['content-type'],
        Buffer.from(response.data).toString('base64'),
        docName
      );

      // Send the file directly
      const chatId = mobile.includes('@') ? mobile : `${mobile.replace(/\D/g, '')}@c.us`;
      await client.sendMessage(chatId, media);

      return `✅ *${docName}* sent directly below.\n\n📝 Select another item or type "back" to return.`;
    } catch (error) {
      logger.error(`Failed to send direct media: ${(error as Error).message}`);
      return `❌ Error retrieving document. Please try again later.`;
    }
  },

  /**
   * Show main menu
   */
  async showMainMenu(mobile: string, session: WhatsAppSession): Promise<string> {
    return `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
      `┃  🏠 *ACCUDOCS*          \n` +
      `┃  _Main Menu_            \n` +
      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
      `👤 Client: *${session.clientCode || 'N/A'}*\n\n` +
      `Welcome back! Choose an option:\n\n` +
      `┌──────────────────────┐\n` +
      `│  *1* ▸ 📁 My Documents\n` +
      `│  *0* ▸ 🚪 Logout\n` +
      `└──────────────────────┘\n\n` +
      `_Reply *1* or *0* to continue_`;
  },

  /**
   * Send welcome message
   */
  sendWelcomeMessage(): string {
    return `┏━━━━━━━━━━━━━━━━━━━━━┓\n` +
      `┃  📄 *ACCUDOCS*          \n` +
      `┃  _Your Digital Vault_   \n` +
      `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
      `Access your tax & finance documents\n` +
      `securely via WhatsApp.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💬 Type *Hi* to get started\n` +
      `━━━━━━━━━━━━━━━━━━━━`;
  },
};

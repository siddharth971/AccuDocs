
import type { Client, LocalAuth, MessageMedia as MessageMediaType } from 'whatsapp-web.js';
import axios from 'axios';
import * as qrcode from 'qrcode-terminal';
import * as fs from 'fs';
import * as path from 'path';
import { config, redisHelpers } from '../config';
import { logger } from '../utils/logger';
import { clientRepository, userRepository, folderRepository } from '../repositories';
import { authService } from './auth.service';
import { s3Helpers } from '../config/s3.config';
import { socketService } from './socket.service';
import { User } from '../models/user.model';

// WhatsApp session states
export type SessionState =
  | 'INITIAL'
  | 'AWAITING_OTP'
  | 'AWAITING_CLIENT_SELECTION'
  | 'AUTHENTICATED'
  | 'EXPLORING_FOLDER'
  | 'UPLOADING_CHECKLIST';

export interface MatchingClient {
  id: string;
  code: string;
  name: string;
}

export interface WhatsAppSession {
  state: SessionState;
  userId?: string;
  clientId?: string;
  clientCode?: string;
  currentFolderId?: string;
  matchingClients?: MatchingClient[];
  activeChecklistId?: string; // For file upload tracking
  lastActivity: number;
}

let client: Client | undefined;
let MessageMedia: typeof MessageMediaType;
let currentQR: string | null = null;
let connectionStatus: 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATED' | 'DISCONNECTED' = 'DISCONNECTED';

const setupClientEvents = () => {
  if (!client) return;

  client.on('qr', (qr) => {
    logger.info('QR Code received. Scan it with your phone.');
    currentQR = qr;
    connectionStatus = 'QR_READY';
    qrcode.generate(qr, { small: true });

    socketService.emit('whatsapp:qr', qr);
    socketService.emit('whatsapp:status', { status: connectionStatus });
    socketService.emit('whatsapp:log', 'QR Code received. Waiting for scan...');
  });

  client.on('ready', () => {
    logger.info('✅ WhatsApp Client is ready!');
    currentQR = null;
    connectionStatus = 'AUTHENTICATED';

    socketService.emit('whatsapp:status', { status: connectionStatus });
    socketService.emit('whatsapp:log', 'WhatsApp Client is ready!');
  });

  client.on('authenticated', () => {
    logger.info('✅ WhatsApp Client authenticated!');
    currentQR = null;
    connectionStatus = 'AUTHENTICATED';

    socketService.emit('whatsapp:status', { status: connectionStatus });
    socketService.emit('whatsapp:log', 'Authenticated successfully');
  });

  client.on('auth_failure', (msg) => {
    logger.error('❌ WhatsApp Authentication failure:', msg);
    connectionStatus = 'DISCONNECTED';

    socketService.emit('whatsapp:status', { status: connectionStatus });
    socketService.emit('whatsapp:log', `Authentication failed: ${msg}`);
  });

  client.on('disconnected', (reason) => {
    logger.warn('⚠️ WhatsApp Client disconnected:', reason);
    connectionStatus = 'DISCONNECTED';
    currentQR = null;

    socketService.emit('whatsapp:status', { status: connectionStatus });
    socketService.emit('whatsapp:log', `Client disconnected: ${reason}`);
  });

  client.on('message', async (msg) => {
    try {
      if (msg.from.includes('@g.us')) return; // Ignore group messages

      socketService.emit('whatsapp:message', {
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp
      });
      socketService.emit('whatsapp:log', `Message from ${msg.from}: ${msg.body.substring(0, 50)}...`);

      // Process message and get response
      const response = await whatsappService.processMessage(msg);

      if (response && client) {
        await client.sendMessage(msg.from, response);
        logger.info(`Replied to ${msg.from}`);
        socketService.emit('whatsapp:log', `Replied to ${msg.from}`);

        // Emit bot reply to frontend
        const replyBody = typeof response === 'string' ? response : '[Media/Object Sent]';
        socketService.emit('whatsapp:message', {
          from: 'Bot',
          body: replyBody,
          timestamp: Math.floor(Date.now() / 1000)
        });
      }
    } catch (err: any) {
      logger.error('Error handling message:', err);
      socketService.emit('whatsapp:log', `Error processing message: ${err.message}`);
    }
  });

  // Handle errors specifically
  client.on('error', (err) => {
    logger.error('❌ WhatsApp Client Error:', err);
    socketService.emit('whatsapp:log', `❌ Client Error: ${err.message}`);

    if (err.message.includes('Target closed') || err.message.includes('Protocol error')) {
      connectionStatus = 'DISCONNECTED';
      socketService.emit('whatsapp:status', { status: connectionStatus });
      // Attempt to cleanup but don't re-init automatically to avoid loops
      whatsappService.destroy().catch(e => logger.error('Error destroying after crash:', e));
    }
  });
};

export const whatsappService = {
  /**
   * Get current connection status and QR code
   */
  getStatus() {
    return {
      status: connectionStatus,
      qrCode: currentQR,
    };
  },

  /**
   * Get list of chats
   */
  /**
   * Get list of chats filtered by registered clients
   */
  async getChats() {
    if (!client || connectionStatus !== 'AUTHENTICATED') {
      return [];
    }
    try {
      // 1. Get all chats from WhatsApp
      const allChats = await client.getChats();

      // 2. Get all registered users with mobile numbers
      const users = await User.findAll({
        attributes: ['mobile', 'name'],
        where: {
          role: 'client', // Assuming we only want clients
          isActive: true
        } as any // Cast to any if strict typing complains about enum string
      });

      // Create a map of normalized mobile -> User Name
      const clientMap = new Map<string, string>();
      users.forEach((user: any) => {
        // Normalize: remove non-digits, remove leading +, remove 91 if needed, but safe to store generic
        const normalized = user.mobile.replace(/\D/g, '');
        // Store both strict and loose formats if needed. 
        // WhatsApp IDs are usually "919876543210" (CountryCode+Number)
        // Our DB mobile might be "+91 98765 43210" -> "919876543210"
        clientMap.set(normalized, user.name);
        // Also handle cases without country code if DB stores local numbers (e.g. 9876543210)
        if (normalized.length === 10) {
          clientMap.set(`91${normalized}`, user.name); // Default to India 91 if missing
        }
      });

      // 3. Filter chats
      const filteredChats = allChats.filter(chat => {
        if (chat.isGroup) return false; // Ignore groups for now

        const chatNumber = chat.id.user; // The number part without @c.us
        return clientMap.has(chatNumber);
      });

      // 4. Format for frontend
      return filteredChats.map(chat => {
        const chatNumber = chat.id.user;
        const clientName = clientMap.get(chatNumber) || chat.name || chatNumber;

        return {
          id: chat.id._serialized,
          name: clientName, // Use DB name if available
          unreadCount: chat.unreadCount,
          lastMessage: chat.lastMessage ? {
            body: chat.lastMessage.body,
            timestamp: chat.lastMessage.timestamp
          } : null
        };
      });

    } catch (error) {
      logger.error('Failed to get chats:', error);
      return [];
    }
  },

  /**
   * Initialize WhatsApp Client
   */
  initialize(): void {
    if (client) {
      logger.warn('WhatsApp Client already initialized, skipping re-initialization.');
      return;
    }

    logger.info('Initializing WhatsApp Client...');
    connectionStatus = 'INITIALIZING';
    socketService.emit('whatsapp:status', { status: 'INITIALIZING' });
    socketService.emit('whatsapp:log', 'System initializing...');

    const init = async () => {
      try {
        const pkg: any = await import('whatsapp-web.js');
        const Client = pkg.Client || pkg.default?.Client;
        const LocalAuth = pkg.LocalAuth || pkg.default?.LocalAuth;
        const MM = pkg.MessageMedia || pkg.default?.MessageMedia;

        if (!Client || !LocalAuth) {
          throw new Error('Failed to extract Client or LocalAuth from whatsapp-web.js');
        }

        MessageMedia = MM;
        const newClient = new Client({
          restartOnAuthFail: true,
          authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
          puppeteer: {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu'
            ]
          }
        });

        client = newClient;
        setupClientEvents();

        // Use a safer initialization with catch
        await newClient.initialize().catch((err: any) => {
          logger.error('❌ Failed to initialize client instance:', err);
          connectionStatus = 'DISCONNECTED';
          socketService.emit('whatsapp:status', { status: connectionStatus });
          client = undefined;
        });
      } catch (err: any) {
        logger.error('❌ Error during WhatsApp initialization process:', err);
        connectionStatus = 'DISCONNECTED';
        socketService.emit('whatsapp:status', { status: connectionStatus });
        client = undefined;
      }
    };

    init();
  },

  /**
   * Destroy WhatsApp Client
   */
  async destroy(): Promise<void> {
    if (client) {
      logger.info('Destroying WhatsApp Client...');
      await client.destroy();
      client = undefined;
      logger.info('WhatsApp Client destroyed');
    }
  },

  /**
   * Send a WhatsApp message
   */
  async sendMessage(to: string, body: string): Promise<void> {
    if (!client) {
      const errorMsg = 'WhatsApp client not initialized';
      logger.warn(errorMsg);
      socketService.emit('whatsapp:log', `⚠️ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    try {
      // Ensure 'to' is successfully formatted for whatsapp-web.js
      let chatId = to;
      if (!chatId.includes('@')) {
        chatId = `${to.replace(/\D/g, '')}@c.us`;
      }

      await client.sendMessage(chatId, body);
      logger.info(`WhatsApp message sent to ${chatId}`);

      // Emit socket events for live feedback
      socketService.emit('whatsapp:log', `Admin sent message to ${chatId}`);
      socketService.emit('whatsapp:message', {
        from: 'You (Admin)',
        body: body,
        timestamp: Math.floor(Date.now() / 1000)
      });

    } catch (error: any) {
      logger.error(`Failed to send WhatsApp message: ${error.message}`);
      socketService.emit('whatsapp:log', `❌ Failed to send message: ${error.message}`);
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

    let message = msg.body?.trim().toLowerCase() || '';

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

    // ========== HANDLE FILE/MEDIA UPLOADS ==========
    if (msg.hasMedia && (session.state === 'AUTHENTICATED' || session.state === 'UPLOADING_CHECKLIST')) {
      return await this.handleFileUpload(mobile, msg, session);
    }

    let response: any;

    switch (session.state) {
      case 'INITIAL':
        response = await this.handleInitialState(mobile, message, session);
        break;

      case 'AWAITING_OTP':
        response = await this.handleOTPState(mobile, msg.body, session);
        break;

      case 'AWAITING_CLIENT_SELECTION':
        response = await this.handleClientSelection(mobile, message, session);
        break;

      case 'AUTHENTICATED':
        response = await this.handleAuthenticatedState(mobile, message, session);
        break;

      case 'EXPLORING_FOLDER':
        response = await this.handleFolderExploration(mobile, message, session);
        break;

      case 'UPLOADING_CHECKLIST':
        response = await this.handleChecklistUploadState(mobile, message, session);
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
      // Check if users exist via UserRepository - now find ALL users with this mobile
      const formattedMobile = mobile.startsWith('91') ? `+${mobile}` : mobile;
      const users = await userRepository.findAllByMobile(formattedMobile);

      if (users.length === 0) {
        return `❌ *Access Denied*\n\nYour mobile number (${mobile}) is not registered with AccuDocs.\n\nPlease contact your accountant to get registered.`;
      }

      // Get all clients for these users
      const userIds = users.map(u => u.id);
      const clients = await clientRepository.findAllByUserIds(userIds);

      if (clients.length === 0) {
        return `❌ *Access Denied*\n\nNo client accounts found for your mobile number.\n\nPlease contact your accountant.`;
      }

      // If only one client, authenticate directly
      if (clients.length === 1) {
        const client = clients[0];
        await this.updateSession(mobile, {
          state: 'AUTHENTICATED',
          clientId: client.id,
          clientCode: client.code,
        });

        return await this.showMainMenu(mobile, {
          state: 'AUTHENTICATED',
          clientId: client.id,
          clientCode: client.code,
          lastActivity: Date.now()
        });
      }

      // Multiple clients found - show selection menu
      const matchingClients: MatchingClient[] = clients.map(c => ({
        id: c.id,
        code: c.code,
        name: (c as any).user?.name || c.code
      }));

      await this.updateSession(mobile, {
        state: 'AWAITING_CLIENT_SELECTION',
        matchingClients: matchingClients
      });

      return this.showClientSelectionMenu(matchingClients);
    }

    return this.sendWelcomeMessage();
  },

  /**
   * Show client selection menu when multiple clients have the same number
   */
  showClientSelectionMenu(clients: MatchingClient[]): string {
    let menuText = `┏━━━━━━━━━━━━━━━━━━━━━┓\n`;
    menuText += `┃  👥 *SELECT CLIENT*     \n`;
    menuText += `┃  _Multiple accounts found_\n`;
    menuText += `┗━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
    menuText += `We found multiple accounts linked to your number.\n`;
    menuText += `Please select which account you want to access:\n\n`;
    menuText += `┌──────────────────────┐\n`;

    clients.forEach((client, index) => {
      menuText += `│  *${index + 1}* ▸ 👤 ${client.name}\n`;
      menuText += `│       _(Code: ${client.code})_\n`;
    });

    menuText += `└──────────────────────┘\n\n`;
    menuText += `_Reply with a number (1-${clients.length}) to select_`;

    return menuText;
  },

  /**
   * Handle client selection when multiple clients have the same number
   */
  async handleClientSelection(mobile: string, message: string, session: WhatsAppSession): Promise<any> {
    const matchingClients = session.matchingClients || [];

    if (matchingClients.length === 0) {
      // No clients in session, restart
      await this.clearSession(mobile);
      return this.sendWelcomeMessage();
    }

    // Handle "back" or restart
    if (message === 'back' || message === 'restart' || message === 'hi') {
      await this.clearSession(mobile);
      return this.sendWelcomeMessage();
    }

    // Handle client selection by ID (e.g., client_uuid)
    if (message.startsWith('client_')) {
      const clientId = message.replace('client_', '');
      const selectedClient = matchingClients.find(c => c.id === clientId);
      if (selectedClient) {
        await this.updateSession(mobile, {
          state: 'AUTHENTICATED',
          clientId: selectedClient.id,
          clientCode: selectedClient.code,
          matchingClients: undefined
        });

        return await this.showMainMenu(mobile, {
          state: 'AUTHENTICATED',
          clientId: selectedClient.id,
          clientCode: selectedClient.code,
          lastActivity: Date.now()
        });
      }
    }

    // Handle numeric selection
    const selection = parseInt(message, 10);
    if (!isNaN(selection) && selection >= 1 && selection <= matchingClients.length) {
      const selectedClient = matchingClients[selection - 1];

      await this.updateSession(mobile, {
        state: 'AUTHENTICATED',
        clientId: selectedClient.id,
        clientCode: selectedClient.code,
        matchingClients: undefined
      });

      return await this.showMainMenu(mobile, {
        state: 'AUTHENTICATED',
        clientId: selectedClient.id,
        clientCode: selectedClient.code,
        lastActivity: Date.now()
      });
    }

    // Invalid selection
    return `⚠️ Invalid selection. Please enter a number between 1 and ${matchingClients.length}.\n\n` +
      this.showClientSelectionMenu(matchingClients);
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

    // New: Upload documents to checklist
    if (message === 'upload' || message === 'u' || message === '2' || message === 'upload_docs') {
      return await this.showChecklistsForUpload(mobile, session);
    }

    if (message === 'logout' || message === 'exit' || message === '0' || message === 'logout_btn') {
      await this.clearSession(mobile);
      return `👋 *Goodbye!*\n\nYou have been logged out.\n\nSend "Hi" to start a new session.`;
    }

    return await this.showMainMenu(mobile, session);
  },

  /**
   * Show active checklists for upload
   */
  async showChecklistsForUpload(mobile: string, session: WhatsAppSession): Promise<string> {
    try {
      const { checklistRepository } = await import('../repositories');
      const checklists = await checklistRepository.findByClientId(session.clientId!);

      // Filter to active checklists with pending items
      const activeChecklists = checklists.filter((c: any) =>
        c.status === 'active' && c.items?.some((i: any) => i.status === 'pending')
      );

      if (activeChecklists.length === 0) {
        return `✅ *No Pending Checklists*\n\nAll your document checklists are complete!\n\nType *menu* to go back.`;
      }

      let menuText = `┌─────────────────────┐\n`;
      menuText += `│  📋 *YOUR CHECKLISTS*\n`;
      menuText += `└─────────────────────┘\n\n`;
      menuText += `Select a checklist to upload documents:\n\n`;

      activeChecklists.forEach((checklist: any, index: number) => {
        const pending = checklist.items?.filter((i: any) => i.status === 'pending').length || 0;
        const total = checklist.items?.length || 0;
        menuText += `  *${index + 1}* ▸ 📋 ${checklist.name}\n`;
        menuText += `       _(${pending}/${total} pending)_\n`;
      });

      menuText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      menuText += `  *M* ◂ Main Menu\n`;
      menuText += `━━━━━━━━━━━━━━━━━━━━\n`;
      menuText += `_Reply with a number to select_`;

      // Store checklist IDs for selection
      await this.updateSession(mobile, {
        state: 'UPLOADING_CHECKLIST',
        activeChecklistId: undefined,
        matchingClients: activeChecklists.map((c: any) => ({
          id: c.id,
          code: c.name,
          name: c.financialYear,
        })),
      });

      return menuText;
    } catch (err: any) {
      logger.error('Error listing checklists for upload:', err);
      return `❌ Error loading checklists. Type *menu* to go back.`;
    }
  },

  /**
   * Handle checklist upload state
   */
  async handleChecklistUploadState(mobile: string, message: string, session: WhatsAppSession): Promise<any> {
    if (message === 'menu' || message === 'm' || message === 'main_menu') {
      await this.updateSession(mobile, { state: 'AUTHENTICATED', activeChecklistId: undefined });
      return await this.showMainMenu(mobile, session);
    }

    if (message === 'back' || message === 'b') {
      if (session.activeChecklistId) {
        // Go back to checklist list
        return await this.showChecklistsForUpload(mobile, session);
      }
      await this.updateSession(mobile, { state: 'AUTHENTICATED' });
      return await this.showMainMenu(mobile, session);
    }

    // If no active checklist selected yet, handle selection
    if (!session.activeChecklistId) {
      const storedChecklists = session.matchingClients || [];
      const selection = parseInt(message, 10);

      if (!isNaN(selection) && selection >= 1 && selection <= storedChecklists.length) {
        const selected = storedChecklists[selection - 1];
        await this.updateSession(mobile, { activeChecklistId: selected.id });
        return await this.showPendingItems(mobile, selected.id);
      }

      return `⚠️ Invalid selection. Enter a number or type *menu*.`;
    }

    // If done uploading
    if (message === 'done' || message === 'd') {
      await this.updateSession(mobile, { state: 'AUTHENTICATED', activeChecklistId: undefined });
      return `✅ *Upload session ended.*\n\nType *menu* to return to main menu.`;
    }

    return `📎 *Send a document/photo now.*\n\nI'll automatically save it to your checklist.\n\nType *done* when finished, or *back* to go back.`;
  },

  /**
   * Show pending items for a checklist
   */
  async showPendingItems(mobile: string, checklistId: string): Promise<string> {
    try {
      const { checklistRepository } = await import('../repositories');
      const checklist = await checklistRepository.findById(checklistId);
      if (!checklist) return `❌ Checklist not found.`;

      const items: any[] = (checklist as any).items || [];
      const pendingItems = items.filter((i: any) => i.status === 'pending');
      const uploadedItems = items.filter((i: any) => i.status === 'uploaded' || i.status === 'verified');

      let menuText = `┌─────────────────────┐\n`;
      menuText += `│  📋 *${(checklist as any).name}*\n`;
      menuText += `│  Progress: ${uploadedItems.length}/${items.length} ✅\n`;
      menuText += `└─────────────────────┘\n\n`;

      if (pendingItems.length > 0) {
        menuText += `📌 *Still needed:*\n`;
        pendingItems.forEach((item: any, i: number) => {
          menuText += `  ${i + 1}. ⏳ ${item.label}\n`;
        });
      }

      if (uploadedItems.length > 0) {
        menuText += `\n✅ *Already received:*\n`;
        uploadedItems.forEach((item: any) => {
          menuText += `  ✓ ${item.label}\n`;
        });
      }

      menuText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      menuText += `📎 *Send your documents now!*\n`;
      menuText += `I'll match them to the next pending item.\n\n`;
      menuText += `Type *done* when finished.\n`;
      menuText += `Type *back* to choose another checklist.\n`;
      menuText += `━━━━━━━━━━━━━━━━━━━━`;

      return menuText;
    } catch (err: any) {
      logger.error('Error showing pending items:', err);
      return `❌ Error loading checklist items. Type *menu*.`;
    }
  },

  /**
   * Handle file upload from WhatsApp
   */
  async handleFileUpload(mobile: string, msg: any, session: WhatsAppSession): Promise<string> {
    try {
      if (!session.clientId) {
        return `❌ Please authenticate first. Send *Hi* to start.`;
      }

      // Download the media
      const media = await msg.downloadMedia();
      if (!media) {
        return `❌ Could not download the file. Please try again.`;
      }

      const buffer = Buffer.from(media.data, 'base64');
      const mimetype = media.mimetype || 'application/octet-stream';
      const originalName = msg.body || media.filename || `document_${Date.now()}`;
      const ext = mimetype.split('/')[1]?.split(';')[0] || 'bin';
      const fileName = originalName.includes('.') ? originalName : `${originalName}.${ext}`;

      // Find active checklist
      let checklistId = session.activeChecklistId;

      if (!checklistId) {
        // Auto-detect: find the first active checklist for this client
        const { checklistRepository } = await import('../repositories');
        const checklists = await checklistRepository.findByClientId(session.clientId);
        const active = checklists.find((c: any) =>
          c.status === 'active' && c.items?.some((i: any) => i.status === 'pending')
        );

        if (!active) {
          return `📎 Received your file, but you have no pending checklists.\n\nYour accountant will be notified. Type *menu* to continue.`;
        }
        checklistId = active.id;
      }

      // Use the upload service
      const { uploadService } = await import('./upload.service');
      const result = await uploadService.uploadViaWhatsApp(
        session.clientId,
        checklistId,
        { originalname: fileName, buffer, mimetype, size: buffer.length },
      );

      if (!result) {
        return `📎 Received your file, but all checklist items are already uploaded!\n\nType *done* or *menu*.`;
      }

      // Show updated progress
      const progressMsg = await this.showPendingItems(mobile, checklistId);

      return `✅ *Received: ${fileName}*\n` +
        `Saved as: *${result.fileName}*\n\n` +
        progressMsg;

    } catch (err: any) {
      logger.error('Error handling WhatsApp file upload:', err);
      return `❌ Error saving your document: ${err.message}\n\nPlease try again or contact your accountant.`;
    }
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
      if (!client) throw new Error('Client not initialized');
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
      `│  *2* ▸ 📤 Upload Documents\n` +
      `│  *0* ▸ 🚪 Logout\n` +
      `└──────────────────────┘\n\n` +
      `_Reply *1*, *2*, or *0* to continue_`;
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

  /**
   * Logout and destroy the client, then re-initialize
   */
  async logout() {
    if (client) {
      try {
        await client.logout();
      } catch (err) {
        logger.warn('Client logout failed, forcing destroy:', err);
        try { await client.destroy(); } catch (e) { logger.error('Destroy failed', e); }
      }
      client = undefined;
    }

    // Force delete auth folder to ensure fresh QR
    try {
      const authPath = path.join(process.cwd(), '.wwebjs_auth');
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        logger.info('Deleted .wwebjs_auth directory');
      }
    } catch (err) {
      logger.error('Failed to delete auth directory:', err);
    }

    connectionStatus = 'DISCONNECTED';
    currentQR = null;
    socketService.emit('whatsapp:status', { status: 'DISCONNECTED' });
    socketService.emit('whatsapp:log', 'Disconnected manually. Re-initializing...');
    logger.info('WhatsApp Client logged out manually. Re-initializing...');
    // Re-initialize to get a new QR code
    this.initialize();
  },
};

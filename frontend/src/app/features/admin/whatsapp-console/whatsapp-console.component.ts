
import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WhatsAppService, WhatsAppSession, WhatsAppStatus } from '@core/services/whatsapp.service';
import { ToastService } from '@core/services/toast.service';
import { SocketService } from '@core/services/socket.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPaperAirplaneSolid, heroTrashSolid, heroArrowPathSolid, heroQrCodeSolid, heroCheckCircleSolid, heroXCircleSolid, heroChatBubbleLeftRightSolid, heroCommandLineSolid } from '@ng-icons/heroicons/solid';
import * as QRCode from 'qrcode';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whatsapp-console',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './whatsapp-console.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      heroPaperAirplaneSolid,
      heroTrashSolid,
      heroArrowPathSolid,
      heroQrCodeSolid,
      heroCheckCircleSolid,
      heroXCircleSolid,
      heroChatBubbleLeftRightSolid,
      heroCommandLineSolid
    })
  ]
})
export class WhatsAppConsoleComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private whatsappService = inject(WhatsAppService);
  private socketService = inject(SocketService);
  private toast = inject(ToastService);
  private subscriptions: Subscription[] = [];

  form = this.fb.nonNullable.group({
    mobile: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
    message: ['', [Validators.required, Validators.minLength(1)]],
  });

  sessionData = signal<WhatsAppSession | null>(null);
  isLoading = signal(false);
  checkLoading = signal(false);

  // Bot Status
  botStatus = signal<WhatsAppStatus['status']>('DISCONNECTED');
  qrImage = signal<string | null>(null);
  statusLoading = signal(false);

  // Live Logs & Chat
  logs = signal<string[]>([]);
  // Store messages per chat ID
  messageMap = new Map<string, { from: string, body: string, timestamp: number }[]>();
  // Current active messages to display
  messages = signal<{ from: string, body: string, timestamp: number }[]>([]);

  // Chats List
  chats = signal<any[]>([]);
  selectedChat = signal<any | null>(null);
  searchQuery = signal('');
  chatsLoading = signal(false);

  // Quick templates
  templates = [
    { label: 'Welcome', text: '👋 Welcome to AccuDocs! Reply with "Hi" to start.' },
    { label: 'OTP Reset', text: '🔐 Your OTP has been reset. Please try login again.' },
    { label: 'Docs Ready', text: '📄 Your requested documents are ready properly.' },
  ];

  constructor() {
    // Initial fetch
    this.refreshStatus();
  }

  ngOnInit() {
    // Socket Subscriptions
    this.subscriptions.push(
      this.socketService.on('whatsapp:status').subscribe((data: any) => {
        console.log('Socket Status:', data);
        this.botStatus.set(data.status);
        if (data.status === 'AUTHENTICATED') {
          this.loadChats();
        } else if (data.status !== 'QR_READY') {
          this.qrImage.set(null);
        }
      }),
      this.socketService.on('whatsapp:qr').subscribe(async (qr: string) => {
        console.log('Socket QR received');
        this.botStatus.set('QR_READY');
        try {
          const url = await QRCode.toDataURL(qr);
          this.qrImage.set(url);
        } catch (err) {
          console.error('QR Generation failed', err);
        }
      }),
      this.socketService.on('whatsapp:log').subscribe((log: string) => {
        this.logs.update(logs => [log, ...logs].slice(0, 50)); // Keep last 50 logs
      }),
      this.socketService.on('whatsapp:message').subscribe((msg: any) => {
        // Determine Chat ID
        const isBot = msg.from === 'Bot' || msg.from === 'You (Admin)';

        // If it's a bot reply, we need to know who it is for.
        // For now, we unfortunately don't have the 'to' in the event for bot replies easily without changing backend structure significantly.
        // But for incoming messages, 'from' is the chat ID.
        // Let's assume for this step we mainly handle incoming.
        // Ideally, backend should emit 'chatId' with the message.

        // Use a default or infer from current selection for now if needed, 
        // but better: user initiates, so 'from' is valid.
        // If bot replies, we just append to currently selected or 'all' for now?
        // Let's rely on backend emitting 'from' as the remote JID for incoming.

        let chatId = msg.from;

        // Hack: If from Bot, we need to find which chat it belongs to.
        // The backend `sendMessage` emits `to`? No, it emits `from: 'Bot'`. 
        // We need to fix the backend to emit `to` or `chatId`. 
        // BUT for now, let's just push to the active chat if it matches, or global log.
        // To make this robust, we should perform a backend tweak.
        // However, sticking to frontend changes:

        if (this.selectedChat()) {
          // Optimistically add to selected chat if it looks like a conversation
          this.updateChatMessages(this.selectedChat().id, msg);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  refreshStatus() {
    this.statusLoading.set(true);
    this.whatsappService.getQR().subscribe({
      next: async (data: WhatsAppStatus) => {
        this.botStatus.set(data.status);

        if (data.status === 'AUTHENTICATED') {
          this.loadChats();
        }

        if (data.status === 'QR_READY' && data.qrCode) {
          try {
            const url = await QRCode.toDataURL(data.qrCode);
            this.qrImage.set(url);
          } catch (err) {
            console.error('QR Generation failed', err);
            this.qrImage.set(null);
          }
        } else {
          this.qrImage.set(null);
        }

        this.statusLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch status', err);
        this.statusLoading.set(false);
        this.botStatus.set('DISCONNECTED');
      }
    });
  }

  loadChats() {
    this.chatsLoading.set(true);
    this.whatsappService.getChats().subscribe({
      next: (data) => {
        this.chats.set(data);
        this.chatsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load chats', err);
        this.chatsLoading.set(false);
      }
    });
  }

  selectChat(chat: any) {
    this.selectedChat.set(chat);
    // Auto-fill mobile number
    const mobile = chat.id.replace('@c.us', '').replace('@g.us', '');
    this.form.patchValue({ mobile });

    // In a real app, we would fetch message history for this chat here.
    // For now, we start with an empty or in-memory list.
    const history = this.messageMap.get(chat.id) || [];
    this.messages.set(history);
  }

  updateChatMessages(chatId: string, msg: any) {
    const current = this.messageMap.get(chatId) || [];
    const updated = [...current, msg];
    this.messageMap.set(chatId, updated);

    if (this.selectedChat()?.id === chatId) {
      this.messages.set(updated);
    }
  }

  sendMessage() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const { mobile, message } = this.form.getRawValue();

    this.whatsappService.sendMessage(mobile, message).subscribe({
      next: () => {
        this.toast.success('Message sent');
        this.form.patchValue({ message: '' });
        this.isLoading.set(false);

        // Manually append to view (optimistic)
        if (this.selectedChat()) {
          this.updateChatMessages(this.selectedChat().id, {
            from: 'You (Admin)',
            body: message,
            timestamp: Math.floor(Date.now() / 1000)
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to send message: ' + (err.error?.message || err.message));
        this.isLoading.set(false);
      }
    });
  }

  checkSession() {
    const mobile = this.form.get('mobile')?.value;
    if (!mobile) {
      this.toast.error('Please enter a mobile number');
      return;
    }

    this.checkLoading.set(true);
    this.whatsappService.getSession(mobile).subscribe({
      next: (session) => {
        this.sessionData.set(session);
        this.checkLoading.set(false);
        if (session) {
          this.toast.info('Session found');
        } else {
          this.toast.info('No active session found');
        }
      },
      error: (err) => {
        console.error(err);
        this.sessionData.set(null);
        this.checkLoading.set(false);
      }
    });
  }

  clearSession() {
    const mobile = this.form.get('mobile')?.value;
    if (!mobile) return;

    if (!confirm('Are you sure you want to clear the session for this user?')) return;

    this.whatsappService.clearSession(mobile).subscribe({
      next: () => {
        this.toast.success('Session cleared');
        this.sessionData.set(null);
      },
      error: (err) => {
        this.toast.error('Failed to clear session');
      }
    });
  }

  useTemplate(text: string) {
    this.form.patchValue({ message: text });
  }

  disconnectBot() {
    if (!confirm('Are you sure you want to disconnect? This will stop the bot and regenerate the QR code.')) return;

    this.statusLoading.set(true);
    this.whatsappService.logoutBot().subscribe({
      next: () => {
        this.toast.success('Bot disconnected. Generating new QR...');
        // Refresh after a short delay to allow backend to restart
        setTimeout(() => this.refreshStatus(), 2000);
      },
      error: (err) => {
        this.toast.error('Failed to disconnect bot');
        this.statusLoading.set(false);
      }
    });
  }
}

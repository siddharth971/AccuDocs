import { checklistRepository, clientRepository } from '../repositories';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { Checklist, Client, User } from '../models';

/**
 * Reminder Service
 * Sends automated WhatsApp reminders for pending checklist items.
 *
 * Schedule logic:
 *  - 7 days before due date: first reminder
 *  - 3 days before due date: second reminder
 *  - On due date: urgency reminder
 *  - 3 days after due date: overdue reminder
 *  - Weekly after that: recurring overdue
 */

export interface ReminderCandidate {
  checklist: any;
  client: any;
  pendingItems: any[];
  daysUntilDue: number;
}

export const reminderService = {

  /**
   * Run the reminder check (called by cron or manually)
   */
  async runReminderCheck(): Promise<{ sent: number; errors: number; skipped: number }> {
    logger.info('🔔 Starting reminder check...');

    let sent = 0;
    let errors = 0;
    let skipped = 0;

    try {
      // 1. Get all active checklists with pending items
      const { checklists } = await checklistRepository.findAll(
        { status: 'active' },
        { page: 1, limit: 1000, sortBy: 'dueDate', sortOrder: 'asc' }
      );

      const now = new Date();
      const candidates: ReminderCandidate[] = [];

      for (const checklist of checklists) {
        const c = checklist as any;

        // Must have due date and pending items
        if (!c.dueDate) {
          skipped++;
          continue;
        }

        const pendingItems = (c.items || []).filter((i: any) => i.status === 'pending');
        if (pendingItems.length === 0) {
          skipped++;
          continue;
        }

        const dueDate = new Date(c.dueDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // Check if we should send a reminder today
        const shouldRemind = this.shouldSendReminder(daysUntilDue);
        if (!shouldRemind) {
          skipped++;
          continue;
        }

        candidates.push({
          checklist: c,
          client: c.client,
          pendingItems,
          daysUntilDue,
        });
      }

      logger.info(`Found ${candidates.length} checklists needing reminders`);

      // 2. Send reminders in batches
      const BATCH_SIZE = 5;
      for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        const batch = candidates.slice(i, i + BATCH_SIZE);

        for (const candidate of batch) {
          try {
            await this.sendReminder(candidate);
            sent++;
          } catch (err: any) {
            logger.error(`Failed to send reminder for checklist ${candidate.checklist.id}: ${err.message}`);
            errors++;
          }
        }

        // Delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < candidates.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (err: any) {
      logger.error('Reminder check failed:', err);
      errors++;
    }

    logger.info(`🔔 Reminder check complete: ${sent} sent, ${errors} errors, ${skipped} skipped`);
    return { sent, errors, skipped };
  },

  /**
   * Determine if a reminder should be sent based on days until due
   */
  shouldSendReminder(daysUntilDue: number): boolean {
    // 7 days before
    if (daysUntilDue === 7) return true;
    // 3 days before
    if (daysUntilDue === 3) return true;
    // Day of
    if (daysUntilDue === 0) return true;
    // 3 days after (overdue)
    if (daysUntilDue === -3) return true;
    // Weekly after (7, 14, 21... days overdue)
    if (daysUntilDue < -3 && daysUntilDue % 7 === 0) return true;

    return false;
  },

  /**
   * Send a reminder to a client
   */
  async sendReminder(candidate: ReminderCandidate): Promise<void> {
    const { checklist, client, pendingItems, daysUntilDue } = candidate;

    // Get client mobile
    const mobile = client?.user?.mobile;
    if (!mobile) {
      logger.warn(`No mobile number for client ${client?.id || 'unknown'}`);
      return;
    }

    // Build message
    const message = this.buildReminderMessage(checklist, client, pendingItems, daysUntilDue);

    // Send via WhatsApp
    try {
      const { whatsappService } = await import('./whatsapp.service');
      await whatsappService.sendMessage(mobile, message);
      logger.info(`📱 Reminder sent to ${client.user?.name || mobile} for "${checklist.name}"`);
    } catch (err: any) {
      logger.error(`Failed to send WhatsApp reminder to ${mobile}: ${err.message}`);
      throw err;
    }
  },

  /**
   * Build the reminder message
   */
  buildReminderMessage(
    checklist: any,
    client: any,
    pendingItems: any[],
    daysUntilDue: number
  ): string {
    const clientName = client?.user?.name || 'Client';
    const dueDate = checklist.dueDate
      ? new Date(checklist.dueDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : 'N/A';

    let urgency: string;
    let emoji: string;

    if (daysUntilDue > 3) {
      urgency = 'Friendly Reminder';
      emoji = '📋';
    } else if (daysUntilDue > 0) {
      urgency = 'Urgent Reminder';
      emoji = '⚠️';
    } else if (daysUntilDue === 0) {
      urgency = 'Due Today!';
      emoji = '🚨';
    } else {
      urgency = `Overdue by ${Math.abs(daysUntilDue)} days`;
      emoji = '🔴';
    }

    let message = `${emoji} *${urgency}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Hello *${clientName}*,\n\n`;
    message += `📋 *${checklist.name}*\n`;
    message += `📅 Due: *${dueDate}*\n\n`;
    message += `You still have *${pendingItems.length}* pending document(s):\n\n`;

    pendingItems.forEach((item: any, index: number) => {
      message += `  ${index + 1}. ⏳ ${item.label}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;

    if (daysUntilDue > 0) {
      message += `Please upload these documents before *${dueDate}*.\n\n`;
    } else {
      message += `⚠️ These documents are overdue. Please submit ASAP.\n\n`;
    }

    message += `💡 Send *Hi* and select *Upload Documents* to submit.\n\n`;
    message += `Thank you! 🙏\n`;
    message += `_AccuDocs_`;

    return message;
  },
};

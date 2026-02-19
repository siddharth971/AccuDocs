import * as cron from 'node-cron';
import { reminderService } from '../services/reminder.service';
import { logger } from '../utils/logger';

/**
 * Scheduler setup for automated tasks
 * Runs as part of the main server process (no separate worker needed)
 */

let reminderCronJob: cron.ScheduledTask | null = null;

export const scheduler = {
  /**
   * Initialize all scheduled jobs
   */
  start(): void {
    logger.info('⏰ Starting scheduler...');

    // Daily reminder check at 9:00 AM IST
    // Cron format: minute hour day month weekday
    reminderCronJob = cron.schedule('0 9 * * *', async () => {
      logger.info('⏰ Running daily reminder check...');
      try {
        const result = await reminderService.runReminderCheck();
        logger.info(`⏰ Daily reminders: ${result.sent} sent, ${result.errors} errors, ${result.skipped} skipped`);
      } catch (err: any) {
        logger.error('⏰ Daily reminder cron failed:', err);
      }
    }, {
      timezone: 'Asia/Kolkata',
    });

    logger.info('⏰ Scheduler started. Reminders will run daily at 9:00 AM IST.');
  },

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    if (reminderCronJob) {
      reminderCronJob.stop();
      reminderCronJob = null;
    }
    logger.info('⏰ Scheduler stopped.');
  },

  /**
   * Manually trigger a reminder check (for admin use)
   */
  async triggerReminders(): Promise<{ sent: number; errors: number; skipped: number }> {
    logger.info('⏰ Manual reminder trigger...');
    return await reminderService.runReminderCheck();
  },
};

import cron from 'node-cron';
import { logger } from '../utils/logger';
import { invoiceStateMachineService } from './invoice-state-machine.service';
import { recurringBillingService } from './recurring-billing.service';
import { intelligenceService } from './intelligence.service';
import { Organization, Invoice, AdvancePayment, CreditNote, Client } from '../models';
import { Op } from 'sequelize';
import { whatsappService } from './whatsapp.service';

export const cronService = {
  startAllJobs() {
    logger.info('Starting all background cron jobs...');

    // 1. Generate Recurring Invoices - Daily 00:00
    cron.schedule('0 0 * * *', async () => {
      logger.info('CRON: Generating recurring invoices');
      try {
        await recurringBillingService.generateRecurringInvoices();
      } catch (e) {
        logger.error('CRON failed: generate_recurring_invoices', e);
      }
    });

    // 2. Check Overdue Invoices - Daily 06:00
    cron.schedule('0 6 * * *', async () => {
      logger.info('CRON: Checking overdue invoices');
      try {
        await invoiceStateMachineService.processOverdueInvoices();
      } catch (e) {
        logger.error('CRON failed: check_overdue_invoices', e);
      }
    });

    // 3. Send Due Reminders (Today + 1) - Daily 09:00
    cron.schedule('0 9 * * *', async () => {
      logger.info('CRON: Sending due reminders');
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);

        const dueInvoices = await Invoice.findAll({
          where: {
            dueDate: { [Op.between]: [tomorrow, endOfTomorrow] },
            status: { [Op.in]: ['ISSUED', 'PARTIALLY_PAID'] },
            outstandingAmount: { [Op.gt]: 0 }
          },
          include: ['client', 'organization']
        });

        for (const inv of dueInvoices) {
          await whatsappService.sendOverdueReminder(inv, inv.organization as any, 1);
        }
      } catch (e) {
        logger.error('CRON failed: send_due_reminders', e);
      }
    });

    // 4. Send Overdue Reminders (Today - 1, Today - 7) - Daily 10:00
    cron.schedule('0 10 * * *', async () => {
      logger.info('CRON: Sending overdue reminders');
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minus1 = new Date(today);
        minus1.setDate(minus1.getDate() - 1);

        const minus7 = new Date(today);
        minus7.setDate(minus7.getDate() - 7);

        const getInvoices = async (dateObj: Date) => {
          const start = new Date(dateObj);
          const end = new Date(dateObj);
          end.setHours(23, 59, 59, 999);
          return Invoice.findAll({
            where: {
              dueDate: { [Op.between]: [start, end] },
              status: 'OVERDUE',
              outstandingAmount: { [Op.gt]: 0 }
            },
            include: ['client', 'organization']
          });
        };

        const invoices1d = await getInvoices(minus1);
        for (const inv of invoices1d) {
          await whatsappService.sendOverdueReminder(inv, inv.organization as any, 1);
        }

        const invoices7d = await getInvoices(minus7);
        for (const inv of invoices7d) {
          await whatsappService.sendOverdueReminder(inv, inv.organization as any, 7);
        }
      } catch (e) {
        logger.error('CRON failed: send_overdue_reminders', e);
      }
    });

    // 5. Lock Paid Invoices (>48h) - Every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('CRON: Locking paid invoices');
      try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

        await Invoice.update(
          { isLocked: true },
          {
            where: {
              status: 'FULLY_PAID',
              isLocked: false,
              lastPaymentDate: { [Op.lte]: twoDaysAgo }
            }
          }
        );
      } catch (e) {
        logger.error('CRON failed: lock_paid_invoices', e);
      }
    });

    // 6. Check Advance Expiry - Daily 08:00
    cron.schedule('0 8 * * *', async () => {
      logger.info('CRON: Checking advance expiry');
      try {
        const today = new Date();
        await AdvancePayment.update(
          { status: 'EXPIRED' },
          {
            where: {
              status: 'UNALLOCATED',
              expiryDate: { [Op.lte]: today }
            }
          }
        );
      } catch (e) {
        logger.error('CRON failed: check_advance_expiry', e);
      }
    });

    // 7. Check Predictive Alerts - Daily 07:00
    cron.schedule('0 7 * * *', async () => {
      logger.info('CRON: Checking predictive alerts');
      try {
        const orgs = await Organization.findAll();
        for (const org of orgs) {
          await intelligenceService.checkPredictiveAlerts(org.id);
        }
      } catch (e) {
        logger.error('CRON failed: check_predictive_alerts', e);
      }
    });

    // 8. Update Client Risk Scores - Weekly Mon 09:00
    cron.schedule('0 9 * * 1', async () => {
      logger.info('CRON: Updating client risk scores');
      try {
        const clients = await Client.findAll({ where: { status: 'active' } });
        for (const client of clients) {
          if (client.organizationId) {
            await intelligenceService.calculateRiskScore(client.id, client.organizationId);
          }
        }
      } catch (e) {
        logger.error('CRON failed: update_client_risk_scores', e);
      }
    });
  }
};

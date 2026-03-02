import { NotificationTemplate, NotificationJob, InAppNotification, Organization, Invoice, Client } from '../models';
import { logger } from '../utils/logger';
import { whatsappService } from './whatsapp.service';
import { User } from '../models/user.model';

export const notificationDispatcher = {
  /**
   * Dispatch a notification event
   */
  async dispatch(event: {
    type: string;
    organizationId: string;
    entityType: string;
    entityId: string;
    client?: Client;
    invoice?: Invoice;
    organization?: Organization;
    contextData: any;
  }) {
    logger.info(`Dispatching notification event: ${event.type} for entity ${event.entityId}`);

    const template = await NotificationTemplate.findOne({
      where: {
        organizationId: event.organizationId,
        notificationType: event.type,
        isEnabled: true
      }
    });

    if (!template) {
      logger.debug(`No enabled template found for ${event.type}`);
      return;
    }

    const recipients = [];

    if (event.type === 'INVOICE_ISSUED' && event.client) {
      recipients.push({
        type: 'CLIENT',
        channel: ['EMAIL', 'WHATSAPP'],
        contact: (event.client as any).email || '',
        whatsapp: event.client.whatsappNumber || ''
      });

      // Get Finance Team
      const financeUsers = await User.findAll({
        where: { organizationId: event.organizationId, role: 'org_admin' } as any
      });
      recipients.push({
        type: 'TEAM',
        channel: ['IN_APP'],
        users: financeUsers.map(u => u.id)
      });
    }

    // Process templates simple replace
    let renderedBody = template.bodyTemplate;
    if (event.invoice) {
      renderedBody = renderedBody.replace('{invoice.invoice_number}', event.invoice.invoiceNumber);
      renderedBody = renderedBody.replace('{invoice.grand_total}', Number(event.invoice.grandTotal).toString());
      renderedBody = renderedBody.replace('{invoice.due_date}', new Date(event.invoice.dueDate).toLocaleDateString());
      renderedBody = renderedBody.replace('{invoice_link}', `https://app.accudocs.in/invoices/${event.invoice.id}/download`);
    }
    if (event.client && event.client.name) {
      renderedBody = renderedBody.replace('{client.contact_person}', (event.client as any).contactPersonName || (event.client as any).contactPerson || event.client.name);
    }
    if (event.organization) {
      renderedBody = renderedBody.replace('{firm_name}', event.organization.name);
    }

    for (const recipient of recipients) {
      for (const channel of recipient.channel) {
        if (channel === 'WHATSAPP' && !recipient.whatsapp) continue;
        if (channel === 'EMAIL' && !recipient.contact) continue;

        const job = await NotificationJob.create({
          notificationEventId: event.entityId,
          recipientType: recipient.type as any,
          recipientContact: channel === 'WHATSAPP' ? recipient.whatsapp : recipient.contact,
          recipientUserIds: recipient.users || [],
          channel: channel as any,
          status: 'PENDING',
          retryCount: 0,
          maxRetries: template.retryCount,
          retryDelayMinutes: template.retryDelayMinutes
        });

        // Async execution of exact dispatch without await
        this.processJob(job, renderedBody, template.subject, event.entityType, event.entityId).catch(logger.error);
      }
    }
  },

  async processJob(job: NotificationJob, body: string, subject: string | undefined, entityType: string, entityId: string) {
    try {
      if (job.channel === 'EMAIL') {
        // Mock email
        logger.info(`MOCK: Sending email to ${job.recipientContact} subject: ${subject}`);
      } else if (job.channel === 'WHATSAPP' && job.recipientContact) {
        await whatsappService.sendMessage(job.recipientContact, body);
      } else if (job.channel === 'IN_APP' && job.recipientUserIds) {
        for (const userId of job.recipientUserIds) {
          await InAppNotification.create({
            userId,
            title: subject || 'Notification',
            message: body,
            entityType: entityType,
            entityId: entityId,
            isRead: false
          });
        }
      }

      await job.update({ status: 'SENT', sentAt: new Date() });
    } catch (e: any) {
      if (job.retryCount + 1 >= job.maxRetries) {
        await job.update({ status: 'FAILED' });
        logger.error(`Notification job failed after ${job.maxRetries} retries`, e);
      } else {
        const nextTime = new Date(Date.now() + job.retryDelayMinutes * 60000);
        await job.update({ status: 'PENDING', retryCount: job.retryCount + 1, nextRetryAt: nextTime });
      }
    }
  }
};

import { Op } from 'sequelize';
import { RecurringInvoiceTemplate, Invoice, InvoiceLineItem } from '../models';
import { taxEngineService } from './tax-engine.service';
import { logger } from '../utils/logger';

export const recurringBillingService = {
  /**
   * Calculate next recurring date based on frequency
   */
  calculateNextDate(currentDate: Date, frequency: string): Date {
    const date = new Date(currentDate);
    switch (frequency) {
      case 'MONTHLY':
        date.setDate(date.getDate() + 30);
        break;
      case 'QUARTERLY':
        date.setDate(date.getDate() + 91);
        break;
      case 'HALF_YEARLY':
        date.setDate(date.getDate() + 182);
        break;
      case 'YEARLY':
        date.setDate(date.getDate() + 365);
        break;
      default:
        date.setDate(date.getDate() + 30); // Default to monthly
    }
    return date;
  },

  /**
   * Core Engine: Generate invoices from active templates for today
   * Designed to run via a CRON job daily at 00:00 UTC
   */
  async generateRecurringInvoices(): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to local day start or UTC as preferred

    try {
      const recurringTemplates = await RecurringInvoiceTemplate.findAll({
        where: {
          isActive: true,
          nextInvoiceDate: {
            [Op.lte]: today, // Catch up if chron missed a day
          }
        },
        include: ['client', 'branch'] // To calculate state taxes reliably
      });

      logger.info(`Found ${recurringTemplates.length} recurring templates to process.`);

      for (const template of recurringTemplates) {
        // Calculate states
        const clientState = template.client?.state || 'DELHI';
        const branchState = template.branch?.state || 'DELHI';

        // Calculate GST 
        const gstResult = taxEngineService.calculateGst(
          Number(template.subtotal),
          template.gstSlab,
          clientState,
          branchState,
          template.client?.reverseChargeApplicable
        );

        // Generate FY (Simplistic implementation, replace with robust logic later)
        const currentYear = today.getFullYear();
        const startYear = today.getMonth() >= 3 ? currentYear : currentYear - 1;
        const fy = `FY${startYear}-${(startYear + 1).toString().slice(-2)}`;

        const due = new Date(today);
        due.setDate(due.getDate() + template.dueDateOffset);

        // 1. Create Draft Invoice
        const invoice = await Invoice.create({
          invoiceNumber: `REC-${template.organizationId.substring(0, 4).toUpperCase()}-${Date.now()}`, // Temporary implementation
          organizationId: template.organizationId,
          clientId: template.clientId,
          branchId: template.branchId,
          invoiceDate: today,
          dueDate: due,
          financialYear: fy,
          status: template.autoIssue ? 'ISSUED' : 'DRAFT',
          serviceCategory: template.serviceCategory,
          descriptionOfService: template.templateName,
          gstSlab: template.gstSlab,
          subtotal: Number(template.subtotal),
          ...gstResult,
          amountPaid: 0,
          outstandingAmount: gstResult.grandTotal,
          isLocked: false,
          sentAt: template.autoIssue ? new Date() : undefined,
        });

        // 2. Add Line Item
        await InvoiceLineItem.create({
          invoiceId: invoice.id,
          lineItemNumber: 1,
          description: template.templateName,
          quantity: 1,
          unitPrice: template.subtotal,
          amount: template.subtotal
        });

        // 3. Update Template State
        const nextDate = this.calculateNextDate(today, template.recurringFrequency);

        let shouldDeactivate = false;
        if (template.endDate && nextDate > template.endDate) {
          shouldDeactivate = true;
        }

        await template.update({
          nextInvoiceDate: nextDate,
          isActive: !shouldDeactivate
        });

        logger.info(`Generated recurring invoice ${invoice.id} for template ${template.id}`);
      }
    } catch (error) {
      logger.error(`Error in generateRecurringInvoices: ${(error as Error).message}`);
    }
  }
};

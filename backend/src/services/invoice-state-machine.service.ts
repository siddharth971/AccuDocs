import { Invoice, CreditNote, PaymentAllocation } from '../models';
import { taxEngineService } from './tax-engine.service';
import { paymentService } from './payment.service';
import { sequelize } from '../config/database.config';

export const invoiceStateMachineService = {
  /**
   * Issue an Invoice (State transition DRAFT -> ISSUED)
   */
  async issueInvoice(invoiceId: string): Promise<void> {
    return sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(invoiceId, { transaction: t });

      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'DRAFT') throw new Error('Invoice is not in DRAFT state');

      // Update State
      invoice.status = 'ISSUED';
      invoice.sentAt = new Date();
      await invoice.save({ transaction: t });

      // Trigger automatic allocation
      await paymentService.autoAllocateAdvanceFifo(invoice, t);
    });
  },

  /**
   * Check for Overdue Invoices
   * Cronjob runner
   */
  async processOverdueInvoices(): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const invoices = await Invoice.findAll({
      where: {
        status: ['ISSUED', 'PARTIALLY_PAID']
      }
    });

    for (const inv of invoices) {
      const due = new Date(inv.dueDate);
      if (today > due && Number(inv.outstandingAmount) > 0) {
        await inv.update({ status: 'OVERDUE' });
        // Trigger notification queue...
      }
    }
  },

  /**
   * Create a Credit Note against an invoice
   */
  async createCreditNote(invoiceId: string, amount: number, reason: string): Promise<CreditNote> {
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    if (amount > invoice.outstandingAmount) {
      throw new Error(`Credit amount ${amount} exceeds outstanding ${invoice.outstandingAmount}`);
    }

    const taxImpact = taxEngineService.calculateCreditNoteTaxImpact(invoice, amount);

    return sequelize.transaction(async (t) => {
      const creditNote = await CreditNote.create({
        creditNoteNumber: `CN-${invoice.organizationId.substring(0, 4).toUpperCase()}-${Date.now()}`,
        organizationId: invoice.organizationId,
        branchId: invoice.branchId,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        creditDate: new Date(),
        financialYear: invoice.financialYear,
        reason: reason as any,
        creditAmount: amount,
        totalTaxReduction: taxImpact.taxReduction,
        cgstReduction: taxImpact.cgstReduction,
        sgstReduction: taxImpact.sgstReduction,
        igstReduction: taxImpact.igstReduction,
        gstImpact: taxImpact.taxReduction > 0,
        isApproved: false
      }, { transaction: t });

      return creditNote;
    });
  },

  /**
   * Approve Credit Note and apply outstanding deductions
   */
  async approveCreditNote(creditNoteId: string, approverUserId: string): Promise<void> {
    await sequelize.transaction(async (t) => {
      const creditNote = await CreditNote.findByPk(creditNoteId, { transaction: t });
      if (!creditNote) throw new Error('Credit Note not found');
      if (creditNote.isApproved) throw new Error('Credit Note already approved');

      const invoice = await Invoice.findByPk(creditNote.invoiceId, { transaction: t });
      if (!invoice) throw new Error('Associated Invoice not found');

      // Reduce Invoice Balances Pro-rata
      const newOutstanding = Number(invoice.outstandingAmount) - Number(creditNote.creditAmount);
      const newTotalTax = Number(invoice.totalTax) - Number(creditNote.totalTaxReduction);
      const newCgst = Number(invoice.cgstAmount) - (Number(creditNote.cgstReduction) || 0);
      const newSgst = Number(invoice.sgstAmount) - (Number(creditNote.sgstReduction) || 0);
      const newIgst = Number(invoice.igstAmount) - (Number(creditNote.igstReduction) || 0);

      await invoice.update({
        outstandingAmount: newOutstanding,
        totalTax: newTotalTax,
        cgstAmount: newCgst,
        sgstAmount: newSgst,
        igstAmount: newIgst
      }, { transaction: t });

      // Approve Note
      await creditNote.update({
        isApproved: true,
        approvedBy: approverUserId,
        approvalDate: new Date()
      }, { transaction: t });

      // Add logical reverse payment allocation
      // We pass paymentId as 'null' effectively (DB allows UUID if modified) or map separately.
    });
  }
};

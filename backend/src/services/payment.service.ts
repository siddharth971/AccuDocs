import { Op } from 'sequelize';
import { Invoice, Payment, AdvancePayment, PaymentAllocation, CreditNote, PaymentSchedule } from '../models';
import { sequelize } from '../config/database.config';

export const paymentService = {
  /**
   * Reverse Payment within 7 days
   */
  async reversePayment(paymentId: string, reason: string): Promise<void> {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    const today = new Date();
    const paymentDate = new Date(payment.paymentDate);
    const diffTime = Math.abs(today.getTime() - paymentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      throw new Error("Cannot reverse payment after 7 days");
    }

    if (!payment.invoiceId) {
      // Logic to reverse advance payment
      throw new Error("Reversing generic advances currently unsupported, reverse allocated invoice instead.");
    }

    const invoice = await Invoice.findByPk(payment.invoiceId);
    if (!invoice) throw new Error("Linked Invoice not found.");

    if (invoice.isLocked) {
      throw new Error("Cannot reverse: invoice is locked");
    }

    await sequelize.transaction(async (t) => {
      // 1. Reverse Allocation
      await PaymentAllocation.update(
        { allocatedAmount: 0 }, // Optional: Create a reverse allocation row instead based on DB needs
        { where: { paymentId: payment.id }, transaction: t }
      );

      // 2. Adjust invoice totals
      const newPaid = Number(invoice.amountPaid) - Number(payment.amount);
      const newOutstanding = Number(invoice.outstandingAmount) + Number(payment.amount);

      await invoice.update({
        amountPaid: newPaid,
        outstandingAmount: newOutstanding,
        status: invoice.status === 'FULLY_PAID' ? 'ISSUED' : invoice.status
      }, { transaction: t });

      // 3. Mark payment Reversed
      await payment.update({
        isReversed: true,
        reversalDate: new Date(),
        reversalReason: reason
      }, { transaction: t });

      // Logic to trigger AuditLog via hook or service...
    });
  },

  /**
   * Auto-allocate advances using FIFO strategy
   * Called when an invoice is transitioned to ISSUED.
   */
  async autoAllocateAdvanceFifo(invoice: Invoice, t: any): Promise<void> {
    const advances = await AdvancePayment.findAll({
      where: {
        clientId: invoice.clientId,
        status: { [Op.in]: ['RECEIVED', 'PARTIALLY_USED'] },
        remainingAmount: { [Op.gt]: 0 }
      },
      order: [['receivedDate', 'ASC']], // FIFO
      transaction: t
    });

    let outstanding = Number(invoice.outstandingAmount);
    let totalAllocated = 0;

    for (const advance of advances) {
      if (outstanding <= 0) break;

      const remainingAdvance = Number(advance.remainingAmount);
      const allocation = Math.min(remainingAdvance, outstanding);

      // Create Allocation Record
      await PaymentAllocation.create({
        paymentId: advance.paymentId, // Link original
        invoiceId: invoice.id,
        allocatedAmount: allocation,
        allocationDate: new Date(),
        allocationType: 'AUTOMATIC_FIFO',
      }, { transaction: t });

      // Update Advance
      const newUsed = Number(advance.usedAmount) + allocation;
      const newRemaining = remainingAdvance - allocation;
      await advance.update({
        usedAmount: newUsed,
        remainingAmount: newRemaining,
        status: newRemaining === 0 ? 'FULLY_USED' : 'PARTIALLY_USED'
      }, { transaction: t });

      totalAllocated += allocation;
      outstanding -= allocation;
    }

    if (totalAllocated > 0) {
      const newPaid = Number(invoice.amountPaid) + totalAllocated;
      await invoice.update({
        amountPaid: newPaid,
        outstandingAmount: outstanding,
        status: outstanding === 0 ? 'FULLY_PAID' : 'PARTIALLY_PAID'
      }, { transaction: t });
    }
  },

  /**
   * Create an Installment Payment Schedule for an invoice
   */
  async createPaymentSchedule(invoiceId: string, installments: { amount: number; dueDate: Date }[]): Promise<void> {
    await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
      if (!invoice) throw new Error('Invoice not found');

      const totalSplits = installments.reduce((sum, inst) => sum + inst.amount, 0);

      // We ensure that the manual installments sum matches the grand total.
      // Epsilon added for floating point comparison safety
      if (Math.abs(totalSplits - Number(invoice.grandTotal)) > 0.01) {
        throw new Error('Installments must sum exactly to invoice grand total');
      }

      for (let i = 0; i < installments.length; i++) {
        await PaymentSchedule.create({
          invoiceId: invoice.id,
          scheduledPaymentNumber: i + 1,
          dueDate: installments[i].dueDate,
          amountDue: installments[i].amount,
          amountPaid: 0,
          status: 'PENDING'
        }, { transaction: t });
      }
    });
  }
};

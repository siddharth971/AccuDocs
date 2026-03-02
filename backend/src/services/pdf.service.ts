import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Invoice, Organization } from '../models';

export const invoicePdfGenerator = {
  /**
   * Generate a PDF buffer directly
   */
  async generateBuffer(invoiceId: string): Promise<Buffer> {
    const invoice = await Invoice.findByPk(invoiceId, { include: ['client', 'organization'] });
    if (!invoice) throw new Error('Invoice not found');

    const org = invoice.organization as Organization;
    const client = invoice.client as any;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header Title
        doc.fontSize(20).text(org.name || 'CA Firm Name', { align: 'right' });
        doc.fontSize(10).text(`Registration: ${org.registrationNumber || 'N/A'}`, { align: 'right' });
        doc.text(`GSTIN: ${org.primaryGstin || 'N/A'}`, { align: 'right' });
        doc.moveDown();

        // Invoice Word
        doc.fontSize(24).text('INVOICE', 50, 50);
        doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
        doc.moveDown();

        // Bill to
        doc.fontSize(12).text('BILL TO:');
        doc.fontSize(10).text(client.name);
        doc.text(client.billingAddressLine1 || 'N/A');
        if (client.gstin) doc.text(`GSTIN: ${client.gstin}`);
        doc.moveDown();

        // Table Header
        const startY = doc.y;
        doc.rect(50, startY, 500, 20).fill('#aaaaaa').stroke();
        doc.fillColor('#ffffff').text('Description', 60, startY + 5);
        doc.text('Qty', 350, startY + 5);
        doc.text('Amount', 450, startY + 5);

        // Single line item fallback logic (for simplicity here over PDFKit Table extension, we write manual rows per prompt limits)
        let rowY = startY + 25;
        doc.fillColor('#000000');
        doc.text(invoice.serviceCategory || 'Service', 60, rowY);
        doc.text('1', 350, rowY);
        doc.text(`Rs. ${Number(invoice.subtotal).toFixed(2)}`, 450, rowY);
        rowY += 20;
        doc.moveTo(50, rowY).lineTo(550, rowY).stroke();

        // Tax
        rowY += 15;
        doc.text('Subtotal:', 350, rowY);
        doc.text(`Rs. ${Number(invoice.subtotal).toFixed(2)}`, 450, rowY);

        if (invoice.isSameState) {
          rowY += 15;
          doc.text('CGST:', 350, rowY);
          doc.text(`Rs. ${Number(invoice.cgstAmount).toFixed(2)}`, 450, rowY);
          rowY += 15;
          doc.text('SGST:', 350, rowY);
          doc.text(`Rs. ${Number(invoice.sgstAmount).toFixed(2)}`, 450, rowY);
        } else {
          rowY += 15;
          doc.text('IGST:', 350, rowY);
          doc.text(`Rs. ${Number(invoice.igstAmount).toFixed(2)}`, 450, rowY);
        }

        rowY += 15;
        doc.fontSize(12).text('GRAND TOTAL:', 350, rowY);
        doc.text(`Rs. ${Number(invoice.grandTotal).toFixed(2)}`, 450, rowY);

        // Footer terms
        doc.fontSize(10).text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, rowY);
        if (invoice.notes) doc.text(`Notes: ${invoice.notes}`, 50, rowY + 15);

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }
};

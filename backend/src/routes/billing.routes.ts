import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth, requireRole, requireOrganization } from '../middlewares';
import { Invoice } from '../models/invoice.model';
import { Client } from '../models/client.model';
import { Organization } from '../models/organization.model';
import { IntelligenceService } from '../services/intelligence.service';
import { whatsappDelivery } from '../services/whatsapp.service';
import { Op } from 'sequelize';

const router = Router();
const intelligenceService = new IntelligenceService();

// GET /api/v1/billing/metrics
// Get dashboard metrics for invoices
router.get('/metrics', authenticate, requireRole(['admin', 'finance_manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId;

    if (!orgId) {
      return res.status(400).json({ status: 'error', message: 'Organization ID is missing' });
    }

    // This is a simplified version of what would be a complex query or aggregation
    const outstandingInvoices = await Invoice.findAll({
      where: {
        organizationId: orgId,
        status: {
          [Op.in]: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE']
        }
      }
    });

    let totalOutstanding = 0;
    let totalOverdue = 0;

    outstandingInvoices.forEach(inv => {
      totalOutstanding += Number(inv.outstandingAmount || 0);
      if (inv.status === 'OVERDUE') {
        totalOverdue += Number(inv.outstandingAmount || 0);
      }
    });

    const draftInvoices = await Invoice.count({
      where: {
        organizationId: orgId,
        status: 'DRAFT'
      }
    });

    const org = await Organization.findByPk(orgId);
    let revenueForecast30Days = 0;

    if (org) {
      const forecast = await intelligenceService.forecastRevenue(org);
      revenueForecast30Days = forecast.thirtyDays;
    }

    res.json({
      status: 'success',
      data: {
        totalOutstanding,
        totalOverdue,
        draftInvoices,
        revenueForecast30Days
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/billing/invoices
// List invoices
router.get('/invoices', authenticate, requireRole(['admin', 'finance_manager', 'invoicing_officer']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!orgId) {
      return res.status(400).json({ status: 'error', message: 'Organization ID is missing' });
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where: {
        organizationId: orgId
      },
      include: [
        { model: Client, as: 'client', attributes: ['name', 'gstin'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      status: 'success',
      data: rows,
      total: count,
      limit,
      offset
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/billing/invoices/:id/whatsapp
// Sends the invoice to whatsapp
router.post('/invoices/:id/whatsapp', authenticate, requireRole(['admin', 'finance_manager', 'invoicing_officer']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoiceId = req.params.id;
    const orgId = req.user?.organizationId;

    const invoice = await Invoice.findOne({
      where: { id: invoiceId, organizationId: orgId },
      include: [{ model: Client, as: 'client' }]
    });

    if (!invoice) {
      return res.status(404).json({ status: 'error', message: 'Invoice not found' });
    }

    const success = await whatsappDelivery.sendInvoice(invoice);

    if (success) {
      res.json({ status: 'success', message: 'WhatsApp message sent successfully' });
    } else {
      res.status(500).json({ status: 'error', message: 'Failed to send WhatsApp message' });
    }

  } catch (error) {
    next(error);
  }
});

export default router;

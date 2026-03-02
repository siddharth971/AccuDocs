import { Op, fn, col } from 'sequelize';
import {
  Invoice,
  Client,
  Payment,
  RecurringInvoiceTemplate,
  ClientRiskScore,
  RevenueForecast,
  PredictiveAlert
} from '../models';
import { logger } from '../utils/logger';

export const intelligenceService = {
  // ==========================================
  // 1. CLIENT PAYMENT BEHAVIOR SCORE
  // ==========================================

  async calculateRiskScore(clientId: string, organizationId: string) {
    const client = await Client.findByPk(clientId);
    if (!client) throw new Error('Client not found');

    let score = 100;
    const factors: any = {};
    const today = new Date();
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Helper queries
    const fullyPaidInvoices = await Invoice.findAll({
      where: {
        clientId,
        status: 'FULLY_PAID',
        createdAt: { [Op.gte]: sixMonthsAgo }
      }
    });

    const overdueCount = await Invoice.count({
      where: {
        clientId,
        status: 'OVERDUE',
        createdAt: { [Op.gte]: oneYearAgo }
      }
    });

    const currentOverdueInvoices = await Invoice.findAll({
      where: {
        clientId,
        outstandingAmount: { [Op.gt]: 0 },
        dueDate: { [Op.lt]: today }
      }
    });

    // 1. Payment History (30 points)
    let avgPaymentDays = 0;
    if (fullyPaidInvoices.length > 0) {
      const days = fullyPaidInvoices
        .filter(inv => inv.lastPaymentDate)
        .map(inv => {
          const invoiceDate = new Date(inv.invoiceDate);
          const rawDate = inv.lastPaymentDate as unknown; // Fixes typing
          const paymentDate = new Date(rawDate as string | number | Date);
          return (paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24);
        });
      if (days.length > 0) {
        avgPaymentDays = days.reduce((a, b) => a + b, 0) / days.length;
      }
    }
    const paymentFactor = Math.min(30, (avgPaymentDays / 45) * 30);
    score -= paymentFactor;
    factors.paymentHistory = { avgDays: Math.round(avgPaymentDays), deduction: Math.round(paymentFactor) };

    // 2. Overdue Count (25 points)
    const overdueFactor = Math.min(25, overdueCount * 5);
    score -= overdueFactor;
    factors.overdueCount = { count: overdueCount, deduction: Math.round(overdueFactor) };

    // 3. Days Currently Overdue (20 points)
    let maxOverdueDays = 0;
    if (currentOverdueInvoices.length > 0) {
      const daysOverdueList = currentOverdueInvoices.map(inv => {
        const dueDate = new Date(inv.dueDate);
        return (today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24);
      });
      maxOverdueDays = Math.max(...daysOverdueList);
    }
    const overdueDaysFactor = Math.min(20, (maxOverdueDays / 90) * 20);
    score -= overdueDaysFactor;
    factors.maxOverdueDays = { days: Math.round(maxOverdueDays), deduction: Math.round(overdueDaysFactor) };

    // 4. Payment Consistency (15 points)
    let variance = 0;
    if (fullyPaidInvoices.length >= 2) {
      const daysList = fullyPaidInvoices
        .filter(inv => inv.lastPaymentDate)
        .map(inv => {
          const invoiceDate = new Date(inv.invoiceDate);
          const rawDate = inv.lastPaymentDate as unknown;
          const paymentDate = new Date(rawDate as string | number | Date);
          return (paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24);
        });
      if (daysList.length >= 2) {
        const mean = daysList.reduce((a, b) => a + b, 0) / daysList.length;
        variance = Math.sqrt(daysList.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / daysList.length);
      }
    }
    const consistencyFactor = Math.min(15, (variance / 20) * 15);
    score -= consistencyFactor;
    factors.consistency = { varianceDays: Math.round(variance), deduction: Math.round(consistencyFactor) };

    // 5. Credit Limit Utilization (10 points)
    const outstandingSumResult = await Invoice.sum('outstandingAmount', {
      where: { clientId, outstandingAmount: { [Op.gt]: 0 } }
    });
    const outstandingTotal = outstandingSumResult || 0;

    let creditRatio = 0;
    const creditLimit = Number(client.creditLimit) || 0;
    if (creditLimit > 0) {
      creditRatio = outstandingTotal / creditLimit;
    }
    const creditFactor = Math.min(10, (creditRatio / 1.0) * 10);
    score -= creditFactor;
    factors.creditUtilization = { ratio: Math.round(creditRatio * 100) / 100, deduction: Math.round(creditFactor) };

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'CRITICAL';
    if (finalScore >= 85) riskLevel = 'LOW';
    else if (finalScore >= 65) riskLevel = 'MEDIUM';
    else if (finalScore >= 45) riskLevel = 'HIGH';

    const riskScoreRecord = await ClientRiskScore.create({
      organizationId,
      clientId,
      riskScore: finalScore,
      riskLevel,
      factors,
      calculatedAt: today
    });

    return riskScoreRecord;
  },

  // ==========================================
  // 2. LIFETIME CLIENT VALUE (LCV)
  // ==========================================

  async calculateLTV(clientId: string, organizationId: string) {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);

    const historicalResult = await Invoice.sum('grandTotal', {
      where: {
        clientId,
        status: 'FULLY_PAID',
        createdAt: { [Op.gte]: twoYearsAgo }
      }
    });
    const historical = historicalResult || 0;
    const annualRevenue = historical / 2;

    const invoices = await Invoice.findAll({
      where: { clientId, createdAt: { [Op.gte]: twoYearsAgo } },
      order: [['createdAt', 'ASC']]
    });

    let growthRate = 0.05; // 5% default
    if (invoices.length >= 8) {
      const half = Math.floor(invoices.length / 2);
      const y1Rev = invoices.slice(0, half).reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
      const y2Rev = invoices.slice(half).reduce((sum, inv) => sum + Number(inv.grandTotal), 0);
      if (y1Rev > 0) {
        growthRate = (y2Rev - y1Rev) / y1Rev;
      }
    }

    let projected3Years = 0;
    for (let year = 1; year <= 3; year++) {
      projected3Years += annualRevenue * Math.pow(1 + growthRate, year);
    }

    const totalLtv = historical + projected3Years;
    const segment = totalLtv > 200000 ? 'HIGH' : totalLtv > 50000 ? 'MEDIUM' : 'LOW';

    return {
      historical2Yr: Math.round(historical),
      annualAverage: Math.round(annualRevenue),
      growthRate: Math.round(growthRate * 100) / 100,
      projected3Yr: Math.round(projected3Years),
      totalLtv: Math.round(totalLtv),
      segment
    };
  },

  // ==========================================
  // 3. REVENUE FORECASTING
  // ==========================================

  async forecastRevenue(organization: Organization): Promise<{ thirtyDays: number, sixtyDays: number, ninetyDays: number }> {
    const organizationId = organization.id;
    const today = new Date();
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const historicalInvoices = await Invoice.findAll({
      where: {
        organizationId: organization.id,
        createdAt: { [Op.gte]: sixMonthsAgo },
        status: { [Op.in]: ['FULLY_PAID', 'PARTIALLY_PAID', 'ISSUED'] }
      }
    });

    const monthlyData: Record<string, number> = {};
    for (const inv of historicalInvoices) {
      const createdDate = new Date(inv.createdAt as unknown as string);
      const monthStr = `${createdDate.getFullYear()}-${(createdDate.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyData[monthStr] = (monthlyData[monthStr] || 0) + Number(inv.grandTotal);
    }

    const recurringTemplates = await RecurringInvoiceTemplate.findAll({
      where: { organizationId, isActive: true }
    });

    let monthlyRecurring = 0;
    for (const t of recurringTemplates) {
      const freqMultiplier = t.recurringFrequency === 'MONTHLY' ? 12 :
        t.recurringFrequency === 'QUARTERLY' ? 4 :
          t.recurringFrequency === 'HALF_YEARLY' ? 2 : 1;
      monthlyRecurring += (freqMultiplier * Number(t.subtotal) * (1 + (t.gstSlab / 100))) / 12;
    }

    const next90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const outstandingResult = await Invoice.sum('outstandingAmount', {
      where: {
        organizationId,
        outstandingAmount: { [Op.gt]: 0 },
        dueDate: { [Op.lte]: next90Days }
      }
    });
    const outstanding = outstandingResult || 0;

    const values = Object.values(monthlyData);
    let avgMonthly = 0;
    let trend = 0.05;

    if (values.length > 0) {
      avgMonthly = values.reduce((a, b) => a + b, 0) / values.length;

      const recent3 = values.slice(-3);
      const older3 = values.slice(-6, -3);
      const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length;
      const olderAvg = older3.length > 0 ? older3.reduce((a, b) => a + b, 0) / older3.length : recentAvg;

      if (olderAvg > 0) {
        trend = (recentAvg - olderAvg) / olderAvg;
      }
    }

    const forecasts = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Delete old forecasts for recalculation
    await RevenueForecast.destroy({
      where: { organizationId, generatedAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } }
    });

    for (let offset = 1; offset <= 3; offset++) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + offset);
      const monthLabel = `${monthNames[forecastDate.getMonth()]} ${forecastDate.getFullYear()}`;

      const baseForecast = avgMonthly * Math.pow(1 + trend, offset);
      let totalForecast = baseForecast + monthlyRecurring;
      if (offset === 1) totalForecast += outstanding;

      const confidence = offset === 1 ? 0.90 : offset === 2 ? 0.80 : 0.70;

      const breakdown = {
        historicalTrend: Math.round(baseForecast),
        recurring: Math.round(monthlyRecurring),
        outstanding: offset === 1 ? Math.round(outstanding) : 0
      };

      const record = await RevenueForecast.create({
        organizationId,
        forecastMonth: monthLabel,
        forecastedAmount: Math.round(totalForecast * 100) / 100,
        confidence,
        breakdown,
        generatedAt: new Date()
      });

      forecasts.push(record);
    }

    return {
      thirtyDays: forecasts[0] ? forecasts[0].forecastedAmount : 0,
      sixtyDays: forecasts[1] ? forecasts[1].forecastedAmount : 0,
      ninetyDays: forecasts[2] ? forecasts[2].forecastedAmount : 0
    };
  },

  // ==========================================
  // 4. PREDICTIVE ALERTS
  // ==========================================

  async checkPredictiveAlerts(organizationId: string) {
    const clients = await Client.findAll({ where: { organizationId, status: 'active' } });
    const todayCheck = new Date();

    // Generate alerts array
    for (const client of clients) {
      // 1. Credit Limit Warning
      const outstandingSum = await Invoice.sum('outstandingAmount', {
        where: { clientId: client.id, outstandingAmount: { [Op.gt]: 0 } }
      });
      const outstanding = outstandingSum || 0;
      const limit = Number(client.creditLimit) || 0;

      if (limit > 0) {
        const utilization = outstanding / limit;
        if (utilization > 0.8) {
          await PredictiveAlert.create({
            organizationId,
            clientId: client.id,
            alertType: 'CREDIT_LIMIT_WARNING',
            severity: utilization > 0.95 ? 'HIGH' : 'MEDIUM',
            message: `Client ${client.name} at ${Math.round(utilization * 100)}% of credit limit`,
            recommendedAction: 'Review or reduce credit limit',
            isAcknowledged: false
          });
        }
      }

      // 2. High Value Overdue
      const ltv = await this.calculateLTV(client.id, organizationId);
      if (ltv.segment === 'HIGH') {
        const overdueInvoices = await Invoice.findAll({
          where: { clientId: client.id, status: 'OVERDUE', outstandingAmount: { [Op.gt]: 0 } }
        });

        if (overdueInvoices.length > 0) {
          const maxDays = Math.max(...overdueInvoices.map(inv => {
            const dueDate = new Date(inv.dueDate);
            return (today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24);
          }));

          if (maxDays > 30) {
            const overdueAmountSum = overdueInvoices.reduce((sum, inv) => sum + Number(inv.outstandingAmount), 0);
            await PredictiveAlert.create({
              organizationId,
              clientId: client.id,
              alertType: 'HIGH_VALUE_OVERDUE',
              severity: 'CRITICAL',
              message: `High LTV Client ${client.name} is ${Math.round(maxDays)} days overdue on ${overdueAmountSum}`,
              recommendedAction: 'Immediate escalation to senior management',
              isAcknowledged: false
            });
          }
        }
      }
    }

    logger.info(`Predictive alerts check completed for org ${organizationId}`);
  }
};

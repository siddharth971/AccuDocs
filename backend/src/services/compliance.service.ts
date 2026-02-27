import { complianceRepository } from '../repositories/compliance.repository';
import { ComplianceDeadlineCreationAttributes, ClientDeadlineCreationAttributes } from '../models';
import { logger } from '../utils/logger';

// ========== PRE-SEEDED INDIAN TAX CALENDAR FY 2025-26 & 2026-27 ==========
const getSeededDeadlines = (fy: string, calendarYear: number): ComplianceDeadlineCreationAttributes[] => {
  // FY runs from April of calendarYear to March of calendarYear+1
  // e.g., FY 2025-26 = April 2025 to March 2026
  const apr = calendarYear;
  const nextYear = calendarYear + 1;

  return [
    // ===== GST DEADLINES (Monthly GSTR-3B) =====
    { type: 'GST', title: `GSTR-3B - ${fy} April`, dueDate: new Date(`${apr}-05-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for April ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} May`, dueDate: new Date(`${apr}-06-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for May ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} June`, dueDate: new Date(`${apr}-07-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for June ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} July`, dueDate: new Date(`${apr}-08-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for July ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} August`, dueDate: new Date(`${apr}-09-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for August ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} September`, dueDate: new Date(`${apr}-10-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for September ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} October`, dueDate: new Date(`${apr}-11-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for October ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} November`, dueDate: new Date(`${apr}-12-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for November ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} December`, dueDate: new Date(`${nextYear}-01-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for December ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} January`, dueDate: new Date(`${nextYear}-02-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for January ${nextYear}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} February`, dueDate: new Date(`${nextYear}-03-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for February ${nextYear}`, isSeeded: true },
    { type: 'GST', title: `GSTR-3B - ${fy} March`, dueDate: new Date(`${nextYear}-04-20`), recurring: true, recurringPattern: 'monthly', description: `Monthly GST return GSTR-3B for March ${nextYear}`, isSeeded: true },

    // ===== GST GSTR-1 (Monthly - 11th of next month) =====
    { type: 'GST', title: `GSTR-1 - ${fy} April`, dueDate: new Date(`${apr}-05-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for April ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} May`, dueDate: new Date(`${apr}-06-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for May ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} June`, dueDate: new Date(`${apr}-07-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for June ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} July`, dueDate: new Date(`${apr}-08-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for July ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} August`, dueDate: new Date(`${apr}-09-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for August ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} September`, dueDate: new Date(`${apr}-10-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for September ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} October`, dueDate: new Date(`${apr}-11-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for October ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} November`, dueDate: new Date(`${apr}-12-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for November ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} December`, dueDate: new Date(`${nextYear}-01-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for December ${apr}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} January`, dueDate: new Date(`${nextYear}-02-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for January ${nextYear}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} February`, dueDate: new Date(`${nextYear}-03-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for February ${nextYear}`, isSeeded: true },
    { type: 'GST', title: `GSTR-1 - ${fy} March`, dueDate: new Date(`${nextYear}-04-11`), recurring: true, recurringPattern: 'monthly', description: `Outward supplies return GSTR-1 for March ${nextYear}`, isSeeded: true },

    // ===== GST Annual Return =====
    { type: 'GST', title: `GSTR-9 Annual Return - ${fy}`, dueDate: new Date(`${nextYear}-12-31`), recurring: false, description: `Annual GST return for FY ${fy}. Due by 31st December.`, isSeeded: true },

    // ===== TDS DEADLINES (Quarterly) =====
    { type: 'TDS', title: `TDS Return Q1 - ${fy}`, dueDate: new Date(`${apr}-07-31`), recurring: true, recurringPattern: 'quarterly', description: `TDS return for Q1 (April-June) of FY ${fy}`, isSeeded: true },
    { type: 'TDS', title: `TDS Return Q2 - ${fy}`, dueDate: new Date(`${apr}-10-31`), recurring: true, recurringPattern: 'quarterly', description: `TDS return for Q2 (July-September) of FY ${fy}`, isSeeded: true },
    { type: 'TDS', title: `TDS Return Q3 - ${fy}`, dueDate: new Date(`${nextYear}-01-31`), recurring: true, recurringPattern: 'quarterly', description: `TDS return for Q3 (October-December) of FY ${fy}`, isSeeded: true },
    { type: 'TDS', title: `TDS Return Q4 - ${fy}`, dueDate: new Date(`${nextYear}-05-31`), recurring: true, recurringPattern: 'quarterly', description: `TDS return for Q4 (January-March) of FY ${fy}`, isSeeded: true },

    // ===== TDS Payment (Monthly - 7th of next month) =====
    { type: 'TDS', title: `TDS Payment - ${fy} April`, dueDate: new Date(`${apr}-05-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for April ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} May`, dueDate: new Date(`${apr}-06-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for May ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} June`, dueDate: new Date(`${apr}-07-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for June ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} July`, dueDate: new Date(`${apr}-08-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for July ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} August`, dueDate: new Date(`${apr}-09-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for August ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} September`, dueDate: new Date(`${apr}-10-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for September ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} October`, dueDate: new Date(`${apr}-11-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for October ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} November`, dueDate: new Date(`${apr}-12-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for November ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} December`, dueDate: new Date(`${nextYear}-01-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for December ${apr}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} January`, dueDate: new Date(`${nextYear}-02-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for January ${nextYear}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} February`, dueDate: new Date(`${nextYear}-03-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for February ${nextYear}`, isSeeded: true },
    { type: 'TDS', title: `TDS Payment - ${fy} March`, dueDate: new Date(`${nextYear}-04-07`), recurring: true, recurringPattern: 'monthly', description: `TDS challan payment due for March ${nextYear} (Govt deductors: 30th March)`, isSeeded: true },

    // ===== ITR DEADLINES =====
    { type: 'ITR', title: `ITR Filing (Non-Audit) - ${fy}`, dueDate: new Date(`${nextYear}-07-31`), recurring: false, description: `Income Tax Return due date for individuals and non-audit cases for FY ${fy}`, isSeeded: true },
    { type: 'ITR', title: `ITR Filing (Audit Cases) - ${fy}`, dueDate: new Date(`${nextYear}-10-31`), recurring: false, description: `Income Tax Return due date for audit cases for FY ${fy}`, isSeeded: true },
    { type: 'ITR', title: `ITR Filing (Transfer Pricing) - ${fy}`, dueDate: new Date(`${nextYear}-11-30`), recurring: false, description: `ITR due for transfer pricing cases for FY ${fy}`, isSeeded: true },
    { type: 'ITR', title: `Belated/Revised ITR - ${fy}`, dueDate: new Date(`${nextYear + 1}-12-31`), recurring: false, description: `Last date for belated or revised ITR for FY ${fy}`, isSeeded: true },

    // ===== ADVANCE TAX =====
    { type: 'ADVANCE_TAX', title: `Advance Tax - 1st Installment (${fy})`, dueDate: new Date(`${apr}-06-15`), recurring: true, recurringPattern: 'quarterly', description: `15% of estimated tax liability for FY ${fy}`, isSeeded: true },
    { type: 'ADVANCE_TAX', title: `Advance Tax - 2nd Installment (${fy})`, dueDate: new Date(`${apr}-09-15`), recurring: true, recurringPattern: 'quarterly', description: `45% cumulative of estimated tax liability for FY ${fy}`, isSeeded: true },
    { type: 'ADVANCE_TAX', title: `Advance Tax - 3rd Installment (${fy})`, dueDate: new Date(`${apr}-12-15`), recurring: true, recurringPattern: 'quarterly', description: `75% cumulative of estimated tax liability for FY ${fy}`, isSeeded: true },
    { type: 'ADVANCE_TAX', title: `Advance Tax - 4th Installment (${fy})`, dueDate: new Date(`${nextYear}-03-15`), recurring: true, recurringPattern: 'quarterly', description: `100% of estimated tax liability for FY ${fy}`, isSeeded: true },

    // ===== ROC DEADLINES =====
    { type: 'ROC', title: `AOC-4 Filing - ${fy}`, dueDate: new Date(`${nextYear}-10-30`), recurring: false, description: `Annual filing of financial statements with ROC for FY ${fy}. Due within 30 days of AGM.`, isSeeded: true },
    { type: 'ROC', title: `MGT-7 Annual Return - ${fy}`, dueDate: new Date(`${nextYear}-11-29`), recurring: false, description: `Annual return filing with ROC for FY ${fy}. Due within 60 days of AGM.`, isSeeded: true },
    { type: 'ROC', title: `DIR-3 KYC - ${fy}`, dueDate: new Date(`${nextYear}-09-30`), recurring: true, recurringPattern: 'yearly', description: `Director KYC filing with MCA for FY ${fy}`, isSeeded: true },
    { type: 'ROC', title: `DPT-3 Return - ${fy}`, dueDate: new Date(`${nextYear}-06-30`), recurring: true, recurringPattern: 'yearly', description: `Return of deposits for FY ${fy}`, isSeeded: true },
    { type: 'ROC', title: `MSME-1 Half-Yearly - ${fy} H1`, dueDate: new Date(`${apr}-10-31`), recurring: true, recurringPattern: 'half-yearly', description: `MSME-1 return for outstanding payments to MSMEs (H1 of FY ${fy})`, isSeeded: true },
    { type: 'ROC', title: `MSME-1 Half-Yearly - ${fy} H2`, dueDate: new Date(`${nextYear}-04-30`), recurring: true, recurringPattern: 'half-yearly', description: `MSME-1 return for outstanding payments to MSMEs (H2 of FY ${fy})`, isSeeded: true },
  ];
};

export const complianceService = {
  // ========== SEEDING ==========

  async seedDeadlines(): Promise<void> {
    try {
      // Seed for FY 2025-26 and FY 2026-27
      const financialYears = [
        { fy: 'FY 2025-26', year: 2025 },
        { fy: 'FY 2026-27', year: 2026 },
      ];

      let created = 0;
      let skipped = 0;

      for (const { fy, year } of financialYears) {
        const deadlines = getSeededDeadlines(fy, year);

        for (const deadline of deadlines) {
          const dueDateStr = deadline.dueDate instanceof Date
            ? deadline.dueDate.toISOString().split('T')[0]
            : String(deadline.dueDate);

          const existing = await complianceRepository.findSeededDeadlineByTitleAndDate(
            deadline.title,
            dueDateStr
          );

          if (!existing) {
            await complianceRepository.createDeadline(deadline);
            created++;
          } else {
            skipped++;
          }
        }
      }

      logger.info(`📅 Compliance deadlines seeded: ${created} created, ${skipped} already exist`);
    } catch (error) {
      logger.error('Failed to seed compliance deadlines:', error);
      throw error;
    }
  },

  // ========== DEADLINES CRUD ==========

  async getDeadlines(filters: {
    type?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
  } = {}) {
    return complianceRepository.findAllDeadlines(filters);
  },

  async getDeadline(id: string) {
    const deadline = await complianceRepository.findDeadlineById(id);
    if (!deadline) throw new Error('Deadline not found');
    return deadline;
  },

  async createDeadline(data: ComplianceDeadlineCreationAttributes) {
    return complianceRepository.createDeadline({ ...data, isSeeded: false });
  },

  async updateDeadline(id: string, data: Partial<ComplianceDeadlineCreationAttributes>) {
    const deadline = await complianceRepository.updateDeadline(id, data);
    if (!deadline) throw new Error('Deadline not found');
    return deadline;
  },

  async deleteDeadline(id: string) {
    const deleted = await complianceRepository.deleteDeadline(id);
    if (!deleted) throw new Error('Deadline not found');
  },

  // ========== CLIENT DEADLINE ASSIGNMENTS ==========

  async assignClient(deadlineId: string, clientId: string, notes?: string) {
    const existing = await complianceRepository.findClientDeadlineByClientAndDeadline(clientId, deadlineId);
    if (existing) throw new Error('Client is already assigned to this deadline');

    return complianceRepository.createClientDeadline({
      clientId,
      deadlineId,
      status: 'pending',
      notes,
    });
  },

  async bulkAssignClients(deadlineId: string, clientIds: string[]) {
    const data: ClientDeadlineCreationAttributes[] = clientIds.map(clientId => ({
      clientId,
      deadlineId,
      status: 'pending' as const,
    }));

    return complianceRepository.bulkCreateClientDeadlines(data);
  },

  async updateClientDeadline(id: string, data: { status?: string; filedDate?: string; notes?: string }) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.filedDate) updateData.filedDate = data.filedDate;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // If marking as filed, set filed date automatically if not provided
    if (data.status === 'filed' && !data.filedDate) {
      updateData.filedDate = new Date().toISOString().split('T')[0];
    }

    const clientDeadline = await complianceRepository.updateClientDeadline(id, updateData);
    if (!clientDeadline) throw new Error('Client deadline not found');
    return clientDeadline;
  },

  async removeClientDeadline(id: string) {
    const deleted = await complianceRepository.deleteClientDeadline(id);
    if (!deleted) throw new Error('Client deadline not found');
  },

  async getClientDeadlines(filters: {
    clientId?: string;
    deadlineId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    return complianceRepository.findClientDeadlines(filters);
  },

  // ========== STATS & WIDGETS ==========

  async getStats(year?: number) {
    return complianceRepository.getStats(year);
  },

  async getUpcomingThisWeek() {
    return complianceRepository.getUpcomingThisWeek();
  },

  async getOverdueDeadlines() {
    return complianceRepository.getOverdueDeadlines();
  },

  // ========== AUTO STATUS UPDATE ==========

  async updateOverdueStatuses(): Promise<number> {
    const overdue = await complianceRepository.getOverdueDeadlines();
    let updated = 0;

    for (const cd of overdue) {
      if (cd.status === 'pending') {
        await complianceRepository.updateClientDeadline(cd.id, { status: 'overdue' });
        updated++;
      }
    }

    return updated;
  },
};

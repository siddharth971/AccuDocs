import { checklistRepository, logRepository, clientRepository } from '../repositories';
import { ChecklistItemData, ChecklistItemStatus } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Pre-built templates for Indian CA practice
const DEFAULT_TEMPLATES = [
  {
    name: 'ITR Filing - Individual (Salaried)',
    serviceType: 'itr',
    description: 'Standard checklist for individual salaried ITR filing',
    isDefault: true,
    items: [
      { label: 'Form 16', description: 'TDS certificate from employer', required: true, category: 'Income' },
      { label: 'Form 16A', description: 'TDS certificate from other sources (FDs, etc.)', required: false, category: 'Income' },
      { label: 'Salary Slips (12 months)', description: 'Monthly salary slips for the FY', required: false, category: 'Income' },
      { label: 'Bank Statements (All accounts)', description: 'Savings/Current account statements', required: true, category: 'Bank' },
      { label: 'Form 26AS / AIS', description: 'Annual Tax Statement from TRACES/Income Tax portal', required: true, category: 'Tax' },
      { label: 'Investment Proofs - 80C', description: 'LIC, PPF, ELSS, etc.', required: true, category: 'Deductions' },
      { label: 'Health Insurance Premium - 80D', description: 'Mediclaim receipts', required: false, category: 'Deductions' },
      { label: 'Home Loan Interest Certificate', description: 'Interest certificate from bank (Sec 24)', required: false, category: 'Deductions' },
      { label: 'HRA Receipts', description: 'Rent receipts and landlord PAN', required: false, category: 'Deductions' },
      { label: 'Capital Gains Statement', description: 'Equity/MF/Property sale details', required: false, category: 'Capital Gains' },
      { label: 'PAN Card Copy', description: 'PAN card of assessee', required: true, category: 'Identity' },
      { label: 'Aadhaar Card Copy', description: 'Aadhaar card of assessee', required: true, category: 'Identity' },
    ],
  },
  {
    name: 'ITR Filing - Business/Professional',
    serviceType: 'itr',
    description: 'Checklist for business or professional ITR filing',
    isDefault: true,
    items: [
      { label: 'Profit & Loss Statement', description: 'P&L account for the FY', required: true, category: 'Financials' },
      { label: 'Balance Sheet', description: 'Balance sheet as of 31st March', required: true, category: 'Financials' },
      { label: 'Bank Statements (All accounts)', description: 'Business and personal accounts', required: true, category: 'Bank' },
      { label: 'Sales Register / Invoices', description: 'Complete sales records', required: true, category: 'Books' },
      { label: 'Purchase Register / Bills', description: 'Complete purchase records', required: true, category: 'Books' },
      { label: 'Expense Vouchers', description: 'Office rent, salary, utilities etc.', required: true, category: 'Books' },
      { label: 'Form 26AS / AIS', description: 'Annual Tax Statement', required: true, category: 'Tax' },
      { label: 'GST Returns (GSTR-3B, GSTR-1)', description: 'All GST returns filed during FY', required: false, category: 'GST' },
      { label: 'Previous Year ITR', description: 'Last year filed return', required: false, category: 'Reference' },
      { label: 'TDS Certificates', description: 'Form 16A from all deductors', required: false, category: 'Tax' },
      { label: 'Fixed Asset Register', description: 'List of fixed assets with depreciation', required: false, category: 'Assets' },
      { label: 'Loan Statements', description: 'Business loan interest certificates', required: false, category: 'Bank' },
      { label: 'PAN Card Copy', description: 'PAN card of business/proprietor', required: true, category: 'Identity' },
      { label: 'Aadhaar Card Copy', description: 'Aadhaar of proprietor/partner', required: true, category: 'Identity' },
    ],
  },
  {
    name: 'GST Registration',
    serviceType: 'gst',
    description: 'Documents required for new GST registration',
    isDefault: true,
    items: [
      { label: 'PAN Card', description: 'PAN of business/proprietor', required: true, category: 'Identity' },
      { label: 'Aadhaar Card', description: 'Aadhaar of authorized signatory', required: true, category: 'Identity' },
      { label: 'Business Registration Certificate', description: 'Partnership deed / MOA / AOA', required: true, category: 'Business' },
      { label: 'Address Proof of Business', description: 'Electricity bill / rent agreement', required: true, category: 'Address' },
      { label: 'Bank Account Statement/Cancelled Cheque', description: 'Business bank account proof', required: true, category: 'Bank' },
      { label: 'Photograph', description: 'Passport size photo of proprietor/partners', required: true, category: 'Identity' },
      { label: 'Digital Signature Certificate', description: 'DSC for companies/LLPs', required: false, category: 'Compliance' },
      { label: 'Letter of Authorization', description: 'For authorized signatory', required: false, category: 'Compliance' },
    ],
  },
  {
    name: 'GST Monthly/Quarterly Return',
    serviceType: 'gst',
    description: 'Recurring documents for GST return filing',
    isDefault: true,
    items: [
      { label: 'Sales Invoices', description: 'All B2B and B2C invoices for the period', required: true, category: 'Sales' },
      { label: 'Purchase Invoices', description: 'All purchase bills with GSTIN', required: true, category: 'Purchases' },
      { label: 'Credit/Debit Notes', description: 'Any CN/DN issued or received', required: false, category: 'Adjustments' },
      { label: 'Bank Statement', description: 'For payment reconciliation', required: false, category: 'Bank' },
      { label: 'E-Way Bills', description: 'E-way bills generated for goods movement', required: false, category: 'Transport' },
      { label: 'HSN-wise Summary', description: 'HSN code wise sales summary', required: true, category: 'Sales' },
      { label: 'Previous Return Copy', description: 'Last GSTR-3B and GSTR-1', required: false, category: 'Reference' },
    ],
  },
  {
    name: 'Tax Audit (44AB)',
    serviceType: 'audit',
    description: 'Documents required for Tax Audit u/s 44AB',
    isDefault: true,
    items: [
      { label: 'Books of Accounts', description: 'Cash book, journal, ledger', required: true, category: 'Books' },
      { label: 'Trial Balance', description: 'Trial balance for the FY', required: true, category: 'Financials' },
      { label: 'Profit & Loss Account', description: 'Detailed P&L statement', required: true, category: 'Financials' },
      { label: 'Balance Sheet', description: 'Detailed balance sheet', required: true, category: 'Financials' },
      { label: 'Bank Statements (All accounts)', description: 'Including FD statements', required: true, category: 'Bank' },
      { label: 'Bank Reconciliation Statement', description: 'BRS for all bank accounts', required: true, category: 'Bank' },
      { label: 'Fixed Asset Register', description: 'With depreciation schedule', required: true, category: 'Assets' },
      { label: 'Stock Statement', description: 'Closing stock valuation', required: true, category: 'Inventory' },
      { label: 'Debtors/Creditors List', description: 'Outstanding receivables and payables', required: true, category: 'Financials' },
      { label: 'TDS Compliance (26Q, 24Q)', description: 'TDS returns and challans', required: true, category: 'Tax' },
      { label: 'GST Returns & Reconciliation', description: 'GSTR-2A vs Books reconciliation', required: true, category: 'GST' },
      { label: 'Loans & Advances Details', description: 'All loan agreements and schedules', required: false, category: 'Bank' },
      { label: 'Related Party Transactions', description: 'Details of transactions with related parties', required: false, category: 'Compliance' },
      { label: 'Previous Year Audit Report', description: 'Last year 3CA/3CB/3CD', required: false, category: 'Reference' },
    ],
  },
  {
    name: 'TDS Return Filing',
    serviceType: 'tds',
    description: 'Documents required for quarterly TDS return',
    isDefault: true,
    items: [
      { label: 'Salary Register', description: 'Employee wise salary details (for 24Q)', required: false, category: 'Salary' },
      { label: 'Form 12BB', description: 'Employee investment declarations', required: false, category: 'Salary' },
      { label: 'Vendor Payment Details', description: 'All payments to vendors with TDS deducted', required: true, category: 'Payments' },
      { label: 'Professional Fee Payments', description: 'Sec 194J payments details', required: false, category: 'Payments' },
      { label: 'Rent Payments', description: 'Sec 194I rent TDS details', required: false, category: 'Payments' },
      { label: 'TDS Challan Receipts', description: 'All TDS deposit challans for the quarter', required: true, category: 'Tax' },
      { label: 'Previous Quarter TDS Return', description: 'Last quarter 26Q/24Q for reference', required: false, category: 'Reference' },
    ],
  },
  {
    name: 'ROC Annual Filing',
    serviceType: 'roc',
    description: 'Documents required for ROC annual compliance',
    isDefault: true,
    items: [
      { label: 'Audited Financial Statements', description: 'P&L, Balance Sheet, Cash Flow', required: true, category: 'Financials' },
      { label: 'Director Report', description: 'Board approved director report', required: true, category: 'Compliance' },
      { label: 'Auditor Report', description: 'Independent auditor report', required: true, category: 'Compliance' },
      { label: 'Board Resolution / Minutes', description: 'AGM and board meeting minutes', required: true, category: 'Governance' },
      { label: 'MGT-7 Data', description: 'Annual return data (shareholding pattern, etc.)', required: true, category: 'Compliance' },
      { label: 'AOC-4 Data', description: 'Financial statement filing data', required: true, category: 'Compliance' },
      { label: 'DSC of Directors', description: 'Active digital signature certificates', required: true, category: 'Identity' },
      { label: 'DIR-12 (if any changes)', description: 'Director appointment/resignation forms', required: false, category: 'Changes' },
    ],
  },
];

export const checklistService = {
  // ========== TEMPLATES ==========

  async seedDefaultTemplates(): Promise<void> {
    const existing = await checklistRepository.findAllTemplates();
    const defaultTemplates = existing.filter(t => t.isDefault);

    if (defaultTemplates.length === 0) {
      logger.info('Seeding default checklist templates...');
      for (const template of DEFAULT_TEMPLATES) {
        await checklistRepository.createTemplate(template);
      }
      logger.info(`Seeded ${DEFAULT_TEMPLATES.length} default templates`);
    }
  },

  async getTemplates(): Promise<any[]> {
    const templates = await checklistRepository.findAllTemplates();
    return templates.map(t => ({
      id: t.id,
      name: t.name,
      serviceType: t.serviceType,
      description: t.description,
      itemCount: t.items.length,
      items: t.items,
      isDefault: t.isDefault,
      creator: t.creator,
      createdAt: t.createdAt,
    }));
  },

  async getTemplate(templateId: string): Promise<any> {
    const template = await checklistRepository.findTemplateById(templateId);
    if (!template) throw new NotFoundError('Template not found');
    return template;
  },

  async createTemplate(data: {
    name: string;
    serviceType: string;
    description?: string;
    items: any[];
    createdBy: string;
  }): Promise<any> {
    return checklistRepository.createTemplate({
      ...data,
      isDefault: false,
    });
  },

  async updateTemplate(templateId: string, data: any): Promise<any> {
    const template = await checklistRepository.findTemplateById(templateId);
    if (!template) throw new NotFoundError('Template not found');
    if (template.isDefault) throw new BadRequestError('Cannot modify default templates');
    return checklistRepository.updateTemplate(templateId, data);
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const template = await checklistRepository.findTemplateById(templateId);
    if (!template) throw new NotFoundError('Template not found');
    if (template.isDefault) throw new BadRequestError('Cannot delete default templates');
    await checklistRepository.deleteTemplate(templateId);
  },

  // ========== CHECKLISTS ==========

  async bulkCreateChecklists(data: {
    templateId: string;
    clientIds: string[] | 'all';
    financialYear: string;
    dueDate?: string;
    sendWhatsApp?: boolean;
    createdBy: string;
    ip?: string;
  }): Promise<{ created: number; skipped: number; total: number; whatsappSent?: number }> {
    // Get template
    const template = await checklistRepository.findTemplateById(data.templateId);
    if (!template) throw new NotFoundError('Template not found');

    // Get target client IDs
    let targetClientIds: string[];
    if (data.clientIds === 'all') {
      targetClientIds = await checklistRepository.findAllClientIds();
    } else {
      targetClientIds = data.clientIds;
    }

    if (targetClientIds.length === 0) {
      throw new BadRequestError('No clients found');
    }

    // Find clients that already have this checklist (same FY + service type)
    const existingKeys = await checklistRepository.findExistingChecklistKeys(
      targetClientIds,
      data.financialYear,
      template.serviceType
    );

    // Filter out clients that already have the checklist
    const newClientIds = targetClientIds.filter(id => !existingKeys.has(id));

    if (newClientIds.length === 0) {
      return { created: 0, skipped: targetClientIds.length, total: targetClientIds.length };
    }

    // Prepare bulk records
    const records = newClientIds.map(clientId => {
      const items: ChecklistItemData[] = template.items.map((item: any) => ({
        id: uuidv4(),
        label: item.label,
        description: item.description,
        category: item.category,
        required: item.required,
        status: 'pending' as ChecklistItemStatus,
      }));

      return {
        id: uuidv4(),
        clientId,
        templateId: data.templateId,
        name: `${template.name} - ${data.financialYear}`,
        financialYear: data.financialYear,
        serviceType: template.serviceType,
        items,
        totalItems: items.length,
        receivedItems: 0,
        progress: 0,
        status: 'active',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdBy: data.createdBy,
      };
    });

    // Batch insert using individual creates wrapped in Promise.all
    const BATCH_SIZE = 50;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(record => checklistRepository.create(record)));
    }

    // Log the bulk action
    await logRepository.create({
      userId: data.createdBy,
      action: 'CHECKLIST_BULK_CREATED' as any,
      description: `Bulk created "${template.name}" checklist for ${newClientIds.length} clients (FY ${data.financialYear}). Skipped ${existingKeys.size} existing.`,
      entityType: 'checklist',
      ip: data.ip,
    });

    logger.info(`Bulk created ${newClientIds.length} checklists, skipped ${existingKeys.size}`);

    // Send WhatsApp notifications if enabled
    let whatsappSent = 0;
    if (data.sendWhatsApp) {
      try {
        const { whatsappService } = await import('./whatsapp.service');

        // Fetch client details with user (mobile number) for all new clients
        const { clients } = await clientRepository.findAll(
          {},
          { page: 1, limit: 1000 }
        );

        const clientMap = new Map<string, any>();
        clients.forEach((c: any) => {
          clientMap.set(c.id, c);
        });

        // Build the document list from template items
        const pendingItemsList = template.items
          .map((item: any, idx: number) => `${idx + 1}. ${item.label}`)
          .join('\n');

        const dueDateStr = data.dueDate
          ? `\n📅 *Due Date:* ${new Date(data.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
          : '';

        // Send messages in batches to avoid overwhelming WhatsApp
        const WA_BATCH = 10;
        for (let i = 0; i < newClientIds.length; i += WA_BATCH) {
          const batch = newClientIds.slice(i, i + WA_BATCH);
          const promises = batch.map(async (clientId) => {
            const client = clientMap.get(clientId);
            if (!client?.user?.mobile) return false;

            const clientName = client.user.name || client.code;
            const mobile = client.user.mobile;

            const message =
              `📋 *Document Checklist - ${template.name}*\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `Dear *${clientName}*,\n\n` +
              `We need the following documents for *FY ${data.financialYear}*:\n\n` +
              `${pendingItemsList}\n` +
              `${dueDateStr}\n\n` +
              `Please send these documents at your earliest convenience.\n\n` +
              `Thank you! 🙏\n` +
              `_AccuDocs_`;

            try {
              await whatsappService.sendMessage(mobile, message);
              return true;
            } catch (err: any) {
              logger.warn(`Failed to send WhatsApp to ${mobile}: ${err.message}`);
              return false;
            }
          });

          const results = await Promise.all(promises);
          whatsappSent += results.filter(Boolean).length;

          // Small delay between batches to avoid rate limiting
          if (i + WA_BATCH < newClientIds.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        logger.info(`WhatsApp notifications sent to ${whatsappSent} clients`);
      } catch (err: any) {
        logger.error(`WhatsApp notification error: ${err.message}`);
        // Don't fail the bulk create if WhatsApp fails
      }
    }

    return {
      created: newClientIds.length,
      skipped: existingKeys.size,
      total: targetClientIds.length,
      whatsappSent: data.sendWhatsApp ? whatsappSent : undefined,
    };
  },

  async createChecklist(data: {
    clientId: string;
    templateId?: string;
    name: string;
    financialYear: string;
    serviceType: string;
    dueDate?: string;
    notes?: string;
    createdBy: string;
    ip?: string;
  }): Promise<any> {
    // Verify client exists
    const client = await clientRepository.findById(data.clientId);
    if (!client) throw new NotFoundError('Client not found');

    // Get items from template or empty
    let items: ChecklistItemData[] = [];
    if (data.templateId) {
      const template = await checklistRepository.findTemplateById(data.templateId);
      if (!template) throw new NotFoundError('Template not found');
      items = template.items.map(item => ({
        id: uuidv4(),
        label: item.label,
        description: item.description,
        category: item.category,
        required: item.required,
        status: 'pending' as ChecklistItemStatus,
      }));
    }

    const checklist = await checklistRepository.create({
      clientId: data.clientId,
      templateId: data.templateId,
      name: data.name,
      financialYear: data.financialYear,
      serviceType: data.serviceType,
      items,
      totalItems: items.length,
      receivedItems: 0,
      progress: 0,
      status: 'active',
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
      createdBy: data.createdBy,
    });

    // Log creation
    await logRepository.create({
      userId: data.createdBy,
      action: 'CHECKLIST_CREATED' as any,
      description: `Created checklist "${data.name}" for client ${client.code}`,
      entityId: checklist.id,
      entityType: 'checklist',
      ip: data.ip,
    });

    return checklistRepository.findById(checklist.id);
  },

  async getChecklist(checklistId: string): Promise<any> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');
    return checklist;
  },

  async getChecklists(
    filters: any = {},
    pagination: any = { page: 1, limit: 10 }
  ): Promise<{ checklists: any[]; total: number }> {
    return checklistRepository.findAll(filters, pagination);
  },

  async getClientChecklists(clientId: string): Promise<any[]> {
    return checklistRepository.findByClientId(clientId);
  },

  async updateChecklist(
    checklistId: string,
    data: { name?: string; dueDate?: string; notes?: string; status?: string },
    userId: string,
    ip?: string
  ): Promise<any> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'completed') updateData.completedAt = new Date();
    }

    return checklistRepository.update(checklistId, updateData);
  },

  async sendReminder(checklistId: string, userId: string): Promise<void> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const checklistAny = checklist as any;
    const pendingItems = (checklistAny.items || []).filter((i: any) => i.status === 'pending');

    if (pendingItems.length === 0) {
      throw new BadRequestError('Checklist has no pending items');
    }

    const client = checklistAny.client;
    if (!client?.user?.mobile) {
      throw new BadRequestError('Client has no registered mobile number');
    }

    // Calculate urgency
    const now = new Date();
    const dueDate = checklist.dueDate ? new Date(checklist.dueDate) : new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Use dynamic import to avoid circular references
    const { reminderService } = await import('./reminder.service');

    await reminderService.sendReminder({
      checklist: checklistAny,
      client,
      pendingItems,
      daysUntilDue
    });

    await logRepository.create({
      userId,
      action: 'CHECKLIST_REMINDER_SENT' as any,
      description: `Sent manual WhatsApp reminder to ${client.user.name}`,
      entityId: checklistId,
      entityType: 'checklist'
    });
  },

  async deleteChecklist(checklistId: string, userId: string, ip?: string): Promise<void> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    await checklistRepository.delete(checklistId);

    await logRepository.create({
      userId,
      action: 'CHECKLIST_DELETED' as any,
      description: `Deleted checklist "${checklist.name}"`,
      entityId: checklistId,
      entityType: 'checklist',
      ip,
    });
  },

  // ========== CHECKLIST ITEMS ==========

  async addItem(
    checklistId: string,
    item: { label: string; description?: string; category?: string; required?: boolean },
    userId: string
  ): Promise<any> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const newItem: ChecklistItemData = {
      id: uuidv4(),
      label: item.label,
      description: item.description,
      category: item.category,
      required: item.required ?? false,
      status: 'pending',
    };

    const items = [...checklist.items, newItem];
    const { totalItems, receivedItems, progress } = this._calculateProgress(items);

    await checklistRepository.update(checklistId, { items, totalItems, receivedItems, progress });
    return checklistRepository.findById(checklistId);
  },

  async updateItemStatus(
    checklistId: string,
    itemId: string,
    status: ChecklistItemStatus,
    data: { fileId?: string; fileName?: string; rejectionReason?: string; notes?: string } = {},
    userId: string,
    ip?: string
  ): Promise<any> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const items = checklist.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          receivedDate: status === 'received' ? new Date().toISOString() : item.receivedDate,
          fileId: data.fileId || item.fileId,
          fileName: data.fileName || item.fileName,
          rejectionReason: data.rejectionReason || item.rejectionReason,
          notes: data.notes !== undefined ? data.notes : item.notes,
        };
      }
      return item;
    });

    const itemExists = checklist.items.some(item => item.id === itemId);
    if (!itemExists) throw new NotFoundError('Checklist item not found');

    const { totalItems, receivedItems, progress } = this._calculateProgress(items);

    // Auto-complete the checklist if all required items are received
    const allRequiredDone = items
      .filter(i => i.required)
      .every(i => i.status === 'received' || i.status === 'not_applicable');

    const updateData: any = { items, totalItems, receivedItems, progress };
    if (allRequiredDone && progress === 100) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    }

    await checklistRepository.update(checklistId, updateData);

    // Log the action
    const updatedItem = items.find(i => i.id === itemId);
    await logRepository.create({
      userId,
      action: 'CHECKLIST_ITEM_UPDATED' as any,
      description: `Marked "${updatedItem?.label}" as ${status} in checklist "${checklist.name}"`,
      entityId: checklistId,
      entityType: 'checklist',
      ip,
    });

    return checklistRepository.findById(checklistId);
  },

  async bulkUpdateItemStatus(
    checklistId: string,
    updates: { itemId: string; status: ChecklistItemStatus }[],
    userId: string,
    ip?: string
  ): Promise<any> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const updateMap = new Map(updates.map(u => [u.itemId, u.status]));

    const items = checklist.items.map(item => {
      const newStatus = updateMap.get(item.id);
      if (newStatus) {
        return {
          ...item,
          status: newStatus,
          receivedDate: newStatus === 'received' ? new Date().toISOString() : item.receivedDate,
        };
      }
      return item;
    });

    const { totalItems, receivedItems, progress } = this._calculateProgress(items);
    await checklistRepository.update(checklistId, { items, totalItems, receivedItems, progress });

    return checklistRepository.findById(checklistId);
  },

  async removeItem(checklistId: string, itemId: string, userId: string): Promise<any> {
    const checklist = await checklistRepository.findById(checklistId);
    if (!checklist) throw new NotFoundError('Checklist not found');

    const items = checklist.items.filter(item => item.id !== itemId);
    if (items.length === checklist.items.length) throw new NotFoundError('Item not found');

    const { totalItems, receivedItems, progress } = this._calculateProgress(items);
    await checklistRepository.update(checklistId, { items, totalItems, receivedItems, progress });

    return checklistRepository.findById(checklistId);
  },

  // ========== STATS ==========

  async getStats(clientId?: string) {
    return checklistRepository.getStats(clientId);
  },

  async getPendingDocumentsSummary(clientId?: string): Promise<any[]> {
    const where: any = { status: 'active' };
    if (clientId) where.clientId = clientId;

    const checklists = await checklistRepository.findAll(where, { page: 1, limit: 1000 });
    const pendingItems: any[] = [];

    for (const checklist of checklists.checklists) {
      const pending = checklist.items.filter((i: ChecklistItemData) => i.status === 'pending' && i.required);
      if (pending.length > 0) {
        pendingItems.push({
          checklistId: checklist.id,
          checklistName: checklist.name,
          clientId: checklist.clientId,
          clientName: (checklist as any).client?.user?.name || (checklist as any).client?.name,
          clientCode: (checklist as any).client?.code,
          financialYear: checklist.financialYear,
          pendingCount: pending.length,
          pendingItems: pending.map((p: ChecklistItemData) => ({ id: p.id, label: p.label, category: p.category })),
        });
      }
    }

    return pendingItems;
  },

  // ========== HELPERS ==========

  _calculateProgress(items: ChecklistItemData[]): {
    totalItems: number;
    receivedItems: number;
    progress: number;
  } {
    const totalItems = items.length;
    const receivedItems = items.filter(
      i => i.status === 'received' || i.status === 'not_applicable'
    ).length;
    const progress = totalItems > 0 ? Math.round((receivedItems / totalItems) * 100 * 100) / 100 : 0;
    return { totalItems, receivedItems, progress };
  },
};

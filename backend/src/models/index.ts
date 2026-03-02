import { User } from './user.model';
import { Client } from './client.model';
import { Year } from './year.model';
import { Document } from './document.model';
import { OTP } from './otp.model';
import { Log } from './log.model';
import { Folder } from './folder.model';
import { File } from './file.model';
import { DocumentVersion } from './document-version.model';
import { Checklist } from './checklist.model';
import { ChecklistTemplate } from './checklist-template.model';
import { UploadToken } from './upload-token.model';
import { ComplianceDeadline } from './compliance-deadline.model';
import { ClientDeadline } from './client-deadline.model';
import { Task } from './task.model';
import { Organization } from './organization.model';
import { Branch } from './branch.model';
import { Invoice } from './invoice.model';
import { InvoiceLineItem } from './invoice-line-item.model';
import { Payment } from './payment.model';
import { PaymentAllocation } from './payment-allocation.model';
import { AdvancePayment } from './advance-payment.model';
import { CreditNote } from './credit-note.model';
import { AuditLog } from './audit-log.model';
import { RecurringInvoiceTemplate } from './recurring-invoice-template.model';
import { PaymentSchedule } from './payment-schedule.model';
import { ClientRiskScore } from './client-risk-score.model';
import { RevenueForecast } from './revenue-forecast.model';
import { PredictiveAlert } from './predictive-alert.model';
import { NotificationTemplate } from './notification-template.model';
import { NotificationJob } from './notification-job.model';
import { InAppNotification } from './in-app-notification.model';
import { WhatsAppLog } from './whatsapp-log.model';

// Define associations
export const initializeAssociations = (): void => {
  // User -> Client (One-to-One for client role users)
  User.hasOne(Client, {
    foreignKey: 'userId',
    as: 'clientProfile',
  });

  Client.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Client -> Year (One-to-Many) - Legacy support
  Client.hasMany(Year, {
    foreignKey: 'clientId',
    as: 'years',
  });

  Year.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // Year -> Document (One-to-Many) - Legacy support
  Year.hasMany(Document, {
    foreignKey: 'yearId',
    as: 'documents',
  });

  Document.belongsTo(Year, {
    foreignKey: 'yearId',
    as: 'year',
  });

  // User -> Document (One-to-Many - uploaded by) - Legacy support
  User.hasMany(Document, {
    foreignKey: 'uploadedBy',
    as: 'uploadedDocuments',
  });

  Document.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader',
  });

  // User -> Log (One-to-Many)
  User.hasMany(Log, {
    foreignKey: 'userId',
    as: 'logs',
  });

  Log.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // ========== NEW FOLDER SYSTEM ASSOCIATIONS ==========

  // Client -> Folder (One-to-Many)
  Client.hasMany(Folder, {
    foreignKey: 'clientId',
    as: 'folders',
  });

  Folder.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // Folder -> Folder (Self-referential for hierarchy)
  Folder.hasMany(Folder, {
    foreignKey: 'parentId',
    as: 'children',
  });

  Folder.belongsTo(Folder, {
    foreignKey: 'parentId',
    as: 'parent',
  });

  // Folder -> File (One-to-Many)
  Folder.hasMany(File, {
    foreignKey: 'folderId',
    as: 'files',
  });

  File.belongsTo(Folder, {
    foreignKey: 'folderId',
    as: 'folder',
  });

  // User -> File (One-to-Many - uploaded by)
  User.hasMany(File, {
    foreignKey: 'uploadedBy',
    as: 'uploadedFiles',
  });

  File.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader',
  });

  // Document -> DocumentVersion (One-to-Many)
  Document.hasMany(DocumentVersion, {
    foreignKey: 'documentId',
    as: 'versions',
  });

  DocumentVersion.belongsTo(Document, {
    foreignKey: 'documentId',
    as: 'document',
  });

  // User -> DocumentVersion (One-to-Many - created by)
  User.hasMany(DocumentVersion, {
    foreignKey: 'createdBy',
    as: 'createdVersions',
  });

  DocumentVersion.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // ========== CHECKLIST SYSTEM ASSOCIATIONS ==========

  // Client -> Checklist (One-to-Many)
  Client.hasMany(Checklist, {
    foreignKey: 'clientId',
    as: 'checklists',
  });

  Checklist.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // User -> Checklist (One-to-Many - created by)
  User.hasMany(Checklist, {
    foreignKey: 'createdBy',
    as: 'createdChecklists',
  });

  Checklist.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // ChecklistTemplate -> Checklist (One-to-Many)
  ChecklistTemplate.hasMany(Checklist, {
    foreignKey: 'templateId',
    as: 'checklists',
  });

  Checklist.belongsTo(ChecklistTemplate, {
    foreignKey: 'templateId',
    as: 'template',
  });

  // User -> ChecklistTemplate (One-to-Many - created by)
  User.hasMany(ChecklistTemplate, {
    foreignKey: 'createdBy',
    as: 'createdTemplates',
  });

  ChecklistTemplate.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // ========== UPLOAD TOKEN ASSOCIATIONS ==========

  // Checklist -> UploadToken (One-to-Many)
  Checklist.hasMany(UploadToken, {
    foreignKey: 'checklistId',
    as: 'uploadTokens',
  });

  UploadToken.belongsTo(Checklist, {
    foreignKey: 'checklistId',
    as: 'checklist',
  });

  // Client -> UploadToken (One-to-Many)
  Client.hasMany(UploadToken, {
    foreignKey: 'clientId',
    as: 'uploadTokens',
  });

  UploadToken.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // ========== COMPLIANCE CALENDAR ASSOCIATIONS ==========

  // ComplianceDeadline -> ClientDeadline (One-to-Many)
  ComplianceDeadline.hasMany(ClientDeadline, {
    foreignKey: 'deadlineId',
    as: 'clientDeadlines',
  });

  ClientDeadline.belongsTo(ComplianceDeadline, {
    foreignKey: 'deadlineId',
    as: 'deadline',
  });

  // Client -> ClientDeadline (One-to-Many)
  Client.hasMany(ClientDeadline, {
    foreignKey: 'clientId',
    as: 'clientDeadlines',
  });

  ClientDeadline.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // ========== TASK SYSTEM ASSOCIATIONS ==========

  // User -> Task (One-to-Many - created by)
  User.hasMany(Task, {
    foreignKey: 'createdBy',
    as: 'createdTasks',
  });

  Task.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // User -> Task (One-to-Many - assigned to)
  User.hasMany(Task, {
    foreignKey: 'assignedTo',
    as: 'assignedTasks',
  });

  Task.belongsTo(User, {
    foreignKey: 'assignedTo',
    as: 'assignee',
  });

  // Client -> Task (One-to-Many)
  Client.hasMany(Task, {
    foreignKey: 'clientId',
    as: 'tasks',
  });

  Task.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // ========== INVOICE SYSTEM ASSOCIATIONS ==========

  Organization.hasMany(Branch, { foreignKey: 'organizationId', as: 'branches' });
  Branch.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Organization.hasMany(Client, { foreignKey: 'organizationId', as: 'clients' });
  Client.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
  User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Invoice.hasMany(InvoiceLineItem, { foreignKey: 'invoiceId', as: 'lineItems' });
  InvoiceLineItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

  Invoice.hasMany(PaymentAllocation, { foreignKey: 'invoiceId', as: 'allocations' });
  PaymentAllocation.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

  Payment.hasMany(PaymentAllocation, { foreignKey: 'paymentId', as: 'allocations' });
  PaymentAllocation.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

  Client.hasMany(Invoice, { foreignKey: 'clientId', as: 'invoices' });
  Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

  AdvancePayment.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

  Invoice.hasMany(CreditNote, { foreignKey: 'invoiceId', as: 'creditNotes' });
  CreditNote.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

  Organization.hasMany(RecurringInvoiceTemplate, { foreignKey: 'organizationId', as: 'recurringTemplates' });
  RecurringInvoiceTemplate.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Client.hasMany(RecurringInvoiceTemplate, { foreignKey: 'clientId', as: 'recurringTemplates' });
  RecurringInvoiceTemplate.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

  Invoice.hasMany(PaymentSchedule, { foreignKey: 'invoiceId', as: 'paymentSchedules' });
  PaymentSchedule.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

  // ========== INTELLIGENCE ASSOCIATIONS ==========
  Organization.hasMany(ClientRiskScore, { foreignKey: 'organizationId', as: 'riskScores' });
  ClientRiskScore.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Client.hasMany(ClientRiskScore, { foreignKey: 'clientId', as: 'riskScores' });
  ClientRiskScore.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

  Organization.hasMany(RevenueForecast, { foreignKey: 'organizationId', as: 'revenueForecasts' });
  RevenueForecast.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Organization.hasMany(PredictiveAlert, { foreignKey: 'organizationId', as: 'predictiveAlerts' });
  PredictiveAlert.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

  Client.hasMany(PredictiveAlert, { foreignKey: 'clientId', as: 'predictiveAlerts' });
  PredictiveAlert.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
};

// Export all models
export { User } from './user.model';
export { Client } from './client.model';
export { Year } from './year.model';
export { Document } from './document.model';
export { OTP } from './otp.model';
export { Log } from './log.model';
export { Folder } from './folder.model';
export { File } from './file.model';
export { DocumentVersion } from './document-version.model';
export { Checklist } from './checklist.model';
export { ChecklistTemplate } from './checklist-template.model';
export { UploadToken } from './upload-token.model';
export { ComplianceDeadline } from './compliance-deadline.model';
export { ClientDeadline } from './client-deadline.model';
export { Task } from './task.model';
export { Organization } from './organization.model';
export { Branch } from './branch.model';
export { Invoice } from './invoice.model';
export { InvoiceLineItem } from './invoice-line-item.model';
export { Payment } from './payment.model';
export { PaymentAllocation } from './payment-allocation.model';
export { AdvancePayment } from './advance-payment.model';
export { CreditNote } from './credit-note.model';
export { AuditLog } from './audit-log.model';
export { RecurringInvoiceTemplate } from './recurring-invoice-template.model';
export { PaymentSchedule } from './payment-schedule.model';
export { ClientRiskScore } from './client-risk-score.model';
export { RevenueForecast } from './revenue-forecast.model';
export { PredictiveAlert } from './predictive-alert.model';
export { NotificationTemplate } from './notification-template.model';
export { NotificationJob } from './notification-job.model';
export { InAppNotification } from './in-app-notification.model';
export { WhatsAppLog } from './whatsapp-log.model';

// Export types
export type { UserAttributes, UserCreationAttributes, UserRole } from './user.model';
export type { ClientAttributes, ClientCreationAttributes } from './client.model';
export type { YearAttributes, YearCreationAttributes } from './year.model';
export type { DocumentAttributes, DocumentCreationAttributes } from './document.model';
export type { OTPAttributes, OTPCreationAttributes } from './otp.model';
export type { LogAttributes, LogCreationAttributes, LogAction } from './log.model';
export type { FolderAttributes, FolderCreationAttributes, FolderType } from './folder.model';
export type { FileAttributes, FileCreationAttributes } from './file.model';
export type { DocumentVersionAttributes, DocumentVersionCreationAttributes } from './document-version.model';
export type { ChecklistAttributes, ChecklistCreationAttributes, ChecklistItemData, ChecklistItemStatus } from './checklist.model';
export type { ChecklistTemplateAttributes, ChecklistTemplateCreationAttributes, ChecklistTemplateItem, ServiceType } from './checklist-template.model';
export type { UploadTokenAttributes, UploadTokenCreationAttributes } from './upload-token.model';
export type { ComplianceDeadlineAttributes, ComplianceDeadlineCreationAttributes, DeadlineType } from './compliance-deadline.model';
export type { ClientDeadlineAttributes, ClientDeadlineCreationAttributes, ClientDeadlineStatus } from './client-deadline.model';
export type { TaskAttributes, TaskCreationAttributes, TaskPriority, TaskStatus } from './task.model';
export type { OrganizationAttributes, OrganizationCreationAttributes } from './organization.model';
export type { BranchAttributes, BranchCreationAttributes } from './branch.model';
export type { InvoiceAttributes, InvoiceCreationAttributes, InvoiceStatus } from './invoice.model';
export type { InvoiceLineItemAttributes, InvoiceLineItemCreationAttributes } from './invoice-line-item.model';
export type { PaymentAttributes, PaymentCreationAttributes, PaymentType } from './payment.model';
export type { PaymentAllocationAttributes, PaymentAllocationCreationAttributes, AllocationType } from './payment-allocation.model';
export type { AdvancePaymentAttributes, AdvancePaymentCreationAttributes, AdvancePaymentStatus } from './advance-payment.model';
export type { CreditNoteAttributes, CreditNoteCreationAttributes, CreditNoteReason } from './credit-note.model';
export type { AuditLogAttributes, AuditLogCreationAttributes, EntityType } from './audit-log.model';
export type { RecurringInvoiceTemplateAttributes, RecurringInvoiceTemplateCreationAttributes, RecurringFrequency } from './recurring-invoice-template.model';
export type { PaymentScheduleAttributes, PaymentScheduleCreationAttributes, PaymentScheduleStatus } from './payment-schedule.model';
export type { ClientRiskScoreAttributes, ClientRiskScoreCreationAttributes, RiskLevel } from './client-risk-score.model';
export type { RevenueForecastAttributes, RevenueForecastCreationAttributes } from './revenue-forecast.model';
export type { PredictiveAlertAttributes, PredictiveAlertCreationAttributes, AlertSeverity, AlertType } from './predictive-alert.model';
export type { NotificationTemplateAttributes, NotificationTemplateCreationAttributes, NotificationChannel } from './notification-template.model';
export type { NotificationJobAttributes, NotificationJobCreationAttributes, JobStatus, RecipientType } from './notification-job.model';
export type { InAppNotificationAttributes, InAppNotificationCreationAttributes } from './in-app-notification.model';
export type { WhatsAppLogAttributes, WhatsAppLogCreationAttributes } from './whatsapp-log.model';

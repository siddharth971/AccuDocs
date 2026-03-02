import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'OVERDUE' | 'CLOSED' | 'CANCELLED';

export interface InvoiceAttributes {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  branchId: string;
  clientId: string;
  invoiceDate: Date;
  dueDate: Date;
  financialYear: string;
  status: InvoiceStatus;
  referenceNumber?: string;
  descriptionOfService?: string;
  serviceCategory?: string;
  sacCode?: string;
  gstSlab: number;
  isSameState: boolean;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  outstandingAmount: number;
  lastPaymentDate?: Date;
  lastReminderSentAt?: Date;
  notes?: string;
  internalNotes?: string;
  isLocked: boolean;
  lockedAt?: Date;
  sentAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'id' | 'status' | 'amountPaid' | 'isLocked' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
  declare public id: string;
  declare public invoiceNumber: string;
  declare public organizationId: string;
  declare public branchId: string;
  declare public clientId: string;
  declare public invoiceDate: Date;
  declare public dueDate: Date;
  declare public financialYear: string;
  declare public status: InvoiceStatus;
  declare public referenceNumber?: string;
  declare public descriptionOfService?: string;
  declare public serviceCategory?: string;
  declare public sacCode?: string;
  declare public gstSlab: number;
  declare public isSameState: boolean;
  declare public subtotal: number;
  declare public cgstAmount: number;
  declare public sgstAmount: number;
  declare public igstAmount: number;
  declare public totalTax: number;
  declare public grandTotal: number;
  declare public amountPaid: number;
  declare public outstandingAmount: number;
  declare public lastPaymentDate?: Date;
  declare public lastReminderSentAt?: Date;
  declare public notes?: string;
  declare public internalNotes?: string;
  declare public isLocked: boolean;
  declare public lockedAt?: Date;
  declare public sentAt?: Date;
  declare public cancelledAt?: Date;
  declare public cancellationReason?: string;
  declare public createdBy?: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  declare public readonly organization?: any;
  declare public readonly branch?: any;
  declare public readonly client?: any;
  declare public readonly creator?: any;
  declare public readonly lineItems?: any[];
  declare public readonly creditNotes?: any[];
  declare public readonly payments?: any[];
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'invoice_number',
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'organizations', key: 'id' },
      field: 'organization_id',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'branches', key: 'id' },
      field: 'branch_id',
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clients', key: 'id' },
      field: 'client_id',
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'invoice_date',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'due_date',
    },
    financialYear: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'financial_year',
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'reference_number',
    },
    descriptionOfService: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_of_service',
    },
    serviceCategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'service_category',
    },
    sacCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'sac_code',
    },
    gstSlab: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'gst_slab',
    },
    isSameState: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_same_state',
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    cgstAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'cgst_amount',
    },
    sgstAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'sgst_amount',
    },
    igstAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'igst_amount',
    },
    totalTax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'total_tax',
    },
    grandTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'grand_total',
    },
    amountPaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'amount_paid',
    },
    outstandingAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'outstanding_amount',
    },
    lastPaymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'last_payment_date',
    },
    lastReminderSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_reminder_sent_at',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'internal_notes',
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_locked',
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'locked_at',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at',
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cancellation_reason',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'created_by',
    },
  },
  {
    sequelize,
    tableName: 'invoices',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['organization_id', 'invoice_number'], unique: true, where: { deleted_at: null } },
      { fields: ['organization_id', 'client_id'] },
      { fields: ['organization_id', 'status', 'due_date'] },
      { fields: ['outstanding_amount'] }, // For sorting DESC
    ],
  }
);

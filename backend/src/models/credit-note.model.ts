import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type CreditNoteReason = 'SERVICE_DISCOUNT' | 'CANCELLATION' | 'BILLING_ERROR' | 'GST_CORRECTION';

export interface CreditNoteAttributes {
  id: string;
  creditNoteNumber: string;
  organizationId: string;
  branchId: string;
  clientId: string;
  invoiceId: string;
  creditDate: Date;
  financialYear: string;
  reason: CreditNoteReason;
  reasonDescription?: string;
  creditAmount: number;
  gstImpact: boolean;
  cgstReduction: number;
  sgstReduction: number;
  igstReduction: number;
  totalTaxReduction: number;
  createdBy?: string;
  approvedBy?: string;
  approvalDate?: Date;
  isApproved: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreditNoteCreationAttributes extends Optional<CreditNoteAttributes, 'id' | 'isApproved' | 'createdAt' | 'updatedAt'> { }

export class CreditNote extends Model<CreditNoteAttributes, CreditNoteCreationAttributes> implements CreditNoteAttributes {
  declare public id: string;
  declare public creditNoteNumber: string;
  declare public organizationId: string;
  declare public branchId: string;
  declare public clientId: string;
  declare public invoiceId: string;
  declare public creditDate: Date;
  declare public financialYear: string;
  declare public reason: CreditNoteReason;
  declare public reasonDescription?: string;
  declare public creditAmount: number;
  declare public gstImpact: boolean;
  declare public cgstReduction: number;
  declare public sgstReduction: number;
  declare public igstReduction: number;
  declare public totalTaxReduction: number;
  declare public createdBy?: string;
  declare public approvedBy?: string;
  declare public approvalDate?: Date;
  declare public isApproved: boolean;
  declare public notes?: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
  declare public readonly branch?: any;
  declare public readonly client?: any;
  declare public readonly invoice?: any;
  declare public readonly creator?: any;
  declare public readonly approver?: any;
}

CreditNote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    creditNoteNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'credit_note_number',
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
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'invoices', key: 'id' },
      field: 'invoice_id',
    },
    creditDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'credit_date',
    },
    financialYear: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'financial_year',
    },
    reason: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    reasonDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reason_description',
    },
    creditAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'credit_amount',
    },
    gstImpact: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'gst_impact',
    },
    cgstReduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'cgst_reduction',
    },
    sgstReduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'sgst_reduction',
    },
    igstReduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'igst_reduction',
    },
    totalTaxReduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_tax_reduction',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'created_by',
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'approved_by',
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approval_date',
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_approved',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'credit_notes',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'credit_note_number'], unique: true },
      { fields: ['invoice_id'] },
      { fields: ['organization_id', 'client_id'] },
    ],
  }
);

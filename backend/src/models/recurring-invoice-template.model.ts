import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type RecurringFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

export interface RecurringInvoiceTemplateAttributes {
  id: string;
  organizationId: string;
  clientId: string;
  branchId: string;
  templateName: string;
  serviceCategory: string;
  recurringFrequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  subtotal: number;
  gstSlab: number;
  dueDateOffset: number; // in days
  autoIssue: boolean;
  isActive: boolean;
  nextInvoiceDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface RecurringInvoiceTemplateCreationAttributes extends Optional<RecurringInvoiceTemplateAttributes, 'id' | 'endDate' | 'autoIssue' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class RecurringInvoiceTemplate extends Model<RecurringInvoiceTemplateAttributes, RecurringInvoiceTemplateCreationAttributes> implements RecurringInvoiceTemplateAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public clientId: string;
  declare public branchId: string;
  declare public templateName: string;
  declare public serviceCategory: string;
  declare public recurringFrequency: RecurringFrequency;
  declare public startDate: Date;
  declare public endDate?: Date;
  declare public subtotal: number;
  declare public gstSlab: number;
  declare public dueDateOffset: number;
  declare public autoIssue: boolean;
  declare public isActive: boolean;
  declare public nextInvoiceDate: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  declare public readonly organization?: any;
  declare public readonly client?: any;
  declare public readonly branch?: any;
}

RecurringInvoiceTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'organizations', key: 'id' },
      field: 'organization_id',
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clients', key: 'id' },
      field: 'client_id',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'branches', key: 'id' },
      field: 'branch_id',
    },
    templateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'template_name',
    },
    serviceCategory: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'service_category',
    },
    recurringFrequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'recurring_frequency', // MONTHLY, QUARTERLY, etc
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'end_date',
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    gstSlab: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'gst_slab',
    },
    dueDateOffset: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'due_date_offset',
    },
    autoIssue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_issue',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    nextInvoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'next_invoice_date',
    },
  },
  {
    sequelize,
    tableName: 'recurring_invoice_templates',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['organization_id', 'is_active', 'next_invoice_date'] },
      { fields: ['client_id'] },
    ],
  }
);

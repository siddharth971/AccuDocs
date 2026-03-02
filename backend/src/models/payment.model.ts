import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type PaymentType = 'INVOICE_PAYMENT' | 'ADVANCE_PAYMENT' | 'CREDIT_NOTE_ADJUSTMENT';

export interface PaymentAttributes {
  id: string;
  organizationId: string;
  clientId: string;
  invoiceId?: string; // Nullable for advances
  paymentType: PaymentType;
  amount: number;
  paymentDate: Date;
  receivedDate: Date;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: string;
  isReversed: boolean;
  reversalDate?: Date;
  reversalReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'isReversed' | 'createdAt' | 'updatedAt'> { }

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public clientId: string;
  declare public invoiceId?: string;
  declare public paymentType: PaymentType;
  declare public amount: number;
  declare public paymentDate: Date;
  declare public receivedDate: Date;
  declare public paymentMethod?: string;
  declare public referenceNumber?: string;
  declare public notes?: string;
  declare public recordedBy?: string;
  declare public isReversed: boolean;
  declare public reversalDate?: Date;
  declare public reversalReason?: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
  declare public readonly client?: any;
  declare public readonly invoice?: any;
  declare public readonly recorder?: any;
  declare public readonly allocations?: any[];
}

Payment.init(
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
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: true, // true for advance payments
      references: { model: 'invoices', key: 'id' },
      field: 'invoice_id',
    },
    paymentType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'payment_type',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'payment_date',
    },
    receivedDate: {
      type: DataTypes.DATE, // Usually datetime block for tracking specific bank rec timestamp
      allowNull: false,
      field: 'received_date',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_method',
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'reference_number',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recordedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'recorded_by',
    },
    isReversed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_reversed',
    },
    reversalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reversal_date',
    },
    reversalReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reversal_reason',
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'client_id', 'payment_date'] }, // Custom index requested
      { fields: ['invoice_id', 'payment_date'] },
      { fields: ['reference_number'] }, // Good for searching UTRs
    ],
  }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type PaymentScheduleStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';

export interface PaymentScheduleAttributes {
  id: string;
  invoiceId: string;
  scheduledPaymentNumber: number;
  dueDate: Date;
  amountDue: number;
  amountPaid: number;
  status: PaymentScheduleStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentScheduleCreationAttributes extends Optional<PaymentScheduleAttributes, 'id' | 'amountPaid' | 'status' | 'createdAt' | 'updatedAt'> { }

export class PaymentSchedule extends Model<PaymentScheduleAttributes, PaymentScheduleCreationAttributes> implements PaymentScheduleAttributes {
  declare public id: string;
  declare public invoiceId: string;
  declare public scheduledPaymentNumber: number;
  declare public dueDate: Date;
  declare public amountDue: number;
  declare public amountPaid: number;
  declare public status: PaymentScheduleStatus;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly invoice?: any;
}

PaymentSchedule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'invoices', key: 'id' },
      field: 'invoice_id',
    },
    scheduledPaymentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'scheduled_payment_number',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'due_date',
    },
    amountDue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'amount_due',
    },
    amountPaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'amount_paid',
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'payment_schedules',
    timestamps: true,
    indexes: [
      { fields: ['invoice_id', 'scheduled_payment_number'], unique: true },
    ],
  }
);

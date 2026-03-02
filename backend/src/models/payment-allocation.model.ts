import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type AllocationType = 'MANUAL' | 'AUTOMATIC_FIFO' | 'AUTOMATIC_SMART';

export interface PaymentAllocationAttributes {
  id: string;
  paymentId: string;
  invoiceId: string;
  allocatedAmount: number;
  allocationDate: Date;
  allocationType: AllocationType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentAllocationCreationAttributes extends Optional<PaymentAllocationAttributes, 'id' | 'allocationType' | 'createdAt' | 'updatedAt'> { }

export class PaymentAllocation extends Model<PaymentAllocationAttributes, PaymentAllocationCreationAttributes> implements PaymentAllocationAttributes {
  declare public id: string;
  declare public paymentId: string;
  declare public invoiceId: string;
  declare public allocatedAmount: number;
  declare public allocationDate: Date;
  declare public allocationType: AllocationType;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly payment?: any;
  declare public readonly invoice?: any;
}

PaymentAllocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'payments', key: 'id' },
      field: 'payment_id',
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'invoices', key: 'id' },
      field: 'invoice_id',
    },
    allocatedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'allocated_amount',
    },
    allocationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'allocation_date',
    },
    allocationType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'MANUAL',
      field: 'allocation_type',
    },
  },
  {
    sequelize,
    tableName: 'payment_allocations',
    timestamps: true,
    indexes: [
      { fields: ['payment_id'] },
      { fields: ['invoice_id'] },
    ],
  }
);

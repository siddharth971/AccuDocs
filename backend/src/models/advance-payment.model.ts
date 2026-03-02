import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type AdvancePaymentStatus = 'RECEIVED' | 'PARTIALLY_USED' | 'FULLY_USED' | 'EXPIRED';

export interface AdvancePaymentAttributes {
  id: string;
  organizationId: string;
  clientId: string;
  paymentId: string; // Links to the actual payment record
  advanceAmount: number;
  receivedDate: Date;
  receivedBy?: string;
  description?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  status: AdvancePaymentStatus;
  usedAmount: number;
  remainingAmount: number;
  expiryDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdvancePaymentCreationAttributes extends Optional<AdvancePaymentAttributes, 'id' | 'status' | 'usedAmount' | 'createdAt' | 'updatedAt'> { }

export class AdvancePayment extends Model<AdvancePaymentAttributes, AdvancePaymentCreationAttributes> implements AdvancePaymentAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public clientId: string;
  declare public paymentId: string;
  declare public advanceAmount: number;
  declare public receivedDate: Date;
  declare public receivedBy?: string;
  declare public description?: string;
  declare public paymentMethod?: string;
  declare public referenceNumber?: string;
  declare public status: AdvancePaymentStatus;
  declare public usedAmount: number;
  declare public remainingAmount: number;
  declare public expiryDate: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
  declare public readonly client?: any;
  declare public readonly payment?: any;
  declare public readonly receiver?: any;
}

AdvancePayment.init(
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
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'payments', key: 'id' },
      field: 'payment_id',
    },
    advanceAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'advance_amount',
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'received_date',
    },
    receivedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'received_by',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'RECEIVED',
    },
    usedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'used_amount',
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'remaining_amount',
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'expiry_date',
    },
  },
  {
    sequelize,
    tableName: 'advance_payments',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'client_id', 'status'] },
      { fields: ['expiry_date'] },
      { fields: ['payment_id'] },
    ],
  }
);

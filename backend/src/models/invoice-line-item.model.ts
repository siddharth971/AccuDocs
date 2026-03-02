import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface InvoiceLineItemAttributes {
  id: string;
  invoiceId: string;
  lineItemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceLineItemCreationAttributes extends Optional<InvoiceLineItemAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class InvoiceLineItem extends Model<InvoiceLineItemAttributes, InvoiceLineItemCreationAttributes> implements InvoiceLineItemAttributes {
  declare public id: string;
  declare public invoiceId: string;
  declare public lineItemNumber: number;
  declare public description: string;
  declare public quantity: number;
  declare public unitPrice: number;
  declare public amount: number;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly invoice?: any;
}

InvoiceLineItem.init(
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
    lineItemNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'line_item_number',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2), // Some items could be 1.5 units
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'unit_price',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'invoice_line_items',
    timestamps: true,
    indexes: [
      { fields: ['invoice_id'] },
    ],
  }
);

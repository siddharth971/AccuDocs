import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface BranchAttributes {
  id: string;
  organizationId: string;
  branchCode: string;
  name: string;
  gstin?: string;
  address?: string;
  phone?: string;
  email?: string;
  invoiceSeriesPrefix: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface BranchCreationAttributes extends Optional<BranchAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Branch extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public branchCode: string;
  declare public name: string;
  declare public gstin?: string;
  declare public address?: string;
  declare public phone?: string;
  declare public email?: string;
  declare public invoiceSeriesPrefix: string;
  declare public isActive: boolean;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  declare public readonly organization?: any;
}

Branch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      field: 'organization_id',
    },
    branchCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'branch_code',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    gstin: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    invoiceSeriesPrefix: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'invoice_series_prefix',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'branches',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['organization_id', 'branch_code'], unique: true, where: { deleted_at: null } },
      { fields: ['organization_id', 'invoice_series_prefix'], unique: true, where: { deleted_at: null } },
      { fields: ['organization_id'] },
    ],
  }
);

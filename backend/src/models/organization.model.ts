import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface OrganizationAttributes {
  id: string;
  name: string;
  registrationNumber?: string;
  primaryGstin?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  financialYearStart: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'financialYearStart' | 'isActive' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
  declare public id: string;
  declare public name: string;
  declare public registrationNumber?: string;
  declare public primaryGstin?: string;
  declare public address?: string;
  declare public city?: string;
  declare public state?: string;
  declare public country?: string;
  declare public phone?: string;
  declare public email?: string;
  declare public financialYearStart: number;
  declare public isActive: boolean;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  declare public readonly branches?: any[];
  declare public readonly users?: any[];
  declare public readonly clients?: any[];
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    registrationNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      field: 'registration_number',
    },
    primaryGstin: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: 'primary_gstin',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'India',
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
    financialYearStart: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4, // Default April
      field: 'financial_year_start',
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
    tableName: 'organizations',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['registration_number'], unique: true, where: { deleted_at: null } },
      { fields: ['is_active'] },
    ],
  }
);

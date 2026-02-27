import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type DeadlineType = 'ITR' | 'GST' | 'TDS' | 'ROC' | 'ADVANCE_TAX' | 'OTHER';

export interface ComplianceDeadlineAttributes {
  id: string;
  type: DeadlineType;
  title: string;
  dueDate: Date;
  recurring: boolean;
  recurringPattern?: string; // e.g., 'monthly', 'quarterly', 'yearly'
  description?: string;
  isSeeded: boolean; // true for pre-seeded deadlines
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComplianceDeadlineCreationAttributes extends Optional<ComplianceDeadlineAttributes, 'id' | 'recurringPattern' | 'description' | 'isSeeded' | 'createdAt' | 'updatedAt'> { }

export class ComplianceDeadline extends Model<ComplianceDeadlineAttributes, ComplianceDeadlineCreationAttributes> implements ComplianceDeadlineAttributes {
  declare public id: string;
  declare public type: DeadlineType;
  declare public title: string;
  declare public dueDate: Date;
  declare public recurring: boolean;
  declare public recurringPattern?: string;
  declare public description?: string;
  declare public isSeeded: boolean;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

ComplianceDeadline.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('ITR', 'GST', 'TDS', 'ROC', 'ADVANCE_TAX', 'OTHER'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'due_date',
    },
    recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recurringPattern: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'recurring_pattern',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isSeeded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_seeded',
    },
  },
  {
    sequelize,
    tableName: 'compliance_deadlines',
    timestamps: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['due_date'] },
      { fields: ['is_seeded'] },
    ],
  }
);

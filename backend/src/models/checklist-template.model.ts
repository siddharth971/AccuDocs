import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type ServiceType = 'itr' | 'gst' | 'audit' | 'roc' | 'tds' | 'custom';

export interface ChecklistTemplateAttributes {
  id: string;
  name: string;
  serviceType: ServiceType;
  description?: string;
  items: ChecklistTemplateItem[];
  isDefault: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChecklistTemplateItem {
  label: string;
  description?: string;
  required: boolean;
  category?: string;
}

export interface ChecklistTemplateCreationAttributes
  extends Optional<ChecklistTemplateAttributes, 'id' | 'description' | 'isDefault' | 'createdBy' | 'createdAt' | 'updatedAt'> { }

export class ChecklistTemplate extends Model<ChecklistTemplateAttributes, ChecklistTemplateCreationAttributes>
  implements ChecklistTemplateAttributes {
  declare public id: string;
  declare public name: string;
  declare public serviceType: ServiceType;
  declare public description?: string;
  declare public items: ChecklistTemplateItem[];
  declare public isDefault: boolean;
  declare public createdBy?: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  declare public readonly creator?: any;
}

ChecklistTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    serviceType: {
      type: DataTypes.ENUM('itr', 'gst', 'audit', 'roc', 'tds', 'custom'),
      allowNull: false,
      field: 'service_type',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'created_by',
    },
  },
  {
    sequelize,
    tableName: 'checklist_templates',
    timestamps: true,
    indexes: [
      { fields: ['service_type'] },
      { fields: ['is_default'] },
      { fields: ['created_by'] },
    ],
  }
);

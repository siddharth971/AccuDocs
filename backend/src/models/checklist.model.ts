import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type ChecklistItemStatus = 'pending' | 'received' | 'not_applicable' | 'rejected';

export interface ChecklistItemData {
  id: string;
  label: string;
  description?: string;
  category?: string;
  required: boolean;
  status: ChecklistItemStatus;
  receivedDate?: string;
  fileId?: string;
  fileName?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ChecklistAttributes {
  id: string;
  clientId: string;
  templateId?: string;
  name: string;
  financialYear: string;
  serviceType: string;
  items: ChecklistItemData[];
  progress: number;
  totalItems: number;
  receivedItems: number;
  status: 'active' | 'completed' | 'archived';
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ChecklistCreationAttributes
  extends Optional<ChecklistAttributes, 'id' | 'templateId' | 'progress' | 'totalItems' | 'receivedItems' | 'status' | 'dueDate' | 'completedAt' | 'notes' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Checklist extends Model<ChecklistAttributes, ChecklistCreationAttributes>
  implements ChecklistAttributes {
  declare public id: string;
  declare public clientId: string;
  declare public templateId?: string;
  declare public name: string;
  declare public financialYear: string;
  declare public serviceType: string;
  declare public items: ChecklistItemData[];
  declare public progress: number;
  declare public totalItems: number;
  declare public receivedItems: number;
  declare public status: 'active' | 'completed' | 'archived';
  declare public dueDate?: Date;
  declare public completedAt?: Date;
  declare public notes?: string;
  declare public createdBy: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  // Associations
  declare public readonly client?: any;
  declare public readonly creator?: any;
  declare public readonly template?: any;
}

Checklist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
      field: 'client_id',
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'checklist_templates',
        key: 'id',
      },
      field: 'template_id',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    financialYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'financial_year',
    },
    serviceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'service_type',
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    progress: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    totalItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_items',
    },
    receivedItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'received_items',
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'archived'),
      allowNull: false,
      defaultValue: 'active',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'created_by',
    },
  },
  {
    sequelize,
    tableName: 'checklists',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['client_id'] },
      { fields: ['template_id'] },
      { fields: ['financial_year'] },
      { fields: ['service_type'] },
      { fields: ['status'] },
      { fields: ['due_date'] },
      { fields: ['created_by'] },
      { fields: ['client_id', 'financial_year', 'service_type'] },
    ],
  }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface TaskAttributes {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  assignedTo?: string;
  createdBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  tags: string[];
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'description' | 'clientId' | 'assignedTo' | 'priority' | 'status' | 'tags' | 'completedAt' | 'dueDate' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare public id: string;
  declare public title: string;
  declare public description?: string;
  declare public clientId?: string;
  declare public assignedTo?: string;
  declare public createdBy: string;
  declare public priority: TaskPriority;
  declare public status: TaskStatus;
  declare public dueDate?: Date;
  declare public tags: string[];
  declare public completedAt?: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  // Associations
  declare public readonly client?: any;
  declare public readonly assignee?: any;
  declare public readonly creator?: any;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
      field: 'client_id',
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'assigned_to',
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
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'review', 'done'),
      allowNull: false,
      defaultValue: 'todo',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date',
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['client_id'] },
      { fields: ['assigned_to'] },
      { fields: ['created_by'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['due_date'] },
      { fields: ['deleted_at'], where: { deleted_at: null } },
    ],
  }
);

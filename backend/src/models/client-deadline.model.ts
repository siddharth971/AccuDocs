import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type ClientDeadlineStatus = 'pending' | 'filed' | 'overdue';

export interface ClientDeadlineAttributes {
  id: string;
  clientId: string;
  deadlineId: string;
  status: ClientDeadlineStatus;
  filedDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientDeadlineCreationAttributes extends Optional<ClientDeadlineAttributes, 'id' | 'status' | 'filedDate' | 'notes' | 'createdAt' | 'updatedAt'> { }

export class ClientDeadline extends Model<ClientDeadlineAttributes, ClientDeadlineCreationAttributes> implements ClientDeadlineAttributes {
  declare public id: string;
  declare public clientId: string;
  declare public deadlineId: string;
  declare public status: ClientDeadlineStatus;
  declare public filedDate?: Date;
  declare public notes?: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  declare public readonly client?: any;
  declare public readonly deadline?: any;
}

ClientDeadline.init(
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
    deadlineId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'compliance_deadlines',
        key: 'id',
      },
      field: 'deadline_id',
    },
    status: {
      type: DataTypes.ENUM('pending', 'filed', 'overdue'),
      allowNull: false,
      defaultValue: 'pending',
    },
    filedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'filed_date',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'client_deadlines',
    timestamps: true,
    indexes: [
      { fields: ['client_id'] },
      { fields: ['deadline_id'] },
      { fields: ['status'] },
      { fields: ['client_id', 'deadline_id'], unique: true },
    ],
  }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface InAppNotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InAppNotificationCreationAttributes extends Optional<InAppNotificationAttributes, 'id' | 'isRead' | 'createdAt' | 'updatedAt'> { }

export class InAppNotification extends Model<InAppNotificationAttributes, InAppNotificationCreationAttributes> implements InAppNotificationAttributes {
  declare public id: string;
  declare public userId: string;
  declare public title: string;
  declare public message: string;
  declare public entityType?: string;
  declare public entityId?: string;
  declare public isRead: boolean;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly user?: any;
}

InAppNotification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'entity_id',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },
  },
  {
    sequelize,
    tableName: 'in_app_notifications',
    timestamps: true,
    indexes: [
      { fields: ['user_id', 'is_read'] },
    ],
  }
);

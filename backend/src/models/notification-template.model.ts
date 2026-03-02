import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'IN_APP';

export interface NotificationTemplateAttributes {
  id: string;
  organizationId: string;
  notificationType: string;
  channel: NotificationChannel;
  templateName: string;
  subject?: string;
  bodyTemplate: string;
  isEnabled: boolean;
  retryCount: number;
  retryDelayMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationTemplateCreationAttributes extends Optional<NotificationTemplateAttributes, 'id' | 'isEnabled' | 'retryCount' | 'retryDelayMinutes' | 'createdAt' | 'updatedAt'> { }

export class NotificationTemplate extends Model<NotificationTemplateAttributes, NotificationTemplateCreationAttributes> implements NotificationTemplateAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public notificationType: string;
  declare public channel: NotificationChannel;
  declare public templateName: string;
  declare public subject?: string;
  declare public bodyTemplate: string;
  declare public isEnabled: boolean;
  declare public retryCount: number;
  declare public retryDelayMinutes: number;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
}

NotificationTemplate.init(
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
    notificationType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'notification_type',
    },
    channel: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    templateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'template_name',
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bodyTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'body_template',
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_enabled',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      field: 'retry_count',
    },
    retryDelayMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: 'retry_delay_minutes',
    },
  },
  {
    sequelize,
    tableName: 'notification_templates',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'notification_type', 'is_enabled'] },
    ],
  }
);

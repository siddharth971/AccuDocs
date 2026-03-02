import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { NotificationChannel } from './notification-template.model';

export type JobStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';
export type RecipientType = 'CLIENT' | 'TEAM' | 'USER';

export interface NotificationJobAttributes {
  id: string;
  notificationEventId: string;
  recipientType: RecipientType;
  recipientContact?: string;
  recipientUserIds?: string[];
  channel: NotificationChannel;
  status: JobStatus;
  retryCount: number;
  maxRetries: number;
  retryDelayMinutes: number;
  nextRetryAt?: Date;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationJobCreationAttributes extends Optional<NotificationJobAttributes, 'id' | 'retryCount' | 'status' | 'createdAt' | 'updatedAt'> { }

export class NotificationJob extends Model<NotificationJobAttributes, NotificationJobCreationAttributes> implements NotificationJobAttributes {
  declare public id: string;
  declare public notificationEventId: string;
  declare public recipientType: RecipientType;
  declare public recipientContact?: string;
  declare public recipientUserIds?: string[];
  declare public channel: NotificationChannel;
  declare public status: JobStatus;
  declare public retryCount: number;
  declare public maxRetries: number;
  declare public retryDelayMinutes: number;
  declare public nextRetryAt?: Date;
  declare public sentAt?: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

NotificationJob.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notificationEventId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'notification_event_id',
    },
    recipientType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'recipient_type',
    },
    recipientContact: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'recipient_contact',
    },
    recipientUserIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      field: 'recipient_user_ids',
    },
    channel: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'retry_count',
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'max_retries',
    },
    retryDelayMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'retry_delay_minutes',
    },
    nextRetryAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_retry_at',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at',
    },
  },
  {
    sequelize,
    tableName: 'notification_jobs',
    timestamps: true,
    indexes: [
      { fields: ['status', 'next_retry_at'] },
    ],
  }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type LogAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'CLIENT_DELETED'
  | 'YEAR_CREATED'
  | 'YEAR_DELETED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERSION_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_DELETED'
  | 'FILE_UPLOADED'
  | 'FILE_DOWNLOADED'
  | 'FILE_DELETED'
  | 'FILE_RENAMED'
  | 'FILE_MOVED'
  | 'FOLDER_CREATED'
  | 'FOLDER_DELETED'
  | 'FOLDER_RENAMED'
  | 'YEAR_FOLDER_CREATED'
  | 'WHATSAPP_MESSAGE'
  | 'TELEGRAM_MESSAGE'
  | 'ACCESS_DENIED'
  | 'PASSWORD_CHANGED';

export interface LogAttributes {
  id: string;
  userId?: string;
  action: LogAction;
  description: string;
  entityId?: string;
  entityType?: string;
  ip?: string;
  userAgent?: string;
  metadata?: object;
  createdAt?: Date;
}

export interface LogCreationAttributes extends Optional<LogAttributes, 'id' | 'userId' | 'ip' | 'userAgent' | 'metadata' | 'createdAt' | 'entityId' | 'entityType'> { }

export class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  declare public id: string;
  declare public userId?: string;
  declare public action: LogAction;
  declare public description: string;
  declare public entityId?: string;
  declare public entityType?: string;
  declare public ip?: string;
  declare public userAgent?: string;
  declare public metadata?: object;

  declare public readonly createdAt: Date;

  // Associations
  public readonly user?: any;
}

Log.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'entity_id',
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'entity_type',
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
    metadata: {
      type: process.env.DB_DIALECT === 'postgres' ? DataTypes.JSONB : DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'logs',
    timestamps: true,
    updatedAt: false, // Logs are immutable
    paranoid: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['created_at'] },
      { fields: ['entity_type', 'entity_id'] }, // Polymorphic lookup
      { fields: ['metadata'], using: 'gin' },
    ],
  }
);

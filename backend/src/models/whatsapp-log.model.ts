import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface WhatsAppLogAttributes {
  id: string;
  organizationId: string;
  clientId: string;
  entityType?: string;
  entityId?: string;
  messageType: string;
  twilioMessageSid?: string;
  phoneNumber: string;
  messageText: string;
  status: 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WhatsAppLogCreationAttributes extends Optional<WhatsAppLogAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class WhatsAppLog extends Model<WhatsAppLogAttributes, WhatsAppLogCreationAttributes> implements WhatsAppLogAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public clientId: string;
  declare public entityType?: string;
  declare public entityId?: string;
  declare public messageType: string;
  declare public twilioMessageSid?: string;
  declare public phoneNumber: string;
  declare public messageText: string;
  declare public status: 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';
  declare public errorMessage?: string;
  declare public sentAt?: Date;
  declare public deliveredAt?: Date;
  declare public readAt?: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

WhatsAppLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'organization_id',
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'client_id',
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
    messageType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'message_type',
    },
    twilioMessageSid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'twilio_message_sid',
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'phone_number',
    },
    messageText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message_text',
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at',
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivered_at',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
  },
  {
    sequelize,
    tableName: 'whatsapp_logs',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'client_id'] },
      { fields: ['entity_type', 'entity_id'] },
    ],
  }
);

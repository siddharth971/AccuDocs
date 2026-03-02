import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type EntityType = 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'CLIENT' | 'ORGANIZATION' | 'BRANCH';

export interface AuditLogAttributes {
  id: string;
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  action: string;
  changes: object;
  performedBy?: string;
  timestamp: Date;
  ipAddress?: string;
  reason?: string;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'timestamp'> { }

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public entityType: EntityType;
  declare public entityId: string;
  declare public action: string;
  declare public changes: object;
  declare public performedBy?: string;
  declare public timestamp: Date;
  declare public ipAddress?: string;
  declare public reason?: string;

  declare public readonly organization?: any;
  declare public readonly user?: any;
}

AuditLog.init(
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
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'entity_id',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'performed_by',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false, // We use 'timestamp' field manually
    indexes: [
      { fields: ['organization_id', 'entity_type', 'entity_id'] },
      { fields: ['organization_id', 'timestamp'] }, // For descending retrieval
    ],
  }
);

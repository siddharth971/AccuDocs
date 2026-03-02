import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'CREDIT_LIMIT_WARNING' | 'RISK_TREND' | 'REVENUE_DECLINE' | 'HIGH_VALUE_OVERDUE';

export interface PredictiveAlertAttributes {
  id: string;
  organizationId: string;
  clientId?: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  recommendedAction?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PredictiveAlertCreationAttributes extends Optional<PredictiveAlertAttributes, 'id' | 'isAcknowledged' | 'createdAt' | 'updatedAt'> { }

export class PredictiveAlert extends Model<PredictiveAlertAttributes, PredictiveAlertCreationAttributes> implements PredictiveAlertAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public clientId?: string;
  declare public alertType: AlertType;
  declare public severity: AlertSeverity;
  declare public message: string;
  declare public recommendedAction?: string;
  declare public isAcknowledged: boolean;
  declare public acknowledgedBy?: string;
  declare public acknowledgedAt?: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
  declare public readonly client?: any;
  declare public readonly acknowledger?: any;
}

PredictiveAlert.init(
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
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'clients', key: 'id' },
      field: 'client_id',
    },
    alertType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'alert_type',
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recommendedAction: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'recommended_action',
    },
    isAcknowledged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_acknowledged',
    },
    acknowledgedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'acknowledged_by',
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'acknowledged_at',
    },
  },
  {
    sequelize,
    tableName: 'predictive_alerts',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'is_acknowledged'] },
    ],
  }
);

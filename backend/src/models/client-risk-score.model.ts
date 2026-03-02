import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ClientRiskScoreAttributes {
  id: string;
  organizationId: string;
  clientId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: object;
  calculatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientRiskScoreCreationAttributes extends Optional<ClientRiskScoreAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class ClientRiskScore extends Model<ClientRiskScoreAttributes, ClientRiskScoreCreationAttributes> implements ClientRiskScoreAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public clientId: string;
  declare public riskScore: number;
  declare public riskLevel: RiskLevel;
  declare public factors: object;
  declare public calculatedAt: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
  declare public readonly client?: any;
}

ClientRiskScore.init(
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
      allowNull: false,
      references: { model: 'clients', key: 'id' },
      field: 'client_id',
    },
    riskScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'risk_score',
    },
    riskLevel: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'risk_level',
    },
    factors: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'calculated_at',
    },
  },
  {
    sequelize,
    tableName: 'client_risk_scores',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'client_id'] },
    ],
  }
);

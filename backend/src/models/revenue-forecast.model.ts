import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface RevenueForecastAttributes {
  id: string;
  organizationId: string;
  forecastMonth: string; // e.g., 'April 2024' or '2024-04'
  forecastedAmount: number;
  confidence: number;
  breakdown: object;
  generatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RevenueForecastCreationAttributes extends Optional<RevenueForecastAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class RevenueForecast extends Model<RevenueForecastAttributes, RevenueForecastCreationAttributes> implements RevenueForecastAttributes {
  declare public id: string;
  declare public organizationId: string;
  declare public forecastMonth: string;
  declare public forecastedAmount: number;
  declare public confidence: number;
  declare public breakdown: object;
  declare public generatedAt: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  declare public readonly organization?: any;
}

RevenueForecast.init(
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
    forecastMonth: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'forecast_month',
    },
    forecastedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'forecasted_amount',
    },
    confidence: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
    },
    breakdown: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'generated_at',
    },
  },
  {
    sequelize,
    tableName: 'revenue_forecasts',
    timestamps: true,
    indexes: [
      { fields: ['organization_id', 'forecast_month'] },
    ],
  }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface YearAttributes {
  id: string;
  year: string;
  clientId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface YearCreationAttributes extends Optional<YearAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class Year extends Model<YearAttributes, YearCreationAttributes> implements YearAttributes {
  declare public id: string;
  declare public year: string;
  declare public clientId: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  public readonly client?: any;
  public readonly documents?: any[];
}

Year.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    year: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        is: /^20[1-9][0-9]$/,
      },
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
  },
  {
    sequelize,
    tableName: 'years',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['client_id'] },
      { fields: ['year'] },
      {
        unique: true,
        fields: ['client_id', 'year'],
        name: 'unique_client_year',
      },
    ],
  }
);

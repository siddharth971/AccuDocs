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
  public id!: string;
  public year!: string;
  public clientId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
        is: /^20(2[1-9]|30)$/,
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

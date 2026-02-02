import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface ClientAttributes {
  id: string;
  code: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientCreationAttributes extends Optional<ClientAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  declare public id: string;
  declare public code: string;
  declare public userId: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  public readonly user?: any;
  public readonly years?: any[];
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20), // Increased length just in case
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'user_id',
    },
  },
  {
    sequelize,
    tableName: 'clients',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['user_id'] },
    ],
  }
);

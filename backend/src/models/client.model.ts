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
  public id!: string;
  public code!: string;
  public userId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[A-Z0-9]{2,10}$/,
      },
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

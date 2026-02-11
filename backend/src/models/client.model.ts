import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type ClientStatus = 'active' | 'inactive' | 'suspended';

export interface ClientAttributes {
  id: string;
  code: string;
  name: string; // Added name
  userId: string;
  status: ClientStatus;
  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ClientCreationAttributes extends Optional<ClientAttributes, 'id' | 'metadata' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  declare public id: string;
  declare public code: string;
  declare public name: string;
  declare public userId: string;
  declare public status: ClientStatus;
  declare public metadata?: object;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;


  // Associations
  declare public readonly user?: any;
  declare public readonly years?: any[];
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
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Unnamed Client', // Fallback for migration
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
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    metadata: {
      type: process.env.DB_DIALECT === 'postgres' ? DataTypes.JSONB : DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'clients',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['code'], unique: true, where: { deleted_at: null } },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['metadata'], using: 'gin' }, // GIN index for JSONB
    ],
  }
);

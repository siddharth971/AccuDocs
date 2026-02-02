import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type UserRole = 'admin' | 'client';

export interface UserAttributes {
  id: string;
  name: string;
  mobile: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'isActive' | 'lastLogin' | 'createdAt' | 'updatedAt'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public mobile!: string;
  public password?: string;
  public role!: UserRole;
  public isActive!: boolean;
  public lastLogin?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be added later
  public readonly clients?: any[];

  public toJSON(): object {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        is: /^\+?[1-9]\d{9,14}$/,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, // Clients don't have passwords
    },
    role: {
      type: DataTypes.ENUM('admin', 'client'),
      allowNull: false,
      defaultValue: 'client',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['mobile'], unique: true },
      { fields: ['role'] },
      { fields: ['is_active'] },
    ],
  }
);

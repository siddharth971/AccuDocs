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
  declare public id: string;
  declare public name: string;
  declare public mobile: string;
  declare public password?: string;
  declare public role: UserRole;
  declare public isActive: boolean;
  declare public lastLogin?: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;


  // Associations will be added later
  declare public readonly clients?: any[];

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
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
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

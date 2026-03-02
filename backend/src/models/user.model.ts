import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type UserRole = 'super_admin' | 'org_admin' | 'branch_manager' | 'invoicing_officer' | 'finance_manager' | 'accountant' | 'viewer' | 'admin' | 'client';

export interface UserAttributes {
  id: string;
  organizationId?: string;
  branchId?: string;
  name: string;
  email?: string;
  mobile: string;
  password?: string;
  mfaSecret?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'isActive' | 'lastLogin' | 'createdAt' | 'updatedAt'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare public id: string;
  declare public organizationId?: string;
  declare public branchId?: string;
  declare public name: string;
  declare public email: string;
  declare public mobile: string;
  declare public password?: string;
  declare public mfaSecret?: string;
  declare public role: UserRole;
  declare public isActive: boolean;
  declare public lastLogin?: Date;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;


  // Associations will be added later
  declare public readonly clients?: any[];

  public toJSON(): object {
    const values = { ...this.get() };
    delete values.password;
    delete values.mfaSecret; // Hide secret
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
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      field: 'organization_id',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id',
      },
      field: 'branch_id',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true, // Allow null for now to support existing users without email
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
      // unique: false - Multiple clients can share same mobile number
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true, // Clients don't have passwords
    },
    mfaSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'mfa_secret',
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'org_admin', 'branch_manager', 'invoicing_officer', 'finance_manager', 'accountant', 'viewer', 'admin', 'client'),
      allowNull: false,
      defaultValue: 'client',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Enable Soft Deletes
    indexes: [
      { fields: ['mobile'] }, // Not unique - multiple clients can share same mobile
      { fields: ['email'], unique: true, where: { deleted_at: null } }, // Partial index for soft delete
      { fields: ['role'] },
      { fields: ['is_active'] },
      { fields: ['organization_id'] },
      { fields: ['branch_id'] },
    ],
  }
);

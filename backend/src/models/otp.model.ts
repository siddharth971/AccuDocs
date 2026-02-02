import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface OTPAttributes {
  id: string;
  mobile: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OTPCreationAttributes extends Optional<OTPAttributes, 'id' | 'attempts' | 'createdAt' | 'updatedAt'> { }

export class OTP extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
  public id!: string;
  public mobile!: string;
  public otpHash!: string;
  public expiresAt!: Date;
  public attempts!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

OTP.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^\+?[1-9]\d{9,14}$/,
      },
    },
    otpHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'otp_hash',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: true,
    indexes: [
      { fields: ['mobile'] },
      { fields: ['expires_at'] },
    ],
  }
);

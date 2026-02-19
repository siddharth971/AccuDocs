import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface UploadTokenAttributes {
  id: string;
  token: string;
  checklistId: string;
  clientId: string;
  expiresAt: Date;
  isUsed: boolean;
  maxUploads: number;
  uploadCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UploadTokenCreationAttributes extends Optional<UploadTokenAttributes, 'id' | 'isUsed' | 'maxUploads' | 'uploadCount' | 'createdAt' | 'updatedAt'> { }

export class UploadToken extends Model<UploadTokenAttributes, UploadTokenCreationAttributes> implements UploadTokenAttributes {
  declare public id: string;
  declare public token: string;
  declare public checklistId: string;
  declare public clientId: string;
  declare public expiresAt: Date;
  declare public isUsed: boolean;
  declare public maxUploads: number;
  declare public uploadCount: number;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  public readonly checklist?: any;
  public readonly client?: any;
}

UploadToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'checklists',
        key: 'id',
      },
      field: 'checklist_id',
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_used',
    },
    maxUploads: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      field: 'max_uploads',
    },
    uploadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'upload_count',
    },
  },
  {
    sequelize,
    tableName: 'upload_tokens',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['token'] },
      { fields: ['checklist_id'] },
      { fields: ['client_id'] },
      { fields: ['expires_at'] },
    ],
  }
);

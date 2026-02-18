import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface DocumentAttributes {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  mimeType: string;
  size: number;
  yearId: string;
  uploadedBy: string;
  currentVersion: number;
  metadata?: object;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'metadata' | 'currentVersion' | 'deletedAt'> { }

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  declare public id: string;
  declare public fileName: string;
  declare public originalName: string;
  declare public s3Path: string;
  declare public mimeType: string;
  declare public size: number;
  declare public yearId: string;
  declare public uploadedBy: string;
  declare public currentVersion: number;
  declare public metadata?: object;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
  declare public readonly deletedAt?: Date;

  // Associations
  public readonly year?: any;
  public readonly uploader?: any;
  public readonly versions?: any[];
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_name',
    },
    s3Path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 's3_path',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    yearId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'years',
        key: 'id',
      },
      field: 'year_id',
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'uploaded_by',
    },
    currentVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'current_version',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: true,
    paranoid: true, // Enable Soft Deletes
    indexes: [
      { fields: ['year_id'] },
      { fields: ['uploaded_by'] },
      { fields: ['file_name'] },
      { fields: ['created_at'] },
      { fields: ['metadata'], using: 'gin' },
    ],
  }
);

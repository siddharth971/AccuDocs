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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: string;
  public fileName!: string;
  public originalName!: string;
  public s3Path!: string;
  public mimeType!: string;
  public size!: number;
  public yearId!: string;
  public uploadedBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly year?: any;
  public readonly uploader?: any;
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
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: true,
    indexes: [
      { fields: ['year_id'] },
      { fields: ['uploaded_by'] },
      { fields: ['file_name'] },
      { fields: ['created_at'] },
    ],
  }
);

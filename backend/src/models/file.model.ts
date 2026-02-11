import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export interface FileAttributes {
  id: string;
  fileName: string;
  originalName: string;
  s3Path: string;
  mimeType: string;
  size: number;
  folderId: string;
  uploadedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  declare public id: string;
  declare public fileName: string;
  declare public originalName: string;
  declare public s3Path: string;
  declare public mimeType: string;
  declare public size: number;
  declare public folderId: string;
  declare public uploadedBy: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  public readonly folder?: any;
  public readonly uploader?: any;
}

File.init(
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
    folderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'folders',
        key: 'id',
      },
      field: 'folder_id',
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
    tableName: 'files',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['folder_id'] },
      { fields: ['uploaded_by'] },
      { fields: ['file_name'] },
      { fields: ['original_name'] },
      { fields: ['created_at'] },
      { fields: ['mime_type'] },
    ],
  }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { Document } from './document.model';

export interface DocumentVersionAttributes {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  s3Path: string;
  checksum?: string;
  createdBy: string;
  createdAt?: Date;
}

export interface DocumentVersionCreationAttributes extends Optional<DocumentVersionAttributes, 'id' | 'createdAt' | 'checksum'> { }

export class DocumentVersion extends Model<DocumentVersionAttributes, DocumentVersionCreationAttributes> implements DocumentVersionAttributes {
  declare public id: string;
  declare public documentId: string;
  declare public versionNumber: number;
  declare public fileName: string;
  declare public s3Path: string;
  declare public checksum?: string;
  declare public createdBy: string;

  declare public readonly createdAt: Date;

  // Associations
  declare public readonly document?: Document;
}

DocumentVersion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'documents',
        key: 'id',
      },
      field: 'document_id',
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'version_number',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    s3Path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 's3_path',
    },
    checksum: {
      type: DataTypes.STRING(64), // SHA-256 length
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'created_by',
    },
  },
  {
    sequelize,
    tableName: 'document_versions',
    timestamps: true,
    updatedAt: false, // Immutable versions
    paranoid: false,
    deletedAt: false, // Versions shouldn't be soft deleted usually, but can be if we want full parity. I'll stick to immutable.
    indexes: [
      { fields: ['document_id'] },
      { fields: ['document_id', 'version_number'], unique: true },
    ],
  }
);

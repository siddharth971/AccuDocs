import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

export type FolderType = 'root' | 'documents' | 'years' | 'year';

export interface FolderAttributes {
  id: string;
  name: string;
  slug: string;
  type: FolderType;
  clientId: string;
  parentId: string | null;
  s3Prefix: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FolderCreationAttributes extends Optional<FolderAttributes, 'id' | 'parentId' | 'createdAt' | 'updatedAt'> { }

export class Folder extends Model<FolderAttributes, FolderCreationAttributes> implements FolderAttributes {
  declare public id: string;
  declare public name: string;
  declare public slug: string;
  declare public type: FolderType;
  declare public clientId: string;
  declare public parentId: string | null;
  declare public s3Prefix: string;

  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;

  // Associations
  public readonly client?: any;
  public readonly parent?: Folder;
  public readonly children?: Folder[];
  public readonly files?: any[];
}

Folder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('root', 'documents', 'years', 'year'),
      allowNull: false,
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'folders',
        key: 'id',
      },
      field: 'parent_id',
    },
    s3Prefix: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 's3_prefix',
    },
  },
  {
    sequelize,
    tableName: 'folders',
    timestamps: true,
    indexes: [
      { fields: ['client_id'] },
      { fields: ['parent_id'] },
      { fields: ['type'] },
      { fields: ['slug'] },
      {
        unique: true,
        fields: ['client_id', 'parent_id', 'name'],
        name: 'unique_folder_name_per_parent',
      },
    ],
  }
);

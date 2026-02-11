import { User } from './user.model';
import { Client } from './client.model';
import { Year } from './year.model';
import { Document } from './document.model';
import { OTP } from './otp.model';
import { Log } from './log.model';
import { Folder } from './folder.model';
import { File } from './file.model';
import { DocumentVersion } from './document-version.model';

// Define associations
export const initializeAssociations = (): void => {
  // User -> Client (One-to-One for client role users)
  User.hasOne(Client, {
    foreignKey: 'userId',
    as: 'clientProfile',
  });

  Client.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Client -> Year (One-to-Many) - Legacy support
  Client.hasMany(Year, {
    foreignKey: 'clientId',
    as: 'years',
  });

  Year.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // Year -> Document (One-to-Many) - Legacy support
  Year.hasMany(Document, {
    foreignKey: 'yearId',
    as: 'documents',
  });

  Document.belongsTo(Year, {
    foreignKey: 'yearId',
    as: 'year',
  });

  // User -> Document (One-to-Many - uploaded by) - Legacy support
  User.hasMany(Document, {
    foreignKey: 'uploadedBy',
    as: 'uploadedDocuments',
  });

  Document.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader',
  });

  // User -> Log (One-to-Many)
  User.hasMany(Log, {
    foreignKey: 'userId',
    as: 'logs',
  });

  Log.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // ========== NEW FOLDER SYSTEM ASSOCIATIONS ==========

  // Client -> Folder (One-to-Many)
  Client.hasMany(Folder, {
    foreignKey: 'clientId',
    as: 'folders',
  });

  Folder.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // Folder -> Folder (Self-referential for hierarchy)
  Folder.hasMany(Folder, {
    foreignKey: 'parentId',
    as: 'children',
  });

  Folder.belongsTo(Folder, {
    foreignKey: 'parentId',
    as: 'parent',
  });

  // Folder -> File (One-to-Many)
  Folder.hasMany(File, {
    foreignKey: 'folderId',
    as: 'files',
  });

  File.belongsTo(Folder, {
    foreignKey: 'folderId',
    as: 'folder',
  });

  // User -> File (One-to-Many - uploaded by)
  User.hasMany(File, {
    foreignKey: 'uploadedBy',
    as: 'uploadedFiles',
  });

  File.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader',
  });

  // Document -> DocumentVersion (One-to-Many)
  Document.hasMany(DocumentVersion, {
    foreignKey: 'documentId',
    as: 'versions',
  });

  DocumentVersion.belongsTo(Document, {
    foreignKey: 'documentId',
    as: 'document',
  });

  // User -> DocumentVersion (One-to-Many - created by)
  User.hasMany(DocumentVersion, {
    foreignKey: 'createdBy',
    as: 'createdVersions',
  });

  DocumentVersion.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
};

// Export all models
export { User } from './user.model';
export { Client } from './client.model';
export { Year } from './year.model';
export { Document } from './document.model';
export { OTP } from './otp.model';
export { Log } from './log.model';
export { Folder } from './folder.model';
export { File } from './file.model';
export { DocumentVersion } from './document-version.model';

// Export types
export type { UserAttributes, UserCreationAttributes, UserRole } from './user.model';
export type { ClientAttributes, ClientCreationAttributes } from './client.model';
export type { YearAttributes, YearCreationAttributes } from './year.model';
export type { DocumentAttributes, DocumentCreationAttributes } from './document.model';
export type { OTPAttributes, OTPCreationAttributes } from './otp.model';
export type { LogAttributes, LogCreationAttributes, LogAction } from './log.model';
export type { FolderAttributes, FolderCreationAttributes, FolderType } from './folder.model';
export type { FileAttributes, FileCreationAttributes } from './file.model';
export type { DocumentVersionAttributes, DocumentVersionCreationAttributes } from './document-version.model';

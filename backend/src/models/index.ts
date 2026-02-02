import { User } from './user.model';
import { Client } from './client.model';
import { Year } from './year.model';
import { Document } from './document.model';
import { OTP } from './otp.model';
import { Log } from './log.model';

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

  // Client -> Year (One-to-Many)
  Client.hasMany(Year, {
    foreignKey: 'clientId',
    as: 'years',
  });

  Year.belongsTo(Client, {
    foreignKey: 'clientId',
    as: 'client',
  });

  // Year -> Document (One-to-Many)
  Year.hasMany(Document, {
    foreignKey: 'yearId',
    as: 'documents',
  });

  Document.belongsTo(Year, {
    foreignKey: 'yearId',
    as: 'year',
  });

  // User -> Document (One-to-Many - uploaded by)
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
};

// Export all models
export { User } from './user.model';
export { Client } from './client.model';
export { Year } from './year.model';
export { Document } from './document.model';
export { OTP } from './otp.model';
export { Log } from './log.model';

// Export types
export type { UserAttributes, UserCreationAttributes, UserRole } from './user.model';
export type { ClientAttributes, ClientCreationAttributes } from './client.model';
export type { YearAttributes, YearCreationAttributes } from './year.model';
export type { DocumentAttributes, DocumentCreationAttributes } from './document.model';
export type { OTPAttributes, OTPCreationAttributes } from './otp.model';
export type { LogAttributes, LogCreationAttributes, LogAction } from './log.model';

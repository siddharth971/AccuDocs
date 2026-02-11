import { sequelize } from '../config/database.config';
import { logger } from '../utils/logger';

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connected to SQLite DB for manual schema update.');

    const queryInterface = sequelize.getQueryInterface();

    // 1. Update Users Table
    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN email TEXT;`);
      logger.info('Added users.email');
    } catch (e) { logger.error('Failed to add users.email', e); }

    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN mfa_secret TEXT;`);
      logger.info('Added users.mfa_secret');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN deleted_at DATETIME;`);
      logger.info('Added users.deleted_at');
    } catch (e) { }

    // 2. Update Clients Table
    try {
      await sequelize.query(`ALTER TABLE clients ADD COLUMN name TEXT DEFAULT 'Client';`);
      logger.info('Added clients.name');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE clients ADD COLUMN status TEXT DEFAULT 'active';`);
      logger.info('Added clients.status');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE clients ADD COLUMN metadata TEXT;`);
      logger.info('Added clients.metadata');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE clients ADD COLUMN deleted_at DATETIME;`);
      logger.info('Added clients.deleted_at');
    } catch (e) { }

    // 3. Update Documents Table
    try {
      await sequelize.query(`ALTER TABLE documents ADD COLUMN current_version INTEGER DEFAULT 1;`);
      logger.info('Added documents.current_version');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE documents ADD COLUMN metadata TEXT;`);
      logger.info('Added documents.metadata');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE documents ADD COLUMN deleted_at DATETIME;`);
      logger.info('Added documents.deleted_at');
    } catch (e) { }

    // 4. Update Logs Table
    try {
      await sequelize.query(`ALTER TABLE logs ADD COLUMN entity_id TEXT;`);
      logger.info('Added logs.entity_id');
    } catch (e) { }

    try {
      await sequelize.query(`ALTER TABLE logs ADD COLUMN entity_type TEXT;`);
      logger.info('Added logs.entity_type');
    } catch (e) { }

    // 5. Create DocumentVersions Table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS document_versions (
          id UUID PRIMARY KEY,
          document_id UUID NOT NULL REFERENCES documents(id),
          version_number INTEGER NOT NULL,
          file_name TEXT NOT NULL,
          s3_path TEXT NOT NULL,
          checksum TEXT,
          created_by UUID NOT NULL REFERENCES users(id),
          created_at DATETIME NOT NULL,
          UNIQUE(document_id, version_number)
        );
      `);
      logger.info('Created document_versions table');
    } catch (e) { logger.error('Failed to create document_versions table', e); }

    logger.info('✅ Manual SQLite schema update complete.');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Schema update failed:', error);
    process.exit(1);
  }
};

runMigration();
